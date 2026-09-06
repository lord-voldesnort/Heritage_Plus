import * as turf from '@turf/turf';
import { GeometryRecord, SpatialResult } from '../types';

export interface SpatialCalculationInput {
  latitude: number;
  longitude: number;
  gpsAccuracyMeters: number;
  factualDescription: string;
}

/**
 * CALCULATE SPATIAL REASONING RESULT
 * Evaluates a field observation coordinate against a source-labelled MultiPolygon boundary.
 *
 * NOTE: Centroid/circular radius calculations around a monument center are strictly FORBIDDEN.
 * This function calculates true geodesic distance to MultiPolygon boundary perimeters.
 */
export function calculateSpatialResult(
  input: SpatialCalculationInput,
  geometryRecord: GeometryRecord
): SpatialResult {
  const { latitude, longitude, gpsAccuracyMeters, factualDescription } = input;
  const point = turf.point([longitude, latitude]);
  const version = geometryRecord.versionLabel;

  // Rule 1: Governance & Confidence Gate
  if (geometryRecord.layerConfidenceScore < 0.70 || geometryRecord.governanceState === 'RETIRED') {
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
  // TODO [Vishwajeet / SPATIAL-01]: Extend to handle complex multi-geometry feature collections from PostGIS
  const geojsonGeom = geometryRecord.geojson as GeoJSON.Polygon | GeoJSON.MultiPolygon;
  const isInside = turf.booleanPointInPolygon(point, geojsonGeom);

  // Calculate distance in meters to nearest boundary line string
  const boundaryLines = turf.polygonToLine(geojsonGeom);
  const distanceKm = turf.pointToLineDistance(point, boundaryLines as any, { units: 'kilometers' });
  const distanceMeters = Math.round(distanceKm * 1000 * 10) / 10;

  // Rule 3: Accuracy Circle Overlap (Near Boundary Edge)
  // If distance to boundary is less than or equal to reported GPS accuracy, uncertainty circle intersects line
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
      distanceToBoundaryMeters: 0.0,
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
