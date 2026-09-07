import * as turf from '@turf/turf';
import { GeometryRecord, SpatialResult } from '../types';

export interface SpatialCalculationInput {
  latitude: number;
  longitude: number;
  gpsAccuracyMeters: number;
  factualDescription: string;
}

export interface MultiTierGeometryRecord {
  protected: GeometryRecord;
  prohibited: GeometryRecord;
  regulated: GeometryRecord;
}

/**
 * CALCULATE SPATIAL REASONING RESULT (SINGLE LAYER)
 * Evaluates a field observation coordinate against a source-labelled MultiPolygon boundary layer.
 *
 * NOTE: Centroid/circular radius calculations around a monument center are strictly FORBIDDEN.
 * This function calculates true geodesic distance to MultiPolygon boundary perimeters.
 */
export function calculateSpatialResult(
  input: SpatialCalculationInput,
  geometryRecord: GeometryRecord
): SpatialResult {
  // Input Validation 1: Malformed or missing geometryRecord / geojson
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

  // Input Validation 2: Invalid or non-finite GPS accuracy (NaN, Infinity, negative)
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

  // Input Validation 3: Invalid or out-of-range coordinates
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

  // Rule 1: Governance & Confidence Gate
  if (
    !geometryRecord.layerConfidenceScore ||
    geometryRecord.layerConfidenceScore < 0.70 ||
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
        authorityNotice: 'Indicative decision support only. Authority review required.',
      },
    };
  }

  // Rule 2: Degraded GPS Error Gatekeeper (> 35m)
  if (gpsAccuracyMeters > 35.0) {
    return {
      classification: 'EVIDENCE_INSUFFICIENT',
      distanceToBoundaryMeters: null,
      gpsAccuracyMeters,
      isUncertaintyOverlap: true,
      geometryVersion: version,
      explanation: `Device reported horizontal GPS accuracy error (±${gpsAccuracyMeters.toFixed(1)}m) exceeds 35m threshold. Re-positioning in open sky required.`,
      uncertaintyReason: 'GPS accuracy error > 35m',
      statements: {
        userReported: factualDescription,
        gisCalculated: `Device accuracy error (±${gpsAccuracyMeters.toFixed(1)}m) is too high for reliable spatial calculation.`,
        authorityNotice: 'Indicative decision support only. Authority verification required.',
      },
    };
  }

  // Convert geometry for Turf.js calculations
  const geojsonGeom = geometryRecord.geojson as GeoJSON.Polygon | GeoJSON.MultiPolygon;
  const point = turf.point([longitude, latitude]);
  const isInside = turf.booleanPointInPolygon(point, geojsonGeom);

  // Calculate distance in meters to nearest boundary line string
  const boundaryLines = turf.polygonToLine(geojsonGeom);
  let distanceKm = 0;
  if (boundaryLines.type === 'FeatureCollection') {
    const distances = boundaryLines.features.map(lineFeature =>
      turf.pointToLineDistance(point, lineFeature as any, { units: 'kilometers' })
    );
    distanceKm = Math.min(...distances);
  } else {
    distanceKm = turf.pointToLineDistance(point, boundaryLines as any, { units: 'kilometers' });
  }
  const distanceMeters = Math.round(distanceKm * 1000 * 10) / 10;

  // Rule 3: Accuracy Circle Overlap (Near Boundary Edge)
  if (distanceMeters <= gpsAccuracyMeters) {
    return {
      classification: 'LOCATION_UNCERTAIN',
      distanceToBoundaryMeters: distanceMeters,
      gpsAccuracyMeters,
      isUncertaintyOverlap: true,
      geometryVersion: version,
      explanation: `Location uncertain – the GPS accuracy circle (±${gpsAccuracyMeters.toFixed(1)}m) overlaps the zone boundary (${distanceMeters.toFixed(1)}m distance). The application cannot make a dependable zone classification.`,
      uncertaintyReason: 'GPS accuracy circle intersects boundary line',
      statements: {
        userReported: factualDescription,
        gisCalculated: `Point is ${distanceMeters.toFixed(1)}m from boundary line, within device error margin (±${gpsAccuracyMeters.toFixed(1)}m).`,
        authorityNotice: 'Indicative decision support only. Authority verification required.',
      },
    };
  }

  // Rule 4: Point Strictly Inside (and well clear of boundary margin)
  if (isInside) {
    return {
      classification: 'POTENTIAL_ZONE_CONCERN',
      distanceToBoundaryMeters: distanceMeters,
      gpsAccuracyMeters,
      isUncertaintyOverlap: false,
      geometryVersion: version,
      explanation: `Potential zone-related concern – the reported point appears within the pilot zone layer (${version}). GPS accuracy is ±${gpsAccuracyMeters.toFixed(1)}m. This is not a legal finding; authority verification is required.`,
      statements: {
        userReported: factualDescription,
        gisCalculated: `Point falls within the surveyed boundary polygon (version: ${version}).`,
        authorityNotice: 'Indicative decision support only. Authority verification required.',
      },
    };
  }

  // Rule 5: Point Strictly Outside (and well clear of boundary margin)
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
      authorityNotice: 'Indicative decision support only. Authority verification required.',
    },
  };
}

/**
 * RESOLVE MULTI-TIER SPATIAL RESULT
 * Evaluates a field observation across all 3 source buffer tiers (Protected, Prohibited, Regulated)
 * and resolves the single highest-severity spatial classification.
 *
 * Severity Order (Highest to Lowest):
 * 1. Protected Tier (Inside Protected Area)
 * 2. Prohibited Tier (100m Zone - Inside Prohibited, Outside Protected)
 * 3. Regulated Tier (300m Zone - Inside Regulated, Outside Prohibited)
 * 4. Outside All Tiers (No Spatial Concern Indicated)
 *
 * Multi-Tier Uncertainty Handling:
 * If a higher tier evaluates to LOCATION_UNCERTAIN (e.g. GPS error margin intersects Protected boundary)
 * but a lower tier evaluates to a confident POTENTIAL_ZONE_CONCERN (e.g. inside Prohibited 100m zone),
 * the lower-tier POTENTIAL_ZONE_CONCERN is retained as the primary classification, and a clear, non-accusatory
 * note is appended to the explanation indicating that the higher-tier relationship could not be reliably determined.
 */
export function resolveMultiTierSpatialResult(
  input: SpatialCalculationInput,
  layers: MultiTierGeometryRecord
): SpatialResult {
  if (!layers || !layers.protected || !layers.prohibited || !layers.regulated) {
    return {
      classification: 'SOURCE_UNAVAILABLE',
      distanceToBoundaryMeters: null,
      gpsAccuracyMeters: Number.isFinite(input?.gpsAccuracyMeters) ? input.gpsAccuracyMeters : 0,
      isUncertaintyOverlap: false,
      geometryVersion: 'unknown',
      explanation: 'One or more required multi-tier source geometry layers are missing.',
      uncertaintyReason: 'Missing multi-tier geometry layers',
      statements: {
        userReported: input?.factualDescription || '',
        gisCalculated: 'Spatial classification unavailable due to incomplete multi-tier layers.',
        authorityNotice: 'Indicative decision support only. Authority verification required.',
      },
    };
  }

  let higherTierUncertaintyNote: string | null = null;

  // 1. Evaluate against Protected Layer
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

  // 2. Evaluate against Prohibited Layer (100m)
  const resProhibited = calculateSpatialResult(input, layers.prohibited);
  if (
    resProhibited.classification === 'POTENTIAL_ZONE_CONCERN' ||
    resProhibited.classification === 'EVIDENCE_INSUFFICIENT' ||
    resProhibited.classification === 'SOURCE_UNAVAILABLE'
  ) {
    if (resProhibited.classification === 'POTENTIAL_ZONE_CONCERN') {
      const explanation =
        `Potential zone-related concern – point is within the 100m Prohibited Zone layer (${layers.prohibited.versionLabel}). GPS accuracy is ±${input.gpsAccuracyMeters.toFixed(1)}m.` +
        (higherTierUncertaintyNote ? ` ${higherTierUncertaintyNote}` : '');
      return {
        ...resProhibited,
        explanation,
        statements: {
          ...resProhibited.statements,
          gisCalculated: `Point is within the 100m Prohibited Boundary layer (${layers.prohibited.versionLabel}).${higherTierUncertaintyNote ? ' Higher-tier Protected Area boundary relationship is uncertain.' : ''}`,
        },
      };
    }
    return resProhibited;
  }
  if (resProhibited.classification === 'LOCATION_UNCERTAIN' && !higherTierUncertaintyNote) {
    higherTierUncertaintyNote = `Note: The relationship to the 100m Prohibited Zone layer (${layers.prohibited.versionLabel}) could not be reliably determined due to GPS accuracy.`;
  }

  // 3. Evaluate against Regulated Layer (300m)
  const resRegulated = calculateSpatialResult(input, layers.regulated);
  if (
    resRegulated.classification === 'POTENTIAL_ZONE_CONCERN' ||
    resRegulated.classification === 'EVIDENCE_INSUFFICIENT' ||
    resRegulated.classification === 'SOURCE_UNAVAILABLE'
  ) {
    if (resRegulated.classification === 'POTENTIAL_ZONE_CONCERN') {
      const explanation =
        `Potential zone-related concern – point is within the 300m Regulated Zone layer (${layers.regulated.versionLabel}). GPS accuracy is ±${input.gpsAccuracyMeters.toFixed(1)}m.` +
        (higherTierUncertaintyNote ? ` ${higherTierUncertaintyNote}` : '');
      return {
        ...resRegulated,
        explanation,
        statements: {
          ...resRegulated.statements,
          gisCalculated: `Point is within the 300m Regulated Boundary layer (${layers.regulated.versionLabel}).${higherTierUncertaintyNote ? ' Higher-tier boundary relationship is uncertain.' : ''}`,
        },
      };
    }
    return resRegulated;
  }

  // Check for near-boundary uncertainty across any tier
  if (
    resProtected.classification === 'LOCATION_UNCERTAIN' ||
    resProhibited.classification === 'LOCATION_UNCERTAIN' ||
    resRegulated.classification === 'LOCATION_UNCERTAIN'
  ) {
    const uncertainRes =
      resProtected.classification === 'LOCATION_UNCERTAIN'
        ? resProtected
        : resProhibited.classification === 'LOCATION_UNCERTAIN'
        ? resProhibited
        : resRegulated;
    return uncertainRes;
  }

  // Outside all three zones -> Return Regulated layer outside result (showing distance to 300m boundary)
  return resRegulated;
}
