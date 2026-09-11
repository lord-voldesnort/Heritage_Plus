// Maps DB rows to the exact camelCase shapes defined in
// src/shared/types/index.ts, so the frontend requires zero shape changes —
// only the data source (fetch vs. localStorage) changes.

export interface SiteRow {
  site_id: string;
  slug: string;
  name: string;
  vernacular_name: string;
  state: string;
  district: string;
  historical_significance: string;
  representative_image_url: string | null;
  source_agency: string;
  centroid_lng: number;
  centroid_lat: number;
}

export function siteRowToDto(r: SiteRow) {
  return {
    siteId: r.site_id,
    slug: r.slug,
    name: r.name,
    vernacularName: r.vernacular_name,
    state: r.state,
    district: r.district,
    historicalSignificance: r.historical_significance,
    representativeImageUrl: r.representative_image_url ?? '',
    sourceAgency: r.source_agency,
    centroid: [r.centroid_lng, r.centroid_lat] as [number, number],
  };
}

export interface GeometryRow {
  geometry_id: string;
  site_id: string;
  tier: string;
  version_label: string;
  source_document_or_url: string;
  capture_date: string;
  limitation_note: string;
  governance_state: string;
  layer_confidence_score: string; // numeric comes back as string from pg
  geojson: string; // raw JSON string from ST_AsGeoJSON
}

export function geometryRowToDto(r: GeometryRow) {
  return {
    geometryId: r.geometry_id,
    siteId: r.site_id,
    versionLabel: r.version_label,
    geojson: JSON.parse(r.geojson),
    sourceDocumentOrUrl: r.source_document_or_url,
    captureDate: r.capture_date,
    limitationNote: r.limitation_note,
    governanceState: r.governance_state,
    layerConfidenceScore: Number(r.layer_confidence_score),
  };
}

export interface EvidenceRow {
  evidence_id: string;
  observation_id: string;
  file_url: string;
  file_mime_type: string;
  file_size_bytes: string; // bigint -> string from pg
  sha256_checksum: string;
  upload_timestamp: string;
}

export function evidenceRowToDto(r: EvidenceRow) {
  return {
    evidenceId: r.evidence_id,
    observationId: r.observation_id,
    fileUrl: r.file_url,
    fileMimeType: r.file_mime_type,
    fileSizeBytes: Number(r.file_size_bytes),
    sha256Checksum: r.sha256_checksum,
    uploadTimestamp: r.upload_timestamp,
  };
}

export interface ReviewEventRow {
  event_id: string;
  case_id: string;
  event_timestamp: string;
  event_type: string;
  actor_role: string;
  summary: string;
  action_taken: string | null;
  reviewer_notes: string | null;
  title: string | null;
  resulting_status: string;
}

export function reviewEventRowToDto(r: ReviewEventRow) {
  return {
    eventId: r.event_id,
    caseId: r.case_id,
    timestamp: r.event_timestamp,
    eventType: r.event_type,
    actorRole: r.actor_role,
    summary: r.summary,
    ...(r.action_taken ? { actionTaken: r.action_taken } : {}),
    ...(r.reviewer_notes ? { reviewerNotes: r.reviewer_notes } : {}),
    ...(r.title ? { title: r.title } : {}),
    resultingStatus: r.resulting_status,
  };
}

export interface ObservationRow {
  observation_id: string;
  case_id: string;
  site_id: string;
  geometry_id: string;
  reporter_type: string;
  category: string;
  factual_description: string;
  longitude: number;
  latitude: number;
  gps_accuracy_meters: string;
  observed_timestamp: string;
  privacy_consent_given: boolean;
  computed_classification: string;
  distance_to_boundary_meters: string | null;
  spatial_reasoning_explanation: string;
  spatial_result: unknown;
  current_status: string;
}

export function observationRowToDto(
  r: ObservationRow,
  evidenceList: ReturnType<typeof evidenceRowToDto>[],
  eventsTimeline: ReturnType<typeof reviewEventRowToDto>[]
) {
  return {
    observationId: r.observation_id,
    caseId: r.case_id,
    siteId: r.site_id,
    geometryId: r.geometry_id,
    reporterType: r.reporter_type,
    category: r.category,
    factualDescription: r.factual_description,
    latitude: r.latitude,
    longitude: r.longitude,
    gpsAccuracyMeters: Number(r.gps_accuracy_meters),
    observedTimestamp: r.observed_timestamp,
    privacyConsentGiven: r.privacy_consent_given,
    spatialResult: r.spatial_result,
    computedClassification: r.computed_classification,
    distanceToBoundaryMeters: r.distance_to_boundary_meters === null ? null : Number(r.distance_to_boundary_meters),
    spatialReasoningExplanation: r.spatial_reasoning_explanation,
    currentStatus: r.current_status,
    evidenceList,
    eventsTimeline,
  };
}
