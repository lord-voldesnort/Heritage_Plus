/**
 * AUTHORITATIVE server-side port of src/shared/lib/spatialEngine.ts.
 *
 * The frontend runs the same algorithm client-side for instant form feedback,
 * but per the "never trust the client for authoritative fields" security
 * principle, only the result computed HERE (against geometry loaded fresh
 * from PostGIS) is persisted as the case's official classification.
 *
 * Keep this file's logic byte-for-byte in sync with the frontend copy. If the
 * two ever diverge, the client-side preview shown to a field ranger during
 * capture could disagree with what the reviewer sees after submission.
 */
import * as turf from '@turf/turf';
import type { Feature, MultiPolygon, Polygon } from 'geojson';

export type SpatialClassification =
  | 'POTENTIAL_ZONE_CONCERN'
  | 'NO_SPATIAL_CONCERN_INDICATED'
  | 'LOCATION_UNCERTAIN'
  | 'EVIDENCE_INSUFFICIENT'
  | 'SOURCE_UNAVAILABLE';

export interface GeometryRecordLike {
  geometryId: string;
  versionLabel: string;
  governanceState: string;
  layerConfidenceScore: number;
  geojson: Polygon | MultiPolygon;
}

export interface SpatialCalculationInput {
  latitude: number;
  longitude: number;
  gpsAccuracyMeters: number;
  factualDescription: string;
}

export interface SpatialResult {
  classification: SpatialClassification;
  distanceToBoundaryMeters: number | null;
  gpsAccuracyMeters: number;
  isUncertaintyOverlap: boolean;
  geometryVersion: string;
  explanation: string;
  uncertaintyReason?: string;
  statements: {
    userReported: string;
    gisCalculated: string;
    authorityNotice: string;
  };
}

export const CANONICAL_LEGAL_DISCLAIMER =
  'Observations and spatial determinations are advisory triage assessments for heritage preservation authorities and do not constitute a judicial ruling.';

export function calculateSpatialResult(
  input: SpatialCalculationInput,
  geometryRecord: GeometryRecordLike | null | undefined
): SpatialResult {
  if (!geometryRecord || !geometryRecord.geojson) {
    return {
      classification: 'SOURCE_UNAVAILABLE',
      distanceToBoundaryMeters: null,
      gpsAccuracyMeters: Number.isFinite(input?.gpsAccuracyMeters) ? input.gpsAccuracyMeters : 0,
      isUncertaintyOverlap: false,
      geometryVersion: 'unknown',
      explanation: 'Source geometry record is missing or malformed.',
      uncertaintyReason: 'Missing or malformed source geometry',
      statements: {
        userReported: input?.factualDescription || '',
        gisCalculated: 'Spatial classification unavailable due to missing source geometry.',
        authorityNotice: 'Indicative decision support only. Authority verification required.',
      },
    };
  }

  if (!Number.isFinite(input?.gpsAccuracyMeters) || input.gpsAccuracyMeters < 0) {
    return {
      classification: 'EVIDENCE_INSUFFICIENT',
      distanceToBoundaryMeters: null,
      gpsAccuracyMeters: 0,
      isUncertaintyOverlap: true,
      geometryVersion: geometryRecord.versionLabel || 'unknown',
      explanation: 'Device reported horizontal GPS accuracy value is invalid or non-finite.',
      uncertaintyReason: 'Invalid or non-finite GPS accuracy input',
      statements: {
        userReported: input?.factualDescription || '',
        gisCalculated: 'GPS accuracy telemetry is invalid.',
        authorityNotice: 'Indicative decision support only. Authority verification required.',
      },
    };
  }

  const { latitude, longitude, gpsAccuracyMeters, factualDescription } = input;
  const version = geometryRecord.versionLabel || 'unknown';

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      classification: 'SOURCE_UNAVAILABLE',
      distanceToBoundaryMeters: null,
      gpsAccuracyMeters,
      isUncertaintyOverlap: false,
      geometryVersion: version,
      explanation: 'Provided geographic coordinates are invalid or outside valid WGS 84 bounds.',
      uncertaintyReason: 'Invalid coordinate input',
      statements: {
        userReported: factualDescription || '',
        gisCalculated: 'Spatial classification unavailable due to invalid input coordinates.',
        authorityNotice: 'Indicative decision support only. Authority verification required.',
      },
    };
  }

  if (
    !geometryRecord.layerConfidenceScore ||
    geometryRecord.layerConfidenceScore < 0.7 ||
    geometryRecord.governanceState === 'RETIRED'
  ) {
    return {
      classification: 'SOURCE_UNAVAILABLE',
      distanceToBoundaryMeters: null,
      gpsAccuracyMeters,
      isUncertaintyOverlap: false,
      geometryVersion: version,
      explanation: 'Source geometry is unreviewed or below required confidence score. Source review required.',
      uncertaintyReason: 'Layer confidence score below 0.70',
      statements: {
        userReported: factualDescription,
        gisCalculated: 'Spatial classification unavailable due to unreviewed source geometry.',
        authorityNotice: CANONICAL_LEGAL_DISCLAIMER,
      },
    };
  }

  if (gpsAccuracyMeters > 35.0) {
    return {
      classification: 'EVIDENCE_INSUFFICIENT',
      distanceToBoundaryMeters: null,
      gpsAccuracyMeters,
      isUncertaintyOverlap: true,
      geometryVersion: version,
      explanation: `Device reported horizontal GPS accuracy error (\u00b1${gpsAccuracyMeters.toFixed(1)}m) exceeds 35m threshold. Re-positioning in open sky required.`,
      uncertaintyReason: 'GPS accuracy error > 35m',
      statements: {
        userReported: factualDescription,
        gisCalculated: `Device accuracy error (\u00b1${gpsAccuracyMeters.toFixed(1)}m) is too high for reliable spatial calculation.`,
        authorityNotice: CANONICAL_LEGAL_DISCLAIMER,
      },
    };
  }

  const geojsonGeom = geometryRecord.geojson;
  const point = turf.point([longitude, latitude]);
  const isInside = turf.booleanPointInPolygon(point, geojsonGeom as any);

  const boundaryLines = turf.polygonToLine(geojsonGeom as any);
  const flattenedLines = turf.flatten(boundaryLines as any);
  const distances = flattenedLines.features.map((lineFeature: Feature) =>
    turf.pointToLineDistance(point, lineFeature as any, { units: 'kilometers' })
  );
  const distanceKm = distances.length > 0 ? Math.min(...distances) : 0;
  const distanceMeters = Math.round(distanceKm * 1000 * 10) / 10;

  if (distanceMeters <= gpsAccuracyMeters) {
    return {
      classification: 'LOCATION_UNCERTAIN',
      distanceToBoundaryMeters: distanceMeters,
      gpsAccuracyMeters,
      isUncertaintyOverlap: true,
      geometryVersion: version,
      explanation: `Location uncertain \u2013 the GPS accuracy circle (\u00b1${gpsAccuracyMeters.toFixed(1)}m) overlaps the zone boundary (${distanceMeters.toFixed(1)}m distance). The application cannot make a dependable zone classification.`,
      uncertaintyReason: 'GPS accuracy circle intersects boundary line',
      statements: {
        userReported: factualDescription,
        gisCalculated: `Point is ${distanceMeters.toFixed(1)}m from boundary line, within device error margin (\u00b1${gpsAccuracyMeters.toFixed(1)}m).`,
        authorityNotice: CANONICAL_LEGAL_DISCLAIMER,
      },
    };
  }

  if (isInside) {
    return {
      classification: 'POTENTIAL_ZONE_CONCERN',
      distanceToBoundaryMeters: distanceMeters,
      gpsAccuracyMeters,
      isUncertaintyOverlap: false,
      geometryVersion: version,
      explanation: `Potential zone-related concern \u2013 the reported point appears within the pilot zone layer (${version}). GPS accuracy is \u00b1${gpsAccuracyMeters.toFixed(1)}m. This is not a legal finding; authority verification is required.`,
      statements: {
        userReported: factualDescription,
        gisCalculated: `Point falls within the surveyed boundary polygon (version: ${version}).`,
        authorityNotice: CANONICAL_LEGAL_DISCLAIMER,
      },
    };
  }

  return {
    classification: 'NO_SPATIAL_CONCERN_INDICATED',
    distanceToBoundaryMeters: distanceMeters,
    gpsAccuracyMeters,
    isUncertaintyOverlap: false,
    geometryVersion: version,
    explanation: `No spatial concern indicated by this layer (point is ${distanceMeters.toFixed(1)}m outside). This does not prove absence of other issues.`,
    statements: {
      userReported: factualDescription,
      gisCalculated: `Point is located ${distanceMeters.toFixed(1)}m outside the active source boundary.`,
      authorityNotice: CANONICAL_LEGAL_DISCLAIMER,
    },
  };
}

export interface MultiTierGeometryRecord {
  protected: GeometryRecordLike;
  prohibited: GeometryRecordLike;
  regulated: GeometryRecordLike;
}

export function resolveMultiTierSpatialResult(
  input: SpatialCalculationInput,
  layers: MultiTierGeometryRecord
): SpatialResult {
  let higherTierUncertaintyNote: string | null = null;

  const resProtected = calculateSpatialResult(input, layers.protected);
  if (
    resProtected.classification === 'POTENTIAL_ZONE_CONCERN' ||
    resProtected.classification === 'EVIDENCE_INSUFFICIENT' ||
    resProtected.classification === 'SOURCE_UNAVAILABLE'
  ) {
    return resProtected;
  }
  if (resProtected.classification === 'LOCATION_UNCERTAIN') {
    higherTierUncertaintyNote = `Note: The relationship to the more restrictive Protected Area layer (${layers.protected.versionLabel}) could not be reliably determined due to GPS accuracy.`;
  }

  const resProhibited = calculateSpatialResult(input, layers.prohibited);
  if (
    resProhibited.classification === 'POTENTIAL_ZONE_CONCERN' ||
    resProhibited.classification === 'EVIDENCE_INSUFFICIENT' ||
    resProhibited.classification === 'SOURCE_UNAVAILABLE'
  ) {
    if (resProhibited.classification === 'POTENTIAL_ZONE_CONCERN') {
      const explanation =
        `Potential zone-related concern \u2013 point is within the 100m Prohibited Zone layer (${layers.prohibited.versionLabel}). GPS accuracy is \u00b1${input.gpsAccuracyMeters.toFixed(1)}m.` +
        (higherTierUncertaintyNote ? ` ${higherTierUncertaintyNote}` : '');
      return {
        ...resProhibited,
        explanation,
        statements: {
          ...resProhibited.statements,
          gisCalculated: `Point is within the 100m Prohibited Boundary layer (${layers.prohibited.versionLabel}).${
            higherTierUncertaintyNote ? ' Higher-tier Protected Area boundary relationship is uncertain.' : ''
          }`,
        },
      };
    }
    return resProhibited;
  }
  if (resProhibited.classification === 'LOCATION_UNCERTAIN' && !higherTierUncertaintyNote) {
    higherTierUncertaintyNote = `Note: The relationship to the 100m Prohibited Zone layer (${layers.prohibited.versionLabel}) could not be reliably determined due to GPS accuracy.`;
  }

  const resRegulated = calculateSpatialResult(input, layers.regulated);
  if (
    resRegulated.classification === 'POTENTIAL_ZONE_CONCERN' ||
    resRegulated.classification === 'EVIDENCE_INSUFFICIENT' ||
    resRegulated.classification === 'SOURCE_UNAVAILABLE'
  ) {
    if (resRegulated.classification === 'POTENTIAL_ZONE_CONCERN') {
      const explanation =
        `Potential zone-related concern \u2013 point is within the 300m Regulated Zone layer (${layers.regulated.versionLabel}). GPS accuracy is \u00b1${input.gpsAccuracyMeters.toFixed(1)}m.` +
        (higherTierUncertaintyNote ? ` ${higherTierUncertaintyNote}` : '');
      return {
        ...resRegulated,
        explanation,
        statements: {
          ...resRegulated.statements,
          gisCalculated: `Point is within the 300m Regulated Boundary layer (${layers.regulated.versionLabel}).${
            higherTierUncertaintyNote ? ' Higher-tier boundary relationship is uncertain.' : ''
          }`,
        },
      };
    }
    return resRegulated;
  }

  if (
    resProtected.classification === 'LOCATION_UNCERTAIN' ||
    resProhibited.classification === 'LOCATION_UNCERTAIN' ||
    resRegulated.classification === 'LOCATION_UNCERTAIN'
  ) {
    return resProtected.classification === 'LOCATION_UNCERTAIN'
      ? resProtected
      : resProhibited.classification === 'LOCATION_UNCERTAIN'
      ? resProhibited
      : resRegulated;
  }

  return resRegulated;
}
