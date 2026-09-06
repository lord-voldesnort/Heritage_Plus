import { describe, it, expect } from 'vitest';
import { calculateSpatialResult } from './spatialEngine';
import { SHIVNERI_GEOMETRY } from '../mock-data/mockSite';
import { containsBannedLanguage } from '../constants/bannedLanguage';
import { OBSERVATION_CATEGORIES } from '../constants/categories';
import { CASE_STATUSES } from '../constants/caseStatuses';
import { SPATIAL_CLASSIFICATIONS } from '../constants/spatialClassifications';

describe('Spatial Reasoning Engine', () => {
  it('Scenario 1: correctly classifies point clearly inside zone as POTENTIAL_ZONE_CONCERN', () => {
    const result = calculateSpatialResult(
      {
        latitude: 19.1982,
        longitude: 73.8624,
        gpsAccuracyMeters: 4.5,
        factualDescription: 'Stone masonry foundation work near gateway.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
    expect(result.distanceToBoundaryMeters).toBe(0.0);
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

  it('Scenario 3: refuses to overclaim and returns LOCATION_UNCERTAIN when GPS error disk overlaps boundary', () => {
    // Point right on the boundary edge with ±14.5m accuracy
    const result = calculateSpatialResult(
      {
        latitude: 19.2020,
        longitude: 73.8660,
        gpsAccuracyMeters: 14.5,
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
        latitude: 19.1982,
        longitude: 73.8624,
        gpsAccuracyMeters: 46.0,
        factualDescription: 'Debris noted in deep rock crevice.',
      },
      SHIVNERI_GEOMETRY
    );

    expect(result.classification).toBe('EVIDENCE_INSUFFICIENT');
    expect(result.explanation).toContain('exceeds 35m threshold');
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
