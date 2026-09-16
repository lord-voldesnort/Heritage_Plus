/**
 * HERITAGE PULSE CANONICAL CONTRACT SPECIFICATION
 * Contract Version: 1.0.0-A1
 * Primary owner: Ameya (Backend, Spatial Math, Gate, Architecture Lead)
 * UI Integration: Person 4 (UI & Visual Workflow Integration Lead)
 *
 * This module provides the single canonical contract entrypoint for shared types,
 * data shapes, status validator helpers, and state transition rules.
 */

import {
  SiteRecord,
  GeometryRecord,
  ObservationRecord,
  EvidenceRecord,
  SpatialResult,
  ReviewEvent,
  CaseStatus,
  ObservationType,
  SpatialClassification,
  DemoScenario,
} from '../types';

import { containsBannedLanguage } from '../constants/bannedLanguage';
import { OBSERVATION_CATEGORIES, CategoryMetadata } from '../constants/categories';

export const CANONICAL_LEGAL_DISCLAIMER =
  'Indicative decision support only. Spatial calculations reflect pilot boundary datasets and do not constitute a legal finding; authority verification required.';

// Re-export canonical types for single-import accessibility
export type {
  SiteRecord,
  GeometryRecord,
  ObservationRecord,
  EvidenceRecord,
  SpatialResult,
  ReviewEvent,
  CaseStatus,
  ObservationType,
  SpatialClassification,
  DemoScenario,
  CategoryMetadata,
};

import { calculateSpatialResult, resolveMultiTierSpatialResult } from '../lib/spatialEngine';

export {
  containsBannedLanguage,
  OBSERVATION_CATEGORIES,
  calculateSpatialResult,
  resolveMultiTierSpatialResult,
};

/**
 * CANONICAL SPATIAL STATUS DEFINITIONS
 */
export type CanonicalSpatialStatus =
  | 'INSIDE_PROHIBITED'
  | 'INSIDE_REGULATED'
  | 'OUTSIDE_BOUNDARIES'
  | 'LOCATION_UNCERTAIN'
  | 'POOR_GPS'
  | 'UNREVIEWED_GEOMETRY';

/**
 * CANONICAL REVIEWER ACTIONS & PERMITTED TRANSITIONS
 */
export interface PermittedReviewerAction {
  actionKey: 'REQUEST_ADDITIONAL_EVIDENCE' | 'RECOMMEND_FIELD_VERIFICATION' | 'REFER_OFFICIAL_REVIEW' | 'CLOSE_CASE';
  label: string;
  resultingStatus: CaseStatus;
  eventType: 'INFO_REQUESTED' | 'STATUS_UPDATED' | 'CASE_CLOSED';
  description: string;
}

export const CANONICAL_REVIEWER_ACTIONS: PermittedReviewerAction[] = [
  {
    actionKey: 'REQUEST_ADDITIONAL_EVIDENCE',
    label: 'Request Additional Evidence',
    resultingStatus: 'ADDITIONAL_INFORMATION_NEEDED',
    eventType: 'INFO_REQUESTED',
    description: 'Request higher-precision GPS telemetry, alternate perspective photo, or clarified observation context.',
  },
  {
    actionKey: 'RECOMMEND_FIELD_VERIFICATION',
    label: 'Recommend Field Verification',
    resultingStatus: 'FIELD_VERIFICATION_RECOMMENDED',
    eventType: 'STATUS_UPDATED',
    description: 'Schedule a physical ground inspection by an authorized heritage surveyor or designated field curator.',
  },
  {
    actionKey: 'REFER_OFFICIAL_REVIEW',
    label: 'Refer for Official Review',
    resultingStatus: 'REFERRED',
    eventType: 'STATUS_UPDATED',
    description: 'Compile evidence packet and forward to the competent statutory authority for formal assessment.',
  },
  {
    actionKey: 'CLOSE_CASE',
    label: 'Close Case',
    resultingStatus: 'CLOSED_REVIEWED',
    eventType: 'CASE_CLOSED',
    description: 'Mark observation reviewed with no further action required. Immutably logged in the Change Ledger.',
  },
];

/**
 * CANONICAL REVIEWER PACKET DATA SHAPE
 */
export interface CanonicalReviewerPacketData {
  caseId: string;
  generatedTimestamp: string;
  siteName: string;
  vernacularName?: string;
  district?: string;
  state?: string;
  monumentNumber: string;
  category: ObservationType;
  categoryLabel?: string;
  factualDescription: string;
  coordinates: {
    latitude: number;
    longitude: number;
    gpsAccuracyMeters: number;
  };
  spatialVerdict: {
    classification: SpatialClassification;
    distanceToBoundaryMeters: number | null;
    gpsAccuracyMeters: number;
    isUncertaintyOverlap: boolean;
    geometryVersion: string;
    explanation: string;
    uncertaintyReason?: string;
    statements?: {
      userReported: string;
      gisCalculated: string;
      authorityNotice: string;
    };
  };
  provenance: {
    sourceAgency: string;
    sourceDocumentOrUrl: string;
    bhuvanVersionStatement?: string;
    crs?: string;
    verbatimLimitationText?: string;
    retrievalDate?: string;
    gateStatus: string;
  };
  evidenceList: EvidenceRecord[];
  eventsTimeline: ReviewEvent[];
  disclaimer: string;
  currentStatus: CaseStatus;
}

/**
 * Canonical Builder: Compiles a standardized Reviewer Packet dataset from an ObservationRecord
 */
export function buildCanonicalReviewerPacketData(
  observation: ObservationRecord,
  siteName: string = 'Fort of Shivner (Shivneri Fort)',
  monumentNumber: string = 'MUMMH015'
): CanonicalReviewerPacketData {
  const isOverlap =
    observation.spatialResult?.isUncertaintyOverlap ??
    (observation.computedClassification === 'LOCATION_UNCERTAIN');

  const categoryMeta = OBSERVATION_CATEGORIES.find((c) => c.id === observation.category);

  return {
    caseId: observation.caseId,
    generatedTimestamp: new Date().toISOString(),
    siteName,
    vernacularName: 'शिवनेरी किल्ला (MUMMH015)',
    district: 'Pune',
    state: 'Maharashtra',
    monumentNumber,
    category: observation.category,
    categoryLabel: categoryMeta?.label || observation.category.replace(/_/g, ' '),
    factualDescription: observation.factualDescription,
    coordinates: {
      latitude: observation.latitude,
      longitude: observation.longitude,
      gpsAccuracyMeters: observation.gpsAccuracyMeters,
    },
    spatialVerdict: {
      classification: observation.spatialResult?.classification || observation.computedClassification,
      distanceToBoundaryMeters: observation.spatialResult?.distanceToBoundaryMeters ?? observation.distanceToBoundaryMeters,
      gpsAccuracyMeters: observation.spatialResult?.gpsAccuracyMeters ?? observation.gpsAccuracyMeters,
      isUncertaintyOverlap: isOverlap,
      geometryVersion: observation.spatialResult?.geometryVersion || 'v1.0-bhuvan-protected-7068',
      explanation: observation.spatialResult?.explanation || observation.spatialReasoningExplanation,
      uncertaintyReason: observation.spatialResult?.uncertaintyReason,
      statements: observation.spatialResult?.statements,
    },
    provenance: {
      sourceAgency: 'Bhuvan / NRSC (ISRO) in association with Archaeological Survey of India (ASI)',
      sourceDocumentOrUrl: 'https://bhuvan-app1.nrsc.gov.in/culture_monuments/',
      gateStatus: 'PASSED_WITH_LIMITATIONS',
      bhuvanVersionStatement: 'Version 1.0 source data; not independently legally verified',
      crs: 'EPSG:4326',
      verbatimLimitationText:
        'Bhuvan explicitly states that these boundaries were mapped in association with ASI, require ASI verification for correctness/completeness, are for visualization/indicative purposes only, and cannot be used for any legal purpose. Bhuvan also separately states this is "version 1.0 data" and disclaims responsibility for inadvertent errors.',
      retrievalDate: '2026-09-07',
    },
    evidenceList: observation.evidenceList || [],
    eventsTimeline: observation.eventsTimeline || [],
    disclaimer: CANONICAL_LEGAL_DISCLAIMER,
    currentStatus: observation.currentStatus || 'SUBMITTED_FOR_REVIEW',
  };
}
