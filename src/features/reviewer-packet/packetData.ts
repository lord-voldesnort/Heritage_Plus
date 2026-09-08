import { ledgerStore } from '../../shared/lib/ledgerStore';
import { SHIVNERI_SITE } from '../../shared/mock-data/mockSite';
import { PROVENANCE_METADATA } from '../../shared/mock-data/siteGeometry';
import { CANONICAL_LEGAL_DISCLAIMER } from '../../shared/constants/disclaimer';
import { CaseStatus, ObservationType, SpatialClassification, ReviewEvent } from '../../shared/types';

export const APPROVED_CATEGORY_LABELS: Record<string, string> = {
  POSSIBLE_CONSTRUCTION: 'Possible construction',
  POSSIBLE_ENCROACHMENT: 'Possible alteration',
  PHYSICAL_DAMAGE: 'Physical damage',
  DUMPING_OR_WASTE: 'Dumping or waste',
  BLOCKED_ACCESS: 'Blocked access',
  ALTERATION_OR_OBSTRUCTION: 'Visual obstruction',
  OTHER_VISIBLE_CHANGE: 'Other visible change',
};

export interface ReviewerPacketData {
  id: string;
  caseId: string;
  siteName: string;
  monumentNumber: string;
  category: ObservationType;
  categoryLabel: string;
  description: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  distanceToBoundaryMeters: number | null;
  computedClassification: SpatialClassification;
  isUncertaintyOverlap: boolean;
  explanation: string;
  currentStatus: CaseStatus;
  timestamp: string;
  photoUrl: string | null;
  photoMetadata: {
    fileName: string;
    sizeKb: number;
    capturedDate: string;
    sha256Checksum: string;
    fileMimeType: string;
    evidenceId?: string;
  } | null;
  evidenceList: typeof ledgerStore extends { getCaseById: (...args: any[]) => infer R }
    ? R extends { evidenceList: infer E }
      ? E
      : never
    : never;
  rawEvents: ReviewEvent[];
  latestReviewEvent: ReviewEvent | null;
  provenance: typeof PROVENANCE_METADATA;
  site: typeof SHIVNERI_SITE;
  layerName: string;
  geometryVersion: string;
  sourceUrl: string;
  retrievalDate: string;
  crs: string;
  disclaimer: string;
  bhuvanDisclaimer: string;
  limitationNote: string;
  nonLegalNotice: string;
}

export const CANONICAL_NON_LEGAL_NOTICE =
  'Statutory Preservation Notice: Heritage Pulse provides technical decision support and evidence packaging only. It does not determine legal compliance, verify NOC or permission records, or identify offenders. Formal statutory evaluation remains the sole prerogative of the competent authority.';

/**
 * Single shared packet data extraction function.
 * Consumed by both screen interactive view, printable dossier view, and test assertions.
 */
export function getReviewerPacketData(caseId: string): ReviewerPacketData | null {
  if (!caseId) return null;

  const storeRecord = ledgerStore.getCaseById(caseId);
  if (!storeRecord) return null;

  const isOverlap =
    storeRecord.spatialResult.classification === 'LOCATION_UNCERTAIN' ||
    (storeRecord.spatialResult.distanceToBoundaryMeters !== null &&
      storeRecord.spatialResult.distanceToBoundaryMeters <= storeRecord.gpsAccuracyMeters);

  const latestReviewEvent =
    [...(storeRecord.eventsTimeline || [])]
      .reverse()
      .find(
        (e) => e.reviewerNotes || e.actorRole === 'REVIEWER' || e.actorRole === 'Heritage Curator'
      ) || null;

  return {
    id: storeRecord.caseId,
    caseId: storeRecord.caseId,
    siteName: SHIVNERI_SITE.name,
    monumentNumber: PROVENANCE_METADATA.monumentNumber,
    category: storeRecord.category,
    categoryLabel: APPROVED_CATEGORY_LABELS[storeRecord.category] || storeRecord.category.replace(/_/g, ' '),
    description: storeRecord.factualDescription,
    latitude: storeRecord.latitude,
    longitude: storeRecord.longitude,
    accuracyMeters: storeRecord.gpsAccuracyMeters,
    distanceToBoundaryMeters: storeRecord.spatialResult.distanceToBoundaryMeters,
    computedClassification: storeRecord.spatialResult.classification,
    isUncertaintyOverlap: isOverlap,
    explanation: storeRecord.spatialResult.explanation,
    currentStatus: storeRecord.currentStatus,
    timestamp: storeRecord.observedTimestamp,
    photoUrl: storeRecord.evidenceList?.[0]?.fileUrl || null,
    photoMetadata: storeRecord.evidenceList?.[0]
      ? {
          fileName: 'evidence-capture.jpg',
          sizeKb: Math.round(storeRecord.evidenceList[0].fileSizeBytes / 1024),
          capturedDate: storeRecord.evidenceList[0].uploadTimestamp.split('T')[0],
          sha256Checksum: storeRecord.evidenceList[0].sha256Checksum,
          fileMimeType: storeRecord.evidenceList[0].fileMimeType,
          evidenceId: storeRecord.evidenceList[0].evidenceId,
        }
      : null,
    evidenceList: storeRecord.evidenceList || [],
    rawEvents: storeRecord.eventsTimeline,
    latestReviewEvent,
    provenance: PROVENANCE_METADATA,
    site: SHIVNERI_SITE,
    layerName: 'MUMMH015-asi_protected_boundary-7068',
    geometryVersion: storeRecord.spatialResult.geometryVersion || 'v1.0-bhuvan-protected-7068',
    sourceUrl: PROVENANCE_METADATA.portalUrl,
    retrievalDate: PROVENANCE_METADATA.retrievalDate,
    crs: PROVENANCE_METADATA.crs,
    disclaimer: CANONICAL_LEGAL_DISCLAIMER,
    bhuvanDisclaimer: PROVENANCE_METADATA.verbatimAsiDisclaimer,
    limitationNote: PROVENANCE_METADATA.verbatimLimitationText,
    nonLegalNotice: CANONICAL_NON_LEGAL_NOTICE,
  };
}
