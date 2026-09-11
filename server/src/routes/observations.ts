import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import {
  evidenceRowToDto,
  observationRowToDto,
  reviewEventRowToDto,
  type EvidenceRow,
  type ObservationRow,
  type ReviewEventRow,
} from '../lib/dto.js';
import { generateNextCaseId } from '../lib/caseId.js';
import { resolveMultiTierSpatialResult, type GeometryRecordLike } from '../lib/spatialEngine.js';
import { storeEvidenceFile, UnsupportedFileTypeError } from '../lib/storage.js';
import { CASE_STATUSES, isClosedStatus, isClosureAction } from '../lib/caseStatuses.js';
import { requireAuth, requireRole } from '../lib/rbac.js';

export const observationsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024) },
});

const OBSERVATION_TYPES = [
  'POSSIBLE_CONSTRUCTION', 'POSSIBLE_ENCROACHMENT', 'PHYSICAL_DAMAGE',
  'DUMPING_OR_WASTE', 'BLOCKED_ACCESS', 'ALTERATION_OR_OBSTRUCTION', 'OTHER_VISIBLE_CHANGE',
] as const;
const REPORTER_TYPES = ['VISITOR', 'RESIDENT', 'STUDENT', 'VOLUNTEER'] as const;

const createSchema = z.object({
  siteId: z.string().min(1),
  category: z.enum(OBSERVATION_TYPES),
  factualDescription: z.string().min(1).max(4000),
  latitude: z.coerce.number().gte(-90).lte(90),
  longitude: z.coerce.number().gte(-180).lte(180),
  gpsAccuracyMeters: z.coerce.number().gte(0),
  reporterType: z.enum(REPORTER_TYPES).optional().default('VISITOR'),
  isDemoScenario: z.coerce.boolean().optional().default(false),
});

/** Load the 3 geometry tiers used by the multi-tier spatial engine, fresh from PostGIS. */
async function loadSiteTiers(siteId: string): Promise<Record<'PROTECTED' | 'PROHIBITED' | 'REGULATED', GeometryRecordLike> | null> {
  const result = await pool.query(
    `SELECT geometry_id, tier, version_label, governance_state, layer_confidence_score, ST_AsGeoJSON(geom) AS geojson
     FROM geometry_records
     WHERE site_id = $1 AND tier IN ('PROTECTED', 'PROHIBITED', 'REGULATED') AND governance_state != 'RETIRED'`,
    [siteId]
  );
  const byTier: Record<string, GeometryRecordLike> = {};
  for (const row of result.rows) {
    byTier[row.tier] = {
      geometryId: row.geometry_id,
      versionLabel: row.version_label,
      governanceState: row.governance_state,
      layerConfidenceScore: Number(row.layer_confidence_score),
      geojson: JSON.parse(row.geojson),
    };
  }
  if (!byTier.PROTECTED || !byTier.PROHIBITED || !byTier.REGULATED) return null;
  return byTier as Record<'PROTECTED' | 'PROHIBITED' | 'REGULATED', GeometryRecordLike>;
}

async function loadEvidenceAndEvents(observationIds: string[], caseIds: string[]) {
  const evidenceByObsId = new Map<string, ReturnType<typeof evidenceRowToDto>[]>();
  const eventsByCaseId = new Map<string, ReturnType<typeof reviewEventRowToDto>[]>();

  if (observationIds.length > 0) {
    const evidenceResult = await pool.query<EvidenceRow>(
      `SELECT * FROM evidence_records WHERE observation_id = ANY($1) ORDER BY upload_timestamp`,
      [observationIds]
    );
    for (const row of evidenceResult.rows) {
      const dto = evidenceRowToDto(row);
      const list = evidenceByObsId.get(row.observation_id) || [];
      list.push(dto);
      evidenceByObsId.set(row.observation_id, list);
    }
  }

  if (caseIds.length > 0) {
    const eventsResult = await pool.query<ReviewEventRow>(
      `SELECT * FROM review_events WHERE case_id = ANY($1) ORDER BY event_timestamp`,
      [caseIds]
    );
    for (const row of eventsResult.rows) {
      const dto = reviewEventRowToDto(row);
      const list = eventsByCaseId.get(row.case_id) || [];
      list.push(dto);
      eventsByCaseId.set(row.case_id, list);
    }
  }

  return { evidenceByObsId, eventsByCaseId };
}

// ---------------------------------------------------------------------------
// GET /api/observations — list with filters (mirrors LedgerStore.getCases)
// ---------------------------------------------------------------------------
observationsRouter.get('/', async (req, res, next) => {
  try {
    const { category, status, classification, q } = req.query;
    const pagination = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(50) }).safeParse(req.query);
    if (!pagination.success) {
      return res.status(400).json({ error: 'invalid_pagination', message: pagination.error.message, requestId: req.id });
    }
    const { page, pageSize } = pagination.data;
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (typeof category === 'string') {
      params.push(category);
      clauses.push(`category = $${params.length}`);
    }
    if (typeof status === 'string') {
      params.push(status);
      clauses.push(`current_status = $${params.length}`);
    }
    if (typeof classification === 'string') {
      params.push(classification);
      clauses.push(`computed_classification = $${params.length}`);
    }
    if (typeof q === 'string' && q.trim()) {
      params.push(`%${q.trim().toLowerCase()}%`);
      clauses.push(`(LOWER(case_id) LIKE $${params.length} OR LOWER(factual_description) LIKE $${params.length} OR LOWER(category::text) LIKE $${params.length})`);
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const countResult = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM observation_records ${where}`, params);
    const dataParams = [...params, pageSize, (page - 1) * pageSize];
    const result = await pool.query<ObservationRow>(
      `SELECT observation_id, case_id, site_id, geometry_id, reporter_type, category, factual_description,
              ST_X(coordinate) AS longitude, ST_Y(coordinate) AS latitude, gps_accuracy_meters,
              observed_timestamp, privacy_consent_given, computed_classification,
              distance_to_boundary_meters, spatial_reasoning_explanation, spatial_result, current_status
       FROM observation_records ${where}
       ORDER BY observed_timestamp DESC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams
    );

    const observationIds = result.rows.map((r) => r.observation_id);
    const caseIds = result.rows.map((r) => r.case_id);
    const { evidenceByObsId, eventsByCaseId } = await loadEvidenceAndEvents(observationIds, caseIds);

    const cases = result.rows.map((r) =>
      observationRowToDto(r, evidenceByObsId.get(r.observation_id) || [], eventsByCaseId.get(r.case_id) || [])
    );
    const total = Number(countResult.rows[0]?.count || 0);
    res.json({ cases, pagination: { page, pageSize, total, hasNextPage: page * pageSize < total } });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/observations/nearby — real PostGIS radius search (ST_DWithin on geography)
// ---------------------------------------------------------------------------
observationsRouter.get('/nearby', async (req, res, next) => {
  try {
    const parsed = z
      .object({ lng: z.coerce.number().gte(-180).lte(180), lat: z.coerce.number().gte(-90).lte(90), radiusMeters: z.coerce.number().gt(0).max(50000).default(300) })
      .safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_query', message: parsed.error.message, requestId: req.id });
    }
    const { lng, lat, radiusMeters } = parsed.data;

    const result = await pool.query(
      `SELECT case_id, category, current_status,
              ST_Distance(coordinate::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance_meters
       FROM observation_records
       WHERE ST_DWithin(coordinate::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
       ORDER BY distance_meters ASC`,
      [lng, lat, radiusMeters]
    );

    res.json({
      query: { lng, lat, radiusMeters },
      results: result.rows.map((r) => ({
        caseId: r.case_id,
        category: r.category,
        currentStatus: r.current_status,
        distanceMeters: Math.round(Number(r.distance_meters) * 10) / 10,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/observations/:caseId
// ---------------------------------------------------------------------------
observationsRouter.get('/:caseId', async (req, res, next) => {
  try {
    const result = await pool.query<ObservationRow>(
      `SELECT observation_id, case_id, site_id, geometry_id, reporter_type, category, factual_description,
              ST_X(coordinate) AS longitude, ST_Y(coordinate) AS latitude, gps_accuracy_meters,
              observed_timestamp, privacy_consent_given, computed_classification,
              distance_to_boundary_meters, spatial_reasoning_explanation, spatial_result, current_status
       FROM observation_records WHERE LOWER(case_id) = LOWER($1)`,
      [req.params.caseId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'not_found', message: `No case with id "${req.params.caseId}"`, requestId: req.id });
    }
    const row = result.rows[0];
    const { evidenceByObsId, eventsByCaseId } = await loadEvidenceAndEvents([row.observation_id], [row.case_id]);
    res.json({
      case: observationRowToDto(row, evidenceByObsId.get(row.observation_id) || [], eventsByCaseId.get(row.case_id) || []),
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/observations — create a case. Runs the AUTHORITATIVE spatial
// engine server-side against geometry freshly loaded from PostGIS; the
// client's own preview classification (if any) is never trusted or stored.
// Accepts multipart/form-data so an optional evidence photo can be attached
// atomically with the observation.
// ---------------------------------------------------------------------------
observationsRouter.post('/', upload.single('photo'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'validation_failed', message: parsed.error.issues.map((i) => i.message).join('; '), requestId: req.id });
    }
    const data = parsed.data;

    const tiers = await loadSiteTiers(data.siteId);
    if (!tiers) {
      return res.status(422).json({
        error: 'geometry_unavailable',
        message: 'Source geometry gate is unavailable or retired for this site. Contact GIS administrator.',
        requestId: req.id,
      });
    }

    const spatialResult = resolveMultiTierSpatialResult(
      {
        latitude: data.latitude,
        longitude: data.longitude,
        gpsAccuracyMeters: data.gpsAccuracyMeters,
        factualDescription: data.factualDescription,
      },
      { protected: tiers.PROTECTED, prohibited: tiers.PROHIBITED, regulated: tiers.REGULATED }
    );

    // Resolve which tier's geometry actually produced the classification, for provenance.
    const matchedTier =
      Object.values(tiers).find((t) => t.versionLabel === spatialResult.geometryVersion) || tiers.PROTECTED;

    const caseId = await generateNextCaseId('MH');
    const now = new Date().toISOString();

    await client.query('BEGIN');

    const insertResult = await client.query<{ observation_id: string }>(
      `INSERT INTO observation_records
         (case_id, site_id, geometry_id, reporter_type, category, factual_description,
          coordinate, gps_accuracy_meters, observed_timestamp, privacy_consent_given,
          computed_classification, distance_to_boundary_meters, spatial_reasoning_explanation,
          spatial_result, current_status, is_demo_scenario)
       VALUES ($1, $2, $3, $4, $5, $6,
               ST_SetSRID(ST_MakePoint($7, $8), 4326), $9, $10, TRUE,
               $11, $12, $13, $14, 'SUBMITTED_FOR_REVIEW', $15)
       RETURNING observation_id`,
      [
        caseId, data.siteId, matchedTier.geometryId, data.reporterType, data.category, data.factualDescription,
        data.longitude, data.latitude, data.gpsAccuracyMeters, now,
        spatialResult.classification, spatialResult.distanceToBoundaryMeters, spatialResult.explanation,
        JSON.stringify(spatialResult), data.isDemoScenario,
      ]
    );
    const observationId = insertResult.rows[0].observation_id;

    const events: { type: string; actor: string; summary: string; status: string }[] = [
      { type: 'OBSERVATION_CREATED', actor: data.reporterType, summary: `Field observation logged for category: ${data.category}`, status: 'DRAFT' },
      { type: 'LOCATION_CAPTURED', actor: 'Device Hardware Sensor', summary: `GPS coordinates captured: (${data.latitude.toFixed(4)}\u00b0N, ${data.longitude.toFixed(4)}\u00b0E) with \u00b1${data.gpsAccuracyMeters.toFixed(1)}m accuracy.`, status: 'DRAFT' },
      { type: 'SPATIAL_CALCULATED', actor: 'Spatial Reasoning Engine', summary: `Spatial reasoning completed: ${spatialResult.classification}. Distance: ${spatialResult.distanceToBoundaryMeters !== null ? `${spatialResult.distanceToBoundaryMeters}m` : 'N/A'}.`, status: 'DRAFT' },
      { type: 'REVIEW_ACTION_RECORDED', actor: 'Change Ledger Dispatcher', summary: 'Case logged into append-only Change Ledger. Submitted for reviewer triage.', status: 'SUBMITTED_FOR_REVIEW' },
    ];
    for (const ev of events) {
      await client.query(
        `INSERT INTO review_events (case_id, event_type, actor_role, summary, resulting_status) VALUES ($1, $2, $3, $4, $5)`,
        [caseId, ev.type, ev.actor, ev.summary, ev.status]
      );
    }

    if (req.file) {
      let stored;
      try {
        stored = await storeEvidenceFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      } catch (e) {
        if (e instanceof UnsupportedFileTypeError) {
          await client.query('ROLLBACK');
          return res.status(422).json({ error: 'unsupported_file_type', message: e.message, requestId: req.id });
        }
        throw e;
      }
      await client.query(
        `INSERT INTO evidence_records (observation_id, file_url, file_mime_type, file_size_bytes, sha256_checksum)
         VALUES ($1, $2, $3, $4, $5)`,
        [observationId, stored.fileUrl, stored.fileMimeType, stored.fileSizeBytes, stored.sha256Checksum]
      );
      await client.query(
        `INSERT INTO review_events (case_id, event_type, actor_role, summary, resulting_status)
         VALUES ($1, 'EVIDENCE_ATTACHED', 'Field Reporter', $2, 'SUBMITTED_FOR_REVIEW')`,
        [caseId, `Photographic evidence attached (SHA-256: ${stored.sha256Checksum.slice(0, 16)}\u2026).`]
      );
    }

    await client.query('COMMIT');

    // Re-read the fully assembled record for the response.
    const finalResult = await pool.query<ObservationRow>(
      `SELECT observation_id, case_id, site_id, geometry_id, reporter_type, category, factual_description,
              ST_X(coordinate) AS longitude, ST_Y(coordinate) AS latitude, gps_accuracy_meters,
              observed_timestamp, privacy_consent_given, computed_classification,
              distance_to_boundary_meters, spatial_reasoning_explanation, spatial_result, current_status
       FROM observation_records WHERE observation_id = $1`,
      [observationId]
    );
    const row = finalResult.rows[0];
    const { evidenceByObsId, eventsByCaseId } = await loadEvidenceAndEvents([observationId], [caseId]);
    res.status(201).json({
      case: observationRowToDto(row, evidenceByObsId.get(observationId) || [], eventsByCaseId.get(caseId) || []),
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// POST /api/observations/:caseId/review — record a reviewer decision.
// Enforces the same governance rules the frontend previously only enforced
// cosmetically in the browser (closed-case protection, REFERRED freeze) —
// here they are actually authoritative, since the client can no longer be
// trusted to self-police these rules.
// ---------------------------------------------------------------------------
// POST /api/observations/:caseId/review — record a reviewer decision.
// Requires an authenticated REVIEWER/ADMIN session. The reviewer's identity
// and "authority" standing (ADMIN can act on closed/referred cases) are
// derived from the server-side session, not from client-supplied text —
// previously `reviewerRole` was a free-text field the client could set to
// anything, including strings that spoofed authority-level permissions.
const reviewSchema = z.object({
  action: z.string().min(1),
  notes: z.string().max(4000).optional().default(''),
  actionTitle: z.string().max(200).optional(),
  eventType: z.enum(['REVIEW_ACTION_RECORDED', 'INFO_REQUESTED', 'STATUS_UPDATED', 'CASE_CLOSED']).optional().default('REVIEW_ACTION_RECORDED'),
});

observationsRouter.post('/:caseId/review', requireAuth, requireRole('REVIEWER', 'ADMIN'), async (req, res, next) => {
  try {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'validation_failed', message: parsed.error.issues.map((i) => i.message).join('; '), requestId: req.id });
    }
    const { action, notes, actionTitle, eventType } = parsed.data;
    const actor = req.session.user!; // requireAuth guarantees this is set
    const reviewerRole = `${actor.displayName} (${actor.role})`;
    const isAuthorityActor = actor.role === 'ADMIN';

    if (!CASE_STATUSES.has(action)) {
      return res.status(400).json({ error: 'invalid_action', message: `Unknown case status action: ${action}`, requestId: req.id });
    }

    const caseResult = await pool.query<{ case_id: string; current_status: string }>(
      `SELECT case_id, current_status FROM observation_records WHERE LOWER(case_id) = LOWER($1)`,
      [req.params.caseId]
    );
    if (caseResult.rowCount === 0) {
      return res.status(404).json({ error: 'not_found', message: `No case with id "${req.params.caseId}"`, requestId: req.id });
    }
    const current = caseResult.rows[0];

    if (isClosedStatus(current.current_status) && !isAuthorityActor) {
      return res.status(409).json({
        error: 'case_closed',
        message: `Case ${current.case_id} is closed (${current.current_status}); only an ADMIN may act on it further.`,
        requestId: req.id,
      });
    }
    if (current.current_status === 'REFERRED' && !isClosureAction(action) && !isAuthorityActor) {
      return res.status(409).json({
        error: 'case_referred',
        message: `Case ${current.case_id} is referred to the competent authority; frontline triage is frozen.`,
        requestId: req.id,
      });
    }

    const summary = actionTitle
      ? `${actionTitle}: ${notes}`
      : `Reviewer recorded action: ${CASE_STATUSES.get(action)?.label || action}`;

    await pool.query('BEGIN');
    await pool.query(`UPDATE observation_records SET current_status = $1 WHERE case_id = $2`, [action, current.case_id]);
    const insertResult = await pool.query<ReviewEventRow>(
      `INSERT INTO review_events (case_id, event_type, actor_role, summary, action_taken, reviewer_notes, title, resulting_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [current.case_id, eventType, reviewerRole, summary, action, notes || null, actionTitle || null, action]
    );
    await pool.query('COMMIT');

    const finalResult = await pool.query<ObservationRow>(
      `SELECT observation_id, case_id, site_id, geometry_id, reporter_type, category, factual_description,
              ST_X(coordinate) AS longitude, ST_Y(coordinate) AS latitude, gps_accuracy_meters,
              observed_timestamp, privacy_consent_given, computed_classification,
              distance_to_boundary_meters, spatial_reasoning_explanation, spatial_result, current_status
       FROM observation_records WHERE case_id = $1`,
      [current.case_id]
    );
    const row = finalResult.rows[0];
    const { evidenceByObsId, eventsByCaseId } = await loadEvidenceAndEvents([row.observation_id], [row.case_id]);
    res.json({
      case: observationRowToDto(row, evidenceByObsId.get(row.observation_id) || [], eventsByCaseId.get(row.case_id) || []),
      newEvent: reviewEventRowToDto(insertResult.rows[0]),
    });
  } catch (err) {
    await pool.query('ROLLBACK').catch(() => {});
    next(err);
  }
});
