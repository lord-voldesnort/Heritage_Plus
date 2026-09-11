import { describe, it, expect } from 'vitest';
import { calculateSpatialResult, resolveMultiTierSpatialResult } from './spatialEngine';
import { SHIVNERI_GEOMETRY } from '../mock-data/mockSite';
import {
  SHIVNERI_PROTECTED_GEOMETRY,
  SHIVNERI_PROHIBITED_GEOMETRY,
  SHIVNERI_REGULATED_GEOMETRY,
} from '../mock-data/siteGeometry';
import { containsBannedLanguage } from '../constants/bannedLanguage';
import { OBSERVATION_CATEGORIES } from '../constants/categories';
import { CASE_STATUSES } from '../constants/caseStatuses';
import { SPATIAL_CLASSIFICATIONS } from '../constants/spatialClassifications';
import { GeometryRecord } from '../types';

const SHIVNERI_LAYERS = {
  protected: SHIVNERI_PROTECTED_GEOMETRY,
  prohibited: SHIVNERI_PROHIBITED_GEOMETRY,
  regulated: SHIVNERI_REGULATED_GEOMETRY,
};

describe('Spatial Reasoning Engine (Real Bhuvan Shivneri Geometry)', () => {
  it('Scenario 1: correctly classifies point clearly inside zone as POTENTIAL_ZONE_CONCERN', () => {
    const result = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
        factualDescription: 'Stone masonry foundation work near gateway.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
    // Interior point distance to nearest protected boundary is ~128.8m (not hardcoded 0.0)
    expect(result.distanceToBoundaryMeters).toBeCloseTo(128.8, 1);
    expect(result.isUncertaintyOverlap).toBe(false);
    expect(result.statements.gisCalculated).toContain('falls within');
  });

  it('Scenario 2: correctly classifies point clearly outside zone as NO_SPATIAL_CONCERN_INDICATED', () => {
    const result = calculateSpatialResult(
      {
        latitude: 19.2085,
        longitude: 73.8750,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Hoarding on approach road 200m away.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(result.classification).toBe('NO_SPATIAL_CONCERN_INDICATED');
    expect(result.distanceToBoundaryMeters).toBeGreaterThan(0);
    expect(result.isUncertaintyOverlap).toBe(false);
  });

  it('Scenario 3: refuses to overclaim and returns LOCATION_UNCERTAIN when GPS error disk overlaps boundary (real reference coordinate)', () => {
    const result = calculateSpatialResult(
      {
        latitude: 19.1931225,
        longitude: 73.8528893,
        gpsAccuracyMeters: 30.0,
        factualDescription: 'Displaced masonry near boundary stone.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(result.classification).toBe('LOCATION_UNCERTAIN');
    expect(result.isUncertaintyOverlap).toBe(true);
    expect(result.explanation).toContain('Location uncertain');
  });

  it('Scenario 4: flags EVIDENCE_INSUFFICIENT when GPS error exceeds 35m threshold', () => {
    const result = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 46.0,
        factualDescription: 'Debris noted in deep rock crevice.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(result.classification).toBe('EVIDENCE_INSUFFICIENT');
    expect(result.explanation).toContain('exceeds 35m threshold');
  });
});

describe('Multi-Tier Spatial Resolution (Protected, Prohibited, Regulated)', () => {
  it('1. Multi-tier resolution: point inside prohibited but outside protected resolves to prohibited tier', () => {
    const result = resolveMultiTierSpatialResult(
      {
        latitude: 19.1931225,
        longitude: 73.8528893,
        gpsAccuracyMeters: 5.0, // High accuracy (±5m), so no uncertainty overlap
        factualDescription: 'Observation near western wall approach.',
      },
      SHIVNERI_LAYERS
    );

    expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
    expect(result.explanation).toContain('100m Prohibited Zone layer');
    expect(result.statements.gisCalculated).toContain('100m Prohibited Boundary');
  });

  it('2. Multi-tier resolution: point inside regulated only resolves to regulated tier', () => {
    // Point at 19.1950, 73.8500 (inside regulated 300m boundary, 117m from prohibited)
    const result = resolveMultiTierSpatialResult(
      {
        latitude: 19.1950,
        longitude: 73.8500,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Signboard installation on lower access road.',
      },
      SHIVNERI_LAYERS
    );

    expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
    expect(result.explanation).toContain('300m Regulated Zone layer');
  });

  it('3. Higher-tier uncertainty + lower-tier confident finding', () => {
    // Reference point is ~26m outside Protected area boundary.
    // At ±30.0m GPS accuracy, the error circle intersects Protected boundary (LOCATION_UNCERTAIN for Protected),
    // but the point is confidently inside Prohibited boundary.
    const result = resolveMultiTierSpatialResult(
      {
        latitude: 19.1931225,
        longitude: 73.8528893,
        gpsAccuracyMeters: 30.0,
        factualDescription: 'Masonry materials near perimeter.',
      },
      SHIVNERI_LAYERS
    );

    // 1. Primary classification remains lower-tier confident finding
    expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');

    // 2. Explanation contains lower-tier finding AND higher-tier uncertainty note
    expect(result.explanation).toContain('100m Prohibited Zone layer');
    expect(result.explanation).toContain('Note: The relationship to the more restrictive Protected Area layer');
    expect(result.explanation).toContain('could not be reliably determined due to GPS accuracy');

    // 3. Explanation contains ZERO legal or accusatory terms
    const textToTest = result.explanation.toLowerCase();
    const bannedPhrases = ['il' + 'legal', 'violation ' + 'confirmed', 'gui' + 'lty', 'encro' + 'acher', 'dem' + 'olition'];
    bannedPhrases.forEach(phrase => {
      expect(textToTest).not.toContain(phrase);
    });
  });

  it('4. Exact boundary point (distance 0m or on boundary line)', () => {
    const result = calculateSpatialResult(
      {
        latitude: 19.19414318,
        longitude: 73.86279634,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Marker placed exactly on vertex coordinate.',
      },
      SHIVNERI_PROTECTED_GEOMETRY
    );

    // Distance to boundary vertex is 0.0m <= 5.0m GPS accuracy -> LOCATION_UNCERTAIN
    expect(result.classification).toBe('LOCATION_UNCERTAIN');
    expect(result.distanceToBoundaryMeters).toBeLessThanOrEqual(5.0);
  });

  it('5. Minimum distance correctness across MultiPolygon components', () => {
    // Create a MultiPolygon with two distinct polygons
    const multiPolyGeo: GeometryRecord = {
      ...SHIVNERI_PROTECTED_GEOMETRY,
      versionLabel: 'v1.0-test-multi',
      geojson: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [70.0, 10.0],
              [71.0, 10.0],
              [71.0, 11.0],
              [70.0, 11.0],
              [70.0, 10.0],
            ],
          ],
          [
            [
              [80.0, 20.0],
              [81.0, 20.0],
              [81.0, 21.0],
              [80.0, 21.0],
              [80.0, 20.0],
            ],
          ],
        ],
      },
    };

    // Point close to 2nd polygon (80.5, 20.1) but far from 1st (70.5, 10.5)
    const result = calculateSpatialResult(
      {
        latitude: 20.1,
        longitude: 80.5,
        gpsAccuracyMeters: 2.0,
        factualDescription: 'Test point near 2nd polygon component.',
      },
      multiPolyGeo
    );

    expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
    expect(result.distanceToBoundaryMeters).toBeCloseTo(11041.5, 1);
  });

  it('6. Invalid input coordinates (NaN or out of bounds lat/lon)', () => {
    const resNaN = calculateSpatialResult(
      {
        latitude: NaN,
        longitude: 73.8580,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Invalid NaN latitude test.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(resNaN.classification).toBe('SOURCE_UNAVAILABLE');
    expect(resNaN.explanation).toContain('invalid or outside valid WGS 84 bounds');

    const resOut = calculateSpatialResult(
      {
        latitude: 100.0,
        longitude: 200.0,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Out of bounds coordinate test.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(resOut.classification).toBe('SOURCE_UNAVAILABLE');
  });

  it('7. Negative GPS accuracy input', () => {
    const result = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: -5.0,
        factualDescription: 'Negative GPS accuracy test.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(result.classification).toBe('EVIDENCE_INSUFFICIENT');
    expect(result.explanation).toContain('invalid or non-finite');
  });

  it('8. Non-finite GPS accuracy input (NaN, Infinity)', () => {
    const resNaN = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: NaN,
        factualDescription: 'NaN GPS accuracy test.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(resNaN.classification).toBe('EVIDENCE_INSUFFICIENT');

    const resInf = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: Infinity,
        factualDescription: 'Infinity GPS accuracy test.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(resInf.classification).toBe('EVIDENCE_INSUFFICIENT');
  });

  it('9. Source unavailable due to low confidence score (< 0.70)', () => {
    const lowConfidenceGeo: GeometryRecord = {
      ...SHIVNERI_GEOMETRY,
      layerConfidenceScore: 0.5,
    };

    const result = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Low confidence geometry test.',
      },
      lowConfidenceGeo
    );

    expect(result.classification).toBe('SOURCE_UNAVAILABLE');
    expect(result.explanation).toContain('below required confidence score');
  });

  it('10. Retired governance state', () => {
    const retiredGeo: GeometryRecord = {
      ...SHIVNERI_GEOMETRY,
      governanceState: 'RETIRED',
    };

    const result = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Retired geometry test.',
      },
      retiredGeo
    );

    expect(result.classification).toBe('SOURCE_UNAVAILABLE');
    expect(result.explanation).toContain('unreviewed or below required confidence score');
  });

  it('11. Very large GPS accuracy (e.g. 10000m) triggers EVIDENCE_INSUFFICIENT', () => {
    const result = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 10000.0,
        factualDescription: 'Extremely large GPS error disk test.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(result.classification).toBe('EVIDENCE_INSUFFICIENT');
    expect(result.explanation).toContain('exceeds 35m threshold');
  });
});

describe('Interior Point Distance-to-Boundary Verification', () => {
  it('1. Verifies reference point (19.1931225, 73.8528893) against Prohibited layer returns non-zero distance (~70m)', () => {
    // Reference point is deep inside Prohibited layer boundary.
    // Geodesic distance calculation to Prohibited boundary polygon is approx 70m (within +/-3m tolerance: 67m to 73m).
    const result = calculateSpatialResult(
      {
        latitude: 19.1931225,
        longitude: 73.8528893,
        gpsAccuracyMeters: 5.0,
        factualDescription: 'Interior point in Prohibited zone test.',
      },
      SHIVNERI_PROHIBITED_GEOMETRY
    );

    expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
    expect(result.distanceToBoundaryMeters).toBeGreaterThanOrEqual(67.0);
    expect(result.distanceToBoundaryMeters).toBeLessThanOrEqual(73.0);
  });

  it('2. Verifies clearly interior point (19.1980, 73.8580) against Protected layer returns non-zero distance (~128.8m)', () => {
    // Work/Calculation: Point (19.1980N, 73.8580E) is inside Protected Area boundary.
    // Turf point-to-line distance from (73.8580, 19.1980) to closest segment of SHIVNERI_PROTECTED_GEOMETRY
    // yields ~0.1288 km -> 128.8m (meaningfully large positive number > 0).
    const result = calculateSpatialResult(
      {
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
        factualDescription: 'Interior point in Protected zone test.',
      },
      SHIVNERI_PROTECTED_GEOMETRY
    );

    expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
    expect(result.distanceToBoundaryMeters).toBeCloseTo(128.8, 1);
  });

  it('3. Regression test: near-boundary point (26.2m from Protected) still triggers LOCATION_UNCERTAIN when accuracy > 26.2m', () => {
    // Point 19.1931225, 73.8528893 is 26.2m outside Protected boundary line.
    // At gpsAccuracyMeters = 30.0m (30.0 >= 26.2), accuracy circle intersects boundary edge -> LOCATION_UNCERTAIN.
    const result = calculateSpatialResult(
      {
        latitude: 19.1931225,
        longitude: 73.8528893,
        gpsAccuracyMeters: 30.0,
        factualDescription: 'Near boundary uncertainty regression test.',
      },
      SHIVNERI_PROTECTED_GEOMETRY
    );

    expect(result.classification).toBe('LOCATION_UNCERTAIN');
    expect(result.distanceToBoundaryMeters).toBe(26);
    expect(result.isUncertaintyOverlap).toBe(true);
  });
});

describe('Product Contract & Safe Language Verification', () => {
  it('ensures all observation categories contain zero banned accusatory terms', () => {
    OBSERVATION_CATEGORIES.forEach(cat => {
      const labelCheck = containsBannedLanguage(cat.label);
      const descCheck = containsBannedLanguage(cat.description);
      expect(labelCheck.hasViolation).toBe(false);
      expect(descCheck.hasViolation).toBe(false);
    });
  });

  it('ensures all case statuses contain zero banned accusatory terms', () => {
    Object.values(CASE_STATUSES).forEach(status => {
      const labelCheck = containsBannedLanguage(status.label);
      const descCheck = containsBannedLanguage(status.description);
      expect(labelCheck.hasViolation).toBe(false);
      expect(descCheck.hasViolation).toBe(false);
    });
  });

  it('ensures all spatial classifications contain zero banned accusatory terms', () => {
    Object.values(SPATIAL_CLASSIFICATIONS).forEach(sc => {
      const labelCheck = containsBannedLanguage(sc.badgeLabel);
      const descCheck = containsBannedLanguage(sc.summaryDescription);
      expect(labelCheck.hasViolation).toBe(false);
      expect(descCheck.hasViolation).toBe(false);
    });
  });
});
