# A1 CONTRACT DECISIONS & ARCHITECTURAL FREEZE
## HERITAGE PULSE (हेरITAGE PULSE) — SIH 2026 PS 26197
*Owner*: Ameya (Backend, Spatial Math, Gate, Architecture Lead)  
*UI Integration*: Person 4 (UI & Visual Workflow Integration Lead)  
*Reconciliation Date*: September 2026

---

## 1. Review Status Reconciliation

### Verification of Statuses Across Codebase
An empirical scan of `src/` reveals how reviewer statuses are defined, stored, and displayed:

| Canonical Domain Status | Underlying Store / Code Key | Genuine Existence & Usage in Repository | Rationale for Retention / Mapping |
|---|---|---|---|
| **`SUBMITTED`** | `SUBMITTED_FOR_REVIEW` | Used in `ledgerStore.ts` (Line 87), `ReviewerQueuePage.tsx` (Line 50), and `e2e-journey.test.ts`. | Primary entry status when an observation is logged into the Change Ledger. |
| **`ADDITIONAL_INFO_NEEDED`** | `ADDITIONAL_INFORMATION_NEEDED` | Used in `ReviewerActionCard.tsx` (Line 39), `caseStatuses.ts` (Line 26), and `ReviewerQueuePage.tsx` (Line 53). | Reviewer requests photo context or GPS telemetry clarification. |
| **`FIELD_VERIFICATION_RECOMMENDED`** | `FIELD_VERIFICATION_RECOMMENDED` | Used in `ReviewerActionCard.tsx` (Line 48), `ReviewerQueuePage.tsx` (Line 55), and `regression-and-journey.test.ts`. | Reviewer schedules on-ground physical inspection by a heritage surveyor. |
| **`CLOSED_NO_ACTION`** | `CLOSED_REVIEWED` | Used in `ReviewerActionCard.tsx` (Line 66), `caseStatuses.ts` (Line 61), and `ReviewerQueuePage.tsx` (Line 61). | Reviewer marks observation cataloged with no further action required. |
| **`CLOSED_DUPLICATE`** | `CLOSED_DUPLICATE` | Used in `caseStatuses.ts` (Line 54) and `ReviewerQueuePage.tsx` (Line 60). | Case closed as duplicate or out of scope. |
| **`CLOSED_INSUFFICIENT_EVIDENCE`** | `CLOSED_INSUFFICIENT_LOCATION_EVIDENCE` | Used in `caseStatuses.ts` (Line 47) and `ReviewerQueuePage.tsx` (Line 59). | Case closed due to unresolvable GPS error ($>35\text{m}$). |
| **`DRAFT`** | `DRAFT` | Used in `ledgerStore.ts` (Lines 60, 69, 78) for intermediate timeline events and `SiteContextCard.tsx`. | Genuinely required: Represents local unsubmitted observation capture prior to ledger dispatch. |
| **`REFERRED`** | `REFERRED` | Used in `ReviewerActionCard.tsx` (Line 57), `ReviewerQueuePage.tsx` (Line 57), `regression-and-journey.test.ts` (Lines 86, 91), and `e2e-journey.test.ts` (Line 318). | Genuinely required: Reviewer action to compile evidence packet and refer case to competent statutory authority. |

**Decision**:
1. Domain Canonical Status Set: `SUBMITTED`, `ADDITIONAL_INFO_NEEDED`, `FIELD_VERIFICATION_RECOMMENDED`, `REFERRED`, `CLOSED_NO_ACTION`, `CLOSED_DUPLICATE`, `CLOSED_INSUFFICIENT_EVIDENCE`.
2. Lifecycle Status: `DRAFT` is retained as pre-submission local capture state.
3. Compatibility Mappings: Mapping helpers in `heritagePulseContract.ts` map between display labels and underlying store keys (`SUBMITTED_FOR_REVIEW` $\leftrightarrow$ `SUBMITTED`, `ADDITIONAL_INFORMATION_NEEDED` $\leftrightarrow$ `ADDITIONAL_INFO_NEEDED`, `CLOSED_REVIEWED` $\leftrightarrow$ `CLOSED_NO_ACTION`).

---

## 2. Spatial Result Ownership

### Ownership Reconciliation
- **Reporter Observation (`ObservationRecord` / `ObservationTelemetry`)**: Factual reporter-provided data (`observationId`, `category`, `factualDescription`, `latitude`, `longitude`, `gpsAccuracyMeters`, `observedTimestamp`, `privacyConsentGiven`).
- **Complete Case (`CaseRecord` / `ObservationRecord`)**: The complete reviewable case containing observation telemetry, evidence list (`evidenceList`), geometry linkage (`siteId`, `geometryId`), spatial assessment (`spatialAssessment` / `spatialResult`), current review status (`currentStatus`), and ledger timeline (`eventsTimeline`).

**Decision**:
System-generated spatial reasoning results live on `CaseRecord.spatialAssessment` (aliased to `spatialResult` for backwards compatibility with existing UI components & tests). The spatial result is NEVER duplicated or recalculated independently by downstream pages.

---

## 3. Authoritative Spatial Calculation Flow

### Verification of Code Flow

1. **Exact File**: `src/features/field-capture/FieldCapturePage.tsx`
2. **Exact Function**: `handleSubmit`
3. **Calculation Call**:
   ```typescript
   const spatialResult = calculateSpatialResult(
     {
       latitude: coordinates[1],
       longitude: coordinates[0],
       gpsAccuracyMeters: accuracyMeters,
       factualDescription: description.trim(),
     },
     SHIVNERI_GEOMETRY
   );
   ```
4. **Storage Call**:
   ```typescript
   const newCase = ledgerStore.createCase(
     {
       siteId: 'shivneri-fort',
       geometryId: SHIVNERI_GEOMETRY.geometryId,
       category: categoryId as ObservationType,
       factualDescription: description.trim(),
       latitude: coordinates[1],
       longitude: coordinates[0],
       gpsAccuracyMeters: accuracyMeters,
       reporterType: 'VISITOR',
       photoUrl: photo ? photo.previewUrl : undefined,
     },
     spatialResult
   );
   ```
5. **Exact Storage Location**: `ledgerStore.cases` array (in-memory) + `sessionStorage` (`case_${caseId}`) + `localStorage` (`case_${caseId}`).
6. **Downstream Consumers**:
   - `SpatialResultPage.tsx` (`/result/:caseId`): Reads `caseRecord.spatialResult`.
   - `CaseDetailPage.tsx` (`/case/:caseId`): Reads `storeRecord.spatialResult`.
   - `ReviewerQueuePage.tsx` (`/reviewer`): Reads `c.spatialResult.classification`.
   - `ReviewerActionCard.tsx` (`/reviewer/:caseId`): Reads stored case status and timeline.
   - `ReviewerPacketPreview.tsx` (`/packet/:caseId`): Reads `buildCanonicalReviewerPacketData(observation)`.
