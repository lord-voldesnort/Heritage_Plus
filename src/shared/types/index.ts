export type ObservationType =
  | 'POSSIBLE_CONSTRUCTION'
  | 'POSSIBLE_ENCROACHMENT'
  | 'PHYSICAL_DAMAGE'
  | 'DUMPING_OR_WASTE'
  | 'BLOCKED_ACCESS'
  | 'STRUCTURE_ALTERATION'
  | 'VISUAL_OBSTRUCTION'
  | 'OTHER_VISIBLE_CHANGE';

export type SpatialClassification =
  | 'POTENTIAL_ZONE_CONCERN'
  | 'NO_SPATIAL_CONCERN_INDICATED'
  | 'LOCATION_UNCERTAIN'
  | 'EVIDENCE_INSUFFICIENT'
  | 'SOURCE_UNAVAILABLE';

export type CaseStatus =
  | 'DRAFT'
  | 'SUBMITTED_FOR_REVIEW'
  | 'ADDITIONAL_INFORMATION_NEEDED'
  | 'FIELD_VERIFICATION_RECOMMENDED'
  | 'REFERRED'
  | 'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE'
  | 'CLOSED_DUPLICATE'
  | 'CLOSED_REVIEWED';

export type GovernanceState =
  | 'SOURCE_LOGGED'
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'PILOT_PUBLISHED'
  | 'REPLACED'
  | 'RETIRED';

export type ReporterType = 'VISITOR' | 'RESIDENT' | 'STUDENT' | 'VOLUNTEER';

export interface SiteRecord {
  siteId: string;
  slug: string;
  name: string;
  vernacularName: string;
  state: string;
  district: string;
  historicalSignificance: string;
  representativeImageUrl: string;
  sourceAgency: string;
  centroid: [number, number]; // [lng, lat]
}

export interface GeometryRecord {
  geometryId: string;
  siteId: string;
  versionLabel: string;
  geojson: GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.Geometry;
  sourceDocumentOrUrl: string;
  captureDate: string;
  limitationNote: string;
  governanceState: GovernanceState;
  layerConfidenceScore: number;
}

export interface EvidenceRecord {
  evidenceId: string;
  observationId: string;
  fileUrl: string;
  fileMimeType: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  uploadTimestamp: string;
}

export interface ReviewEvent {
  eventId: string;
  caseId: string;
  timestamp: string;
  eventType: 
    | 'OBSERVATION_CREATED' 
    | 'LOCATION_CAPTURED' 
    | 'SPATIAL_CALCULATED' 
    | 'EVIDENCE_ATTACHED' 
    | 'REVIEW_ACTION_RECORDED'
    | 'INFO_REQUESTED'
    | 'STATUS_UPDATED'
    | 'CASE_CLOSED';
  actorRole: string;
  summary: string;
  actionTaken?: CaseStatus;
  reviewerNotes?: string;
  title?: string;
  resultingStatus: CaseStatus;
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

export interface ObservationRecord {
  observationId: string;
  caseId: string;
  siteId: string;
  geometryId: string;
  reporterType: ReporterType;
  category: ObservationType;
  factualDescription: string;
  latitude: number;
  longitude: number;
  gpsAccuracyMeters: number;
  observedTimestamp: string;
  privacyConsentGiven: boolean;
  spatialResult: SpatialResult;
  currentStatus: CaseStatus;
  evidenceList: EvidenceRecord[];
  eventsTimeline: ReviewEvent[];
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  category: ObservationType;
  factualNotes: string;
  latitude: number;
  longitude: number;
  gpsAccuracyMeters: number;
  expectedClassification: SpatialClassification;
  demonstrates: string;
}
