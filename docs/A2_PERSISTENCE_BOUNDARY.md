# A2 — Persistence Boundary & Backend Integration Architectural Audit

> **Document Type**: Architectural Audit & Persistence Boundary Specification  
> **Project**: Heritage Pulse (SIH 2026 PS 26197)  
> **Active Prototype Site**: Fort of Shivner (Shivneri Fort) [MUMMH015], Junnar, Maharashtra  
> **Status**: AUTHORITATIVE AUDIT — PRIOR TO A2 IMPLEMENTATION

---

## A. Current Architecture

The Heritage Pulse application currently operates on the canonical **A1/A1.5 Contract Specification** (`heritagePulseContract.ts`, `src/shared/types/index.ts`).
The architecture consists of:
1. **Presentation Layer**: React 18 SPA (Vite, Tailwind CSS, MapLibre GL) structured into feature modules:
   - `site-context`
   - `field-capture`
   - `spatial-result`
   - `change-ledger`
   - `reviewer-workflow`
   - `reviewer-packet`
2. **Spatial Reasoning Layer**: Pure deterministic geodesic geometry math (`spatialEngine.ts`) running Turf.js on three distinct Bhuvan ISRO MultiPolygon layers (`asi:protected_areas`, `asi:prohibited_boundary`, `asi:regulated_boundary`).
3. **Change Ledger & State Layer**: Single in-memory store instance (`ledgerStore.ts`) providing case instantiation, retrieval, and status transition logging.
4. **Contract Layer**: `heritagePulseContract.ts` defining canonical types, legal disclaimers, permitted reviewer actions, and standardized reviewer packet construction (`buildCanonicalReviewerPacketData`).

---

## B. Current Persistence Mechanism

* **Current Mechanism**: **In-Memory Store with Ad-Hoc Component Storage Sync**.
* **Physical Storage**:
  - Primary store: `ledgerStore.cases` JavaScript array in heap memory, initialized from `MOCK_CASES`.
  - Secondary/ad-hoc: Individual UI components (`FieldCapturePage.tsx`, `ReviewerActionCard.tsx`, `DemoQuickbar.tsx`) manually write serialized payload JSON strings into browser `sessionStorage` and `localStorage` using keys like `case_${caseId}`.
* **Durability Level**: **IN-MEMORY / AD-HOC CLIENT-STORED**.
  - `ledgerStore` itself does not hydrate from or sync to `localStorage` upon initialization.
  - Page refresh reconstructs `ledgerStore` from static `MOCK_CASES`, causing any newly created cases or recorded reviewer decisions to vanish from the central `ledgerStore.cases` array unless retrieved via individual storage keys.

---

## C. Current Capture Write Path

1. User enters field observation on `/capture` (`FieldCapturePage.tsx`).
2. Coordinates, accuracy, description, category, and photo are validated.
3. `resolveMultiTierSpatialResult()` calculates the multi-tier spatial verdict **ONCE** at the submission boundary.
4. `FieldCapturePage.tsx` calls `ledgerStore.createCase(data, spatialResult)`.
5. `ledgerStore.createCase()`:
   - Generates sequential Case ID via `generateNextCaseId('MH')`.
   - Creates UUIDs for observation and evidence.
   - Appends initial 4 timeline events (`OBSERVATION_CREATED`, `LOCATION_CAPTURED`, `SPATIAL_CALCULATED`, `REVIEW_ACTION_RECORDED`).
   - Prepends new `ObservationRecord` to `this.cases`.
6. `FieldCapturePage.tsx` manually writes `sessionStorage.setItem('case_' + caseId, ...)` and `localStorage.setItem(...)`.
7. Navigates to `/result/${caseId}`.

---

## D. Current Case Retrieval Path

1. **Direct URL navigation** (`/result/:caseId`, `/case/:caseId`, `/reviewer/:caseId`, `/packet/:caseId`):
   - Component calls `ledgerStore.getCaseById(caseId)`.
   - Looks up case in `this.cases` by case-insensitive ID match.
2. **List Views** (`/ledger`, `/reviewer`):
   - Component calls `ledgerStore.getCases()`.
   - Returns a shallow copy `[...this.cases]`.

---

## E. Current Spatial Result Ownership

* **Authoritative Field**: `observation.spatialResult?: SpatialResult` (along with top-level fields `computedClassification`, `distanceToBoundaryMeters`, `spatialReasoningExplanation`).
* **Generation**: Generated **ONCE** at capture submission in `FieldCapturePage.tsx` via `resolveMultiTierSpatialResult()`.
* **Ownership**: Stored on the `ObservationRecord` in `ledgerStore`.
* **Downstream Access**:
  - `SpatialResultPage.tsx` reads `caseRecord.spatialResult`.
  - `CaseDetailPage.tsx` reads `caseRecord.spatialResult`.
  - `ReviewerQueuePage.tsx` reads `caseRecord.computedClassification`.
  - `ReviewerPacketPreview.tsx` reads `buildCanonicalReviewerPacketData(storeRecord).spatialVerdict`.
  - **Zero spatial recalculation occurs downstream.**

---

## F. Current Evidence Ownership

* **Structure**: `observation.evidenceList: EvidenceRecord[]`.
* **Fields**: `evidenceId`, `observationId`, `fileUrl`, `fileMimeType`, `fileSizeBytes`, `sha256Checksum`, `uploadTimestamp`.
* **Storage State**: `fileUrl` holds temporary blob/object URLs or sample preview strings. Metadata (SHA-256 digest, MIME, byte size) is attached to the `ObservationRecord` within `ledgerStore`.

---

## G. Current Ledger Event Ownership

* **Structure**: `observation.eventsTimeline: ReviewEvent[]`.
* **Fields**: `eventId`, `caseId`, `timestamp`, `eventType`, `actorRole`, `summary`, `actionTaken`, `reviewerNotes`, `resultingStatus`.
* **Ownership**: Maintained directly on each `ObservationRecord` in `ledgerStore`.

---

## H. Current Reviewer Action Write Path

1. Reviewer navigates to `/reviewer` or `/reviewer/console` (`ReviewerActionCard.tsx` / `ReviewerConsolePage.tsx`).
2. Reviewer selects an action and inputs rationale notes (validated against banned language).
3. Component calls `ledgerStore.recordReviewAction(caseId, action, notes, 'REVIEWER')`.
4. `ledgerStore.recordReviewAction()`:
   - Finds target case in `this.cases`.
   - Creates a new `ReviewEvent` with `eventType: 'REVIEW_ACTION_RECORDED'`.
   - Returns updated case with new status and `eventsTimeline: [...oldTimeline, newEvent]`.
   - Replaces case in `this.cases`.
5. Component manually attempts to sync `sessionStorage` / `localStorage`.

---

## I. Current Packet Read Path

1. User navigates to `/packet/:caseId`.
2. `ReviewerPacketPreview.tsx` extracts `caseId` from route parameters.
3. Invokes `ledgerStore.getCaseById(caseId)`.
4. Passes record to `buildCanonicalReviewerPacketData(storeRecord)` in `heritagePulseContract.ts`.
5. Renders printable document directly from the resulting `CanonicalReviewerPacketData`.
6. Export performed via browser native `window.print()`.

---

## J. What Survives Page Refresh

* Seeded mock cases (`HP-MH-2026-0001`, `HP-MH-2026-0002`): **SURVIVES** (hardcoded in `MOCK_CASES`).
* Newly submitted user cases: **FAILS TO SURVIVE IN STORE** (lost from in-memory `ledgerStore.cases` array because `ledgerStore` lacks auto-hydration from `localStorage`).
* Reviewer actions on mock cases: **FAILS TO SURVIVE IN STORE** (reverts on refresh).

---

## K. What Survives Browser Restart

* Seeded mock cases: **SURVIVES** (re-instantiated).
* Newly submitted user cases: **FAILS TO SURVIVE IN STORE**.
* Reviewer actions: **FAILS TO SURVIVE IN STORE**.

---

## L. What Survives Application / Server Restart

* Seeded mock cases: **SURVIVES** (code-level constants).
* User runtime cases & actions: **FAILS TO SURVIVE** (no server database connected).

---

## M. What is Memory-Only

* `ledgerStore.cases` runtime array.
* Case ID `sequenceCounter` in `caseGenerator.ts`.
* Active UI selections and filter states.

---

## N. What is localStorage / sessionStorage

* Ad-hoc `case_${caseId}` cache entries written independently by `FieldCapturePage.tsx`, `ReviewerActionCard.tsx`, and `DemoQuickbar.tsx`.
* Not unified behind `ledgerStore`.

---

## O. Whether a Backend Exists

* **No live backend service or server process exists in the runtime environment.**
* Application runs as a pure client-side Single Page Application served via Vite on `http://localhost:3001/` (or default port).

---

## P. Whether BACKEND_SCHEMA.sql Matches Actual Contracts

* **Discrepancy Analysis**:
  - `BACKEND_SCHEMA.sql` is a draft PostGIS SQL schema from initial planning.
  - Enums in SQL (`visible_change_category_enum`, `spatial_classification_enum`, `review_action_enum`) use earlier naming (e.g. `ALTERATION` and `VISUAL_OBSTRUCTION` as separate enums instead of canonical `ALTERATION_OR_OBSTRUCTION`; `NO_SPATIAL_CONCERN` instead of `NO_SPATIAL_CONCERN_INDICATED`).
  - Single geometry record in SQL seed rather than the 3 authoritative Bhuvan layers (`asi:protected_areas`, `asi:prohibited_boundary`, `asi:regulated_boundary`).
  - Does not reflect the finalized A1/A1.5 canonical contract.

---

## Q. Existing Dependencies That Can Be Reused

* `@turf/turf` (^7.2.0): authoritative geodesic calculation engine.
* `maplibre-gl` (^5.2.0): vector map rendering.
* `clsx` & `tailwind-merge`: styling utilities.
* `lucide-react`: icon set.
* `react-router-dom`: client-side routing.
* `vitest`: testing framework.

---

## R. Risks

1. **Data Loss on Reload**: User submits observation during live evaluator demo $\rightarrow$ refreshes browser $\rightarrow$ case missing from Reviewer Queue.
2. **Ad-Hoc Storage Fragmentation**: Individual components writing different JSON shapes to `localStorage` bypasses `ledgerStore` validation.
3. **Case ID Collision**: In-memory `sequenceCounter` resets to 3 on page refresh, potentially generating duplicate `HP-MH-2026-0004` if cases exist in storage.
4. **Non-Atomic Operations**: Partial writes if storage fails or quota is exceeded.
5. **Phantom / Duplicate Case Stores**: Introducing a secondary storage layer risks desynchronizing UI components.

---

## S. Recommended A2 Strategy

**Strategy: Authoritative Unified Client-Durable Persistence Boundary (`ClientStorageAdapter` behind `ledgerStore`)**.

1. **Encapsulate Persistence in `ledgerStore`**:
   - Create a durable `PersistenceAdapter` interface and implement a robust `ClientStorageAdapter` supporting `localStorage` with fallback to `sessionStorage` and in-memory storage for test/headless environments.
2. **Auto-Hydration on Startup**:
   - On store initialization, hydrate `ledgerStore` from persistent storage, merging on top of base seed cases (`MOCK_CASES`).
3. **Atomic Write-Through**:
   - Every mutating operation (`createCase`, `recordReviewAction`, `appendLedgerEvent`, `resetDemoData`) writes atomically to the storage adapter.
4. **Dynamic Sequential ID Recovery**:
   - `generateNextCaseId` dynamically computes the sequence number from all existing persisted case IDs to prevent collisions across sessions.
5. **Rich Entity & Provenance Preservation**:
   - Ensure `spatialResult`, evidence metadata, source layer provenance, and append-only review events are stored and retrieved without loss or mutation.
6. **Remove Ad-Hoc UI Storage Calls**:
   - Clean up `FieldCapturePage.tsx`, `ReviewerActionCard.tsx`, and `DemoQuickbar.tsx` to read/write exclusively through `ledgerStore`.
7. **Safe Demo Reset**:
   - Provide `resetDemoData()` that resets demo cases without touching user cases, source geometry, or Bhuvan provenance records.

---

## T. Why the Selected Strategy is Safer Than Alternatives

1. **Zero External Dependency / Zero Infrastructure Failure**: Does not require running Docker, PostgreSQL daemon, PostGIS extensions, or Node backend servers that could crash during a hackathon evaluation demo.
2. **True Reload & Restart Durability**: Cases, review actions, and evidence survive browser refresh, tab closing, and browser restart.
3. **Single Source of Truth**: All UI components interact with ONE unified interface (`ledgerStore`), eliminating state fragmentation.
4. **Preserves 100% of A1/A1.5 Contract**: Zero breaking changes to types, contracts, or spatial math.
5. **Defensible and Verifiable**: Fully testable via automated Vitest suites including simulated restart/reload lifecycle tests.
