import { Router } from 'express';
import { pool } from '../db/pool.js';
import { geometryRowToDto, siteRowToDto } from '../lib/dto.js';

export const sitesRouter = Router();

sitesRouter.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT site_id, slug, name, vernacular_name, state, district, historical_significance,
              representative_image_url, source_agency,
              ST_X(centroid) AS centroid_lng, ST_Y(centroid) AS centroid_lat
       FROM sites WHERE is_active = TRUE ORDER BY name`
    );
    res.json({ sites: result.rows.map(siteRowToDto) });
  } catch (err) {
    next(err);
  }
});

sitesRouter.get('/:slug', async (req, res, next) => {
  try {
    const siteResult = await pool.query(
      `SELECT site_id, slug, name, vernacular_name, state, district, historical_significance,
              representative_image_url, source_agency,
              ST_X(centroid) AS centroid_lng, ST_Y(centroid) AS centroid_lat
       FROM sites WHERE slug = $1 AND is_active = TRUE`,
      [req.params.slug]
    );
    if (siteResult.rowCount === 0) {
      return res.status(404).json({ error: 'not_found', message: `No site with slug "${req.params.slug}"`, requestId: req.id });
    }
    const site = siteRowToDto(siteResult.rows[0]);

    const geomResult = await pool.query(
      `SELECT geometry_id, site_id, tier, version_label, source_document_or_url, capture_date::text,
              limitation_note, governance_state, layer_confidence_score, ST_AsGeoJSON(geom) AS geojson
       FROM geometry_records
       WHERE site_id = $1 AND governance_state != 'RETIRED'
       ORDER BY tier`,
      [site.siteId]
    );

    const geometries: Record<string, unknown> = {};
    for (const row of geomResult.rows) {
      geometries[row.tier.toLowerCase()] = geometryRowToDto(row);
    }

    res.json({ site, geometries });
  } catch (err) {
    next(err);
  }
});
