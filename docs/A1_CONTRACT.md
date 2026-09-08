# A1 MINIMUM CANONICAL DATA CONTRACT & SPECIFICATION
## HERITAGE PULSE (हेरITAGE PULSE) — SIH 2026 PS 26197
*Contract Version*: `1.0.0-A1`  
*Scope*: Reconciled Minimum Shared Data Contract for Hackathon Prototype Vertical Slice

---

## 1. Product Scope & Non-Legal Rule

Heritage Pulse converts community/field observations into structured, map-aware, uncertainty-labelled cases for curator review.

**Non-Legal Decision Support Rule**:
Heritage Pulse does NOT issue legal findings, confirm illegal encroachments, identify property offenders, or replace statutory authorities. All outputs are indicative decision support subject to official verification.

---

## 2. Reconciled Status Definitions

### 2.1 Reviewer Status Set
- **`SUBMITTED`** (`SUBMITTED_FOR_REVIEW`): Case logged in Change Ledger; awaiting curator triage.
- **`ADDITIONAL_INFO_NEEDED`** (`ADDITIONAL_INFORMATION_NEEDED`): Reviewer requested photo/GPS telemetry clarification.
- **`FIELD_VERIFICATION_RECOMMENDED`**: Case flagged for on-ground physical survey.
- **`REFERRED`**: Evidence packet compiled and forwarded to competent statutory authority.
- **`CLOSED_NO_ACTION`** (`CLOSED_REVIEWED`): Case cataloged in Change Ledger; no further action required.
- **`CLOSED_DUPLICATE`**: Case closed as duplicate or out of scope.
- **`CLOSED_INSUFFICIENT_EVIDENCE`** (`CLOSED_INSUFFICIENT_LOCATION_EVIDENCE`): Case closed due to unresolvable sensor GPS error ($>35\text{m}$).

### 2.2 Pre-Submission Lifecycle State
- **`DRAFT`**: Unsubmitted field observation data entered locally prior to ledger dispatch.

---

## 3. Spatial Result Ownership & Calculation Flow

- **Authoritative Calculation Boundary**: Executed ONCE during submission in `FieldCapturePage.tsx` via `calculateSpatialResult()` and passed to `ledgerStore.createCase()`.
- **Ownership**: Stored on `CaseRecord.spatialAssessment` (aliased to `spatialResult`).
- **Downstream Rule**: Downstream pages (`SpatialResultPage`, `CaseDetailPage`, `ReviewerQueuePage`, `ReviewerActionCard`, `ReviewerPacketPreview`) consume the stored spatial assessment directly without duplicate recalculation.

---

## 4. Canonical Entities

```typescript
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
  centroid: [number, number];
}

export interface GeometryRecord {
  geometryId: string;
  siteId: string;
  versionLabel: string;
  geojson: GeoJSON.FeatureCollection | GeoJSON.Feature | GeoJSON.Geometry;
  sourceDocumentOrUrl: string;
  captureDate: string;
  limitationNote: string;
  governanceState: 'SOURCE_LOGGED' | 'DRAFT' | 'UNDER_REVIEW' | 'PILOT_PUBLISHED' | 'RETIRED';
  layerConfidenceScore: number;
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
  reporterType: 'VISITOR' | 'RESIDENT' | 'STUDENT' | 'VOLUNTEER';
  category: ObservationType;
  factualDescription: string;
  latitude: number;
  longitude: number;
  gpsAccuracyMeters: number;
  observedTimestamp: string;
  privacyConsentGiven: boolean;
  spatialResult: SpatialResult;
  spatialAssessment?: SpatialResult;
  currentStatus: CaseStatus;
  evidenceList: EvidenceRecord[];
  eventsTimeline: ReviewEvent[];
}
```
