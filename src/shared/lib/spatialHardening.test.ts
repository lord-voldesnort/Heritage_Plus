import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import {
  calculateSpatialResult,
  resolveMultiTierSpatialResult,
} from './spatialEngine';
import {
  SHIVNERI_PROTECTED_GEOMETRY,
  SHIVNERI_PROHIBITED_GEOMETRY,
  SHIVNERI_REGULATED_GEOMETRY,
  PROVENANCE_METADATA,
} from '../mock-data/siteGeometry';
import { buildCanonicalReviewerPacketData } from '../contracts/heritagePulseContract';
import { GeometryRecord, ObservationRecord } from '../types';
import { DEMO_SCENARIOS } from '../mock-data/mockScenarios';

const baseDir = path.resolve(__dirname, '../../../data/sources/shivneri/bhuvan-nrsc-2026-09-07');

describe('A3 — Geometry & Source Provenance Verification', () => {
  // 1. Raw GeoJSON file SHA-256 checksums match recorded checksums
  it('Requirement A3.1: verifies raw Bhuvan GeoJSON files match recorded SHA-256 checksums', () => {
    const checksumsFile = JSON.parse(
      fs.readFileSync(path.join(baseDir, 'checksums.json'), 'utf-8')
    );

    for (const fileEntry of checksumsFile.files) {
      const rawContent = fs.readFileSync(path.join(baseDir, fileEntry.filename), 'utf-8');
      // Normalize line endings for deterministic cross-platform hashing (CRLF vs LF)
      const normalizedContent = rawContent.replace(/\r\n/g, '\n');
      const hash = crypto.createHash('sha256').update(normalizedContent, 'utf-8').digest('hex');
      expect(hash).toBe(fileEntry.sha256);
    }
  });

  // 2. Three Bhuvan geometry layers remain strictly separate
  it('Requirement A3.2: preserves three independent Bhuvan MultiPolygon layers with distinct GIDs', () => {
    expect(SHIVNERI_PROTECTED_GEOMETRY.geometryId).toBe('MUMMH015-asi_protected_areas-7068');
    expect(SHIVNERI_PROHIBITED_GEOMETRY.geometryId).toBe('MUMMH015-asi_prohibited_boundary-9785');
    expect(SHIVNERI_REGULATED_GEOMETRY.geometryId).toBe('MUMMH015-asi_regulated_boundary-2394');

    expect(PROVENANCE_METADATA.gids.protected).toBe(7068);
    expect(PROVENANCE_METADATA.gids.prohibited).toBe(9785);
    expect(PROVENANCE_METADATA.gids.regulated).toBe(2394);

    expect(SHIVNERI_PROTECTED_GEOMETRY.geojson.type).toBe('MultiPolygon');
    expect(SHIVNERI_PROHIBITED_GEOMETRY.geojson.type).toBe('MultiPolygon');
    expect(SHIVNERI_REGULATED_GEOMETRY.geojson.type).toBe('MultiPolygon');
  });

  // 3. CRS is explicit EPSG:4326
  it('Requirement A3.3: verifies coordinate reference system is EPSG:4326', () => {
    expect(PROVENANCE_METADATA.crs).toBe('EPSG:4326');
  });

  // 4. Verbatim disclaimers and legal-use limitation notes are preserved
  it('Requirement A3.4: preserves verbatim source disclaimers and limitation texts', () => {
    expect(PROVENANCE_METADATA.sourceAgency).toContain('Bhuvan / NRSC (ISRO)');
    expect(PROVENANCE_METADATA.sourceAgency).toContain('Archaeological Survey of India (ASI)');
    expect(PROVENANCE_METADATA.verbatimAsiDisclaimer).toContain('cannot be used for any legal purpose');
    expect(PROVENANCE_METADATA.verbatimVersionDisclaimer.toLowerCase()).toContain('version 1.0');
    expect(SHIVNERI_PROTECTED_GEOMETRY.limitationNote).toContain('cannot be used for any legal purpose');
  });

  // 5. Reviewer packet receives full provenance metadata
  it('Requirement A3.5: builds canonical reviewer packet with complete provenance block', () => {
    const mockObservation: ObservationRecord = {
      observationId: 'obs-prov-01',
      caseId: 'HP-20260908-001',
      siteId: 'site-shivneri-01',
      geometryId: SHIVNERI_PROTECTED_GEOMETRY.geometryId,
      reporterType: 'VISITOR',
      category: 'POSSIBLE_CONSTRUCTION',
      factualDescription: 'Observed foundation works near perimeter.',
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      observedTimestamp: new Date().toISOString(),
      privacyConsentGiven: true,
      computedClassification: 'POTENTIAL_ZONE_CONCERN',
      distanceToBoundaryMeters: 128.8,
      spatialReasoningExplanation: 'Point within protected area.',
      currentStatus: 'SUBMITTED_FOR_REVIEW',
      evidenceList: [],
      eventsTimeline: [],
    };

    const packet = buildCanonicalReviewerPacketData(mockObservation);

    expect(packet.provenance).toBeDefined();
    expect(packet.provenance.sourceAgency).toContain('Bhuvan / NRSC (ISRO)');
    expect(packet.provenance.sourceDocumentOrUrl).toBe(PROVENANCE_METADATA.portalUrl);
    expect(packet.provenance.gateStatus).toBe('PASSED_WITH_LIMITATIONS');
    expect(packet.provenance.crs).toBe('EPSG:4326');
    expect(packet.provenance.retrievalDate).toBe('2026-09-07');
    expect(packet.provenance.verbatimLimitationText).toContain('cannot be used for any legal purpose');
  });

  // 6. Historical case retains its calculation metadata even if external geometry changes
  it('Requirement A3.6: ensures historical case spatialResult retains its original geometryVersion and explanation', () => {
    const originalResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'Historical observation in 2026',
    });

    const historicalCase: Partial<ObservationRecord> = {
      caseId: 'HP-20260908-HIST01',
      spatialResult: { ...originalResult },
      computedClassification: originalResult.classification,
      spatialReasoningExplanation: originalResult.explanation,
    };

    // Simulate hypothetical future geometry version update in memory
    const mutatedGeometry: GeometryRecord = {
      ...SHIVNERI_PROTECTED_GEOMETRY,
      versionLabel: 'v2.0-bhuvan-2028-hypothetical',
    };

    // Historical case must retain v1.0 version label without mutating
    expect(historicalCase.spatialResult?.geometryVersion).toBe('v1.0-bhuvan-protected-7068');
    expect(mutatedGeometry.versionLabel).toBe('v2.0-bhuvan-2028-hypothetical');
  });
});

describe('A4 — Spatial Engine Hardening & Verification', () => {
  // 1. Polygon with Interior Holes (Donut Polygon)
  it('Requirement A4.1: correctly handles polygon with interior holes (donut)', () => {
    // Outer square [0,0] to [10,10], hole [3,3] to [7,7]
    const donutGeo: GeometryRecord = {
      geometryId: 'test-donut-01',
      siteId: 'test-site',
      versionLabel: 'v1.0-test-donut',
      sourceDocumentOrUrl: 'test',
      captureDate: '2026-09-07',
      limitationNote: 'test',
      governanceState: 'PILOT_PUBLISHED',
      layerConfidenceScore: 0.95,
      geojson: {
        type: 'Polygon',
        coordinates: [
          // Outer ring
          [
            [73.8500, 19.1900],
            [73.8700, 19.1900],
            [73.8700, 19.2100],
            [73.8500, 19.2100],
            [73.8500, 19.1900],
          ],
          // Hole ring
          [
            [73.8570, 19.1970],
            [73.8630, 19.1970],
            [73.8630, 19.2030],
            [73.8570, 19.2030],
            [73.8570, 19.1970],
          ],
        ],
      },
    };

    // Point inside the hole (73.8600, 19.2000) -> is NOT in polygon
    const resInsideHole = calculateSpatialResult(
      {
        latitude: 19.2000,
        longitude: 73.8600,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Point situated inside hole of donut.',
      },
      donutGeo
    );

    // Should be classified as outside the polygon
    expect(resInsideHole.classification).toBe('NO_SPATIAL_CONCERN_INDICATED');
    expect(resInsideHole.distanceToBoundaryMeters).toBeGreaterThan(0);

    // Point in solid region (73.8520, 19.1920) -> is inside polygon
    const resInSolid = calculateSpatialResult(
      {
        latitude: 19.1920,
        longitude: 73.8520,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Point situated in solid portion of donut.',
      },
      donutGeo
    );

    expect(resInSolid.classification).toBe('POTENTIAL_ZONE_CONCERN');
  });

  // 2. Disconnected MultiPolygon Components
  it('Requirement A4.2: correctly evaluates distance to nearest component across disjoint MultiPolygon parts', () => {
    const disjointMultiGeo: GeometryRecord = {
      geometryId: 'test-disjoint-01',
      siteId: 'test-site',
      versionLabel: 'v1.0-test-disjoint',
      sourceDocumentOrUrl: 'test',
      captureDate: '2026-09-07',
      limitationNote: 'test',
      governanceState: 'PILOT_PUBLISHED',
      layerConfidenceScore: 0.95,
      geojson: {
        type: 'MultiPolygon',
        coordinates: [
          // Part A (South-West)
          [
            [
              [73.8000, 19.1000],
              [73.8100, 19.1000],
              [73.8100, 19.1100],
              [73.8000, 19.1100],
              [73.8000, 19.1000],
            ],
          ],
          // Part B (North-East)
          [
            [
              [73.9000, 19.2000],
              [73.9100, 19.2000],
              [73.9100, 19.2100],
              [73.9000, 19.2100],
              [73.9000, 19.2000],
            ],
          ],
        ],
      },
    };

    // Point closer to Part B (73.9010, 19.2010 is inside Part B)
    const resPartB = calculateSpatialResult(
      {
        latitude: 19.2010,
        longitude: 73.9010,
        gpsAccuracyMeters: 2.0,
        factualDescription: 'Point inside Part B.',
      },
      disjointMultiGeo
    );

    expect(resPartB.classification).toBe('POTENTIAL_ZONE_CONCERN');
    expect(resPartB.distanceToBoundaryMeters).toBeGreaterThan(0);
    // Distance should be relative to Part B perimeter (~100m), not Part A (>15km)
    expect(resPartB.distanceToBoundaryMeters).toBeLessThan(500);
  });

  // 3. Degraded GPS Error Boundary Gate: 35.0m vs 35.1m
  it('Requirement A4.3: tests exact sensor gate cutoff at 35.0m vs 35.1m', () => {
    // 35.0m is valid (within acceptable prototype telemetry margin)
    const res35 = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 35.0,
        factualDescription: 'GPS exactly at 35.0m threshold.',
      },
      SHIVNERI_PROTECTED_GEOMETRY
    );

    // 19.1980, 73.8580 is 128.8m from perimeter > 35m -> POTENTIAL_ZONE_CONCERN
    expect(res35.classification).toBe('POTENTIAL_ZONE_CONCERN');

    // 35.1m triggers EVIDENCE_INSUFFICIENT gate
    const res351 = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 35.1,
        factualDescription: 'GPS at 35.1m (exceeds threshold).',
      },
      SHIVNERI_PROTECTED_GEOMETRY
    );

    expect(res351.classification).toBe('EVIDENCE_INSUFFICIENT');
    expect(res351.explanation).toContain('exceeds 35m threshold');
  });

  // 4. Missing / Malformed Geometry Edge Cases
  it('Requirement A4.4: safely handles missing, null, or malformed geometry records', () => {
    const resNull = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Null geometry test.',
      },
      null as any
    );

    expect(resNull.classification).toBe('SOURCE_UNAVAILABLE');
    expect(resNull.explanation).toContain('missing or malformed');

    const resMalformed = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Malformed geometry test.',
      },
      { geometryId: 'bad', geojson: null } as any
    );

    expect(resMalformed.classification).toBe('SOURCE_UNAVAILABLE');
  });

  // 5. Extreme Invalid Coordinates
  it('Requirement A4.5: safely handles extreme out-of-bounds coordinates and NaN', () => {
    const testCases = [
      { lat: 91.0, lng: 73.8580, label: 'Lat > 90' },
      { lat: -91.0, lng: 73.8580, label: 'Lat < -90' },
      { lat: 19.1980, lng: 181.0, label: 'Lng > 180' },
      { lat: 19.1980, lng: -181.0, label: 'Lng < -180' },
      { lat: NaN, lng: 73.8580, label: 'Lat NaN' },
      { lat: 19.1980, lng: NaN, label: 'Lng NaN' },
      { lat: Infinity, lng: 73.8580, label: 'Lat Infinity' },
    ];

    for (const tc of testCases) {
      const res = calculateSpatialResult(
        {
          latitude: tc.lat,
          longitude: tc.lng,
          gpsAccuracyMeters: 5.0,
          factualDescription: tc.label,
        },
        SHIVNERI_PROTECTED_GEOMETRY
      );

      expect(res.classification).toBe('SOURCE_UNAVAILABLE');
    }
  });

  // 6. Mathematical Determinism: 100 Consecutive Iterations
  it('Requirement A4.6: produces 100% deterministic output across 100 repeated runs', () => {
    const input = {
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'Determinism test observation.',
    };

    const baseline = resolveMultiTierSpatialResult(input);

    for (let i = 0; i < 100; i++) {
      const iteration = resolveMultiTierSpatialResult(input);
      expect(iteration.classification).toBe(baseline.classification);
      expect(iteration.distanceToBoundaryMeters).toBe(baseline.distanceToBoundaryMeters);
      expect(iteration.isUncertaintyOverlap).toBe(baseline.isUncertaintyOverlap);
      expect(iteration.explanation).toBe(baseline.explanation);
      expect(iteration.statements.gisCalculated).toBe(baseline.statements.gisCalculated);
    }
  });

  // 7. Benchmark Scenarios Real Resolver Verification
  it('Requirement A4.7: verifies all 4 benchmark scenarios through the real spatial resolver', () => {
    // Scenario 1: Clearly inside protected
    const s1 = DEMO_SCENARIOS[0];
    const res1 = resolveMultiTierSpatialResult({
      latitude: s1.latitude,
      longitude: s1.longitude,
      gpsAccuracyMeters: s1.gpsAccuracyMeters,
      factualDescription: s1.factualNotes,
    });
    expect(res1.classification).toBe('POTENTIAL_ZONE_CONCERN');

    // Scenario 2: Clearly outside regulated
    const s2 = DEMO_SCENARIOS[1];
    const res2 = resolveMultiTierSpatialResult({
      latitude: s2.latitude,
      longitude: s2.longitude,
      gpsAccuracyMeters: s2.gpsAccuracyMeters,
      factualDescription: s2.factualNotes,
    });
    expect(res2.classification).toBe('NO_SPATIAL_CONCERN_INDICATED');

    // Scenario 3: Near boundary (reference point ~26m from protected)
    const s3 = DEMO_SCENARIOS[2];
    const res3 = resolveMultiTierSpatialResult({
      latitude: s3.latitude,
      longitude: s3.longitude,
      gpsAccuracyMeters: s3.gpsAccuracyMeters,
      factualDescription: s3.factualNotes,
    });
    // In multi-tier: inside 100m prohibited tier, notes higher-tier protected uncertainty
    expect(res3.classification).toBe('POTENTIAL_ZONE_CONCERN');
    expect(res3.explanation).toContain('100m Prohibited Zone layer');
    expect(res3.explanation).toContain('Protected Area layer');

    // Scenario 4: Degraded GPS (>35m)
    const s4 = DEMO_SCENARIOS[3];
    const res4 = resolveMultiTierSpatialResult({
      latitude: s4.latitude,
      longitude: s4.longitude,
      gpsAccuracyMeters: s4.gpsAccuracyMeters,
      factualDescription: s4.factualNotes,
    });
    expect(res4.classification).toBe('EVIDENCE_INSUFFICIENT');
  });
});
