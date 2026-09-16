# Changelog

All notable changes to the Heritage Pulse project under Person 4's integration and workflow execution will be documented in this file.

## [Unreleased] - Contract Baseline & Reconciliation Status

### Contract Divergence Log (Main vs origin/ameya/gate-01-product-contract)
- **Status**: Pending reconciliation with Ameya. All Person 4 deliverables (P1–P8) are built strictly against `main`'s canonical contract baseline.
- **ObservationRecord Structure**:
  - `main`: Uses nested `spatialResult: SpatialResult` holding classification, distance, and explanation.
  - `origin/ameya/gate-01-product-contract`: Uses flattened fields (`computedClassification`, `distanceToBoundaryMeters`, `spatialReasoningExplanation`) with optional `spatialResult?: SpatialResult`.
  - *Decision for P1-P8*: Adopt `main`'s canonical nested `spatialResult: SpatialResult` across all UI consumers and store methods.
- **ReviewEvent Event Types & Properties**:
  - `main`: Includes extended review lifecycle event types (`'INFO_REQUESTED' | 'STATUS_UPDATED' | 'CASE_CLOSED'`) and optional `title?: string`.
  - `origin/ameya/gate-01-product-contract`: Limited to `'REVIEW_ACTION_RECORDED'`.
  - *Decision for P1-P8*: Rely on `main`'s event types for reviewer audit logging.
- **Ledger Store Review Methods**:
  - `main`: Exposes `appendReviewerDecision(caseId, actionTitle, resultingStatus, notes, eventType, reviewerRole)` with append-only timeline generation.
  - `origin/ameya/gate-01-product-contract`: Lacks this method.
  - *Decision for P1-P8*: Use `ledgerStore.appendReviewerDecision` on `main` for all reviewer action drawer submissions.
- **Observation Categories & Case Statuses**:
  - Both branches agree on `caseStatuses.ts` and `PRODUCT_RULES.json`.
  - Categories on `main`: 7 canonical observation types (`POSSIBLE_CONSTRUCTION`, `POSSIBLE_ENCROACHMENT`, `PHYSICAL_DAMAGE`, `DUMPING_OR_WASTE`, `BLOCKED_ACCESS`, `ALTERATION_OR_OBSTRUCTION`, `OTHER_VISIBLE_CHANGE`).

### Phase 2: Convert Screens to Real Data Consumers (P2) - Completed
- **Wired Field Capture to Shared Store**:
  - `FieldCapturePage.tsx`: Integrated directly with `calculateSpatialResult` and `ledgerStore.createCase(...)`.
  - Canonical case ID format (`HP-MH-YYYY-XXXX`) generated via `generateNextCaseId`.
  - On successful capture, automatically navigates to `/result/${createdCase.caseId}`.
- **Removed sessionStorage Fallbacks & Dual Paths**:
  - `CaseDetailPage.tsx`: Removed `SessionCasePayload` and `sessionStorage` fallback; loads solely from `ledgerStore.getCaseById`. Appends reviewer decisions from `eventsTimeline` to ledger view.
  - `ReviewerQueuePage.tsx`: Removed `sessionStorage` scanning loops and `SessionCasePayload`; loads solely from `ledgerStore.getCases()`.
  - `ReviewerActionCard.tsx`: Removed `sessionStorage` sync; submits decisions via `ledgerStore.appendReviewerDecision`.
  - `ReviewerPacketPreview.tsx`: Removed `SessionCasePayload` and `sessionStorage` fallback; loads solely from `ledgerStore.getCaseById`.
  - `DemoQuickbar.tsx`: Removed `sessionStorage.setItem` duplication.

### Phase 3: Capture Failure States (P3) - Completed
- **Actionable Validation Feedback in Field Capture**:
  - Missing category: Explicit guidance notice instructing user to select an approved category.
  - Empty description: Guidance notice prompting for factual description without accusatory language.
  - Missing location: Clear prompt to capture hardware GPS coordinates.
  - Degraded GPS accuracy (> 35m): Notice warning that horizontal error exceeds the 35m threshold and instructing re-positioning under open sky.
  - Missing photo guidance: Informative hint noting photo evidence provides verifiable context.
  - Unsupported image format: Inline validation in `PhotoDropzone.tsx` accepting only JPEG, PNG, or WebP.
  - Image too large (> 10MB): Size limit check displaying exact selected size and prompting for compressed capture.
  - Offline/failed persistence: Graceful error banner handling store/network failures with retry instruction.
  - Geometry gate status: Top advisory banner indicating source layer confidence status when unreviewed or retired.

### Phase 4: Reviewer Workflow Integration (P4) - Completed

- **Reviewer Queue Filtering**:
  - `ReviewerQueuePage.tsx`: Added status and category filtering controls across all 7 observation categories and review statuses.
  - Live refresh triggers reload directly from `ledgerStore.getCases()` after reviewer actions.
- **Reviewer Action Drawer & Sealed Record Protection**:
  - `ReviewerActionCard.tsx`: Displays comprehensive case details (Case ID, observation category & description, evidence reference with SHA-256 checksum, spatial result classification & perimeter distance, GPS error circle, and source geometry provenance).
### Phase 5: Packet Preview Integration (P5) - Completed
- **Single Shared Packet-Data Function**:
  - Created `src/features/reviewer-packet/packetData.ts` exporting `getReviewerPacketData(caseId)`.
  - Consumed by both interactive screen view, print preview, and integration tests with zero duplicate hardcoded values.
- **Explicit Non-Legal Determination Statement & Visible Disclaimers**:
  - Included `CANONICAL_LEGAL_DISCLAIMER` and `CANONICAL_NON_LEGAL_NOTICE` in formal document header and print layout.
  - Sourced provenance section dynamically displays protected site data, authoritative agency, layer version, and verbatim limitation note.

### Phase 6: Demo Quickbar Safety (P6) - Completed
- **Store Reset Capability**:
  - Added `ledgerStore.resetDemoData()` method to reset in-memory cases back to the initial `MOCK_CASES` baseline without page reload.
  - Added a dedicated "Reset Store" button in `DemoQuickbar.tsx` with animated confirmation badge.
- **Source Geometry Provenance & Active Scenario Indicators**:
  - Displays source geometry version label (`v1.0-bhuvan-protected-7068`) and confidence percentage (95%) in the quickbar footer.
  - Generates distinct canonical case IDs (`HP-MH-YYYY-XXXX`) via `ledgerStore.createCase(...)` without overwriting real or previously captured cases.

### Phase 7: Integration and Regression Tests (P7) - Completed
- **Added Comprehensive Vertical Slice Test Suite (`src/test/person4-journey.test.ts`)**:
  - Journey 1: Field Capture to Ledger Store & Retrieval (canonical case ID, nested spatial result, SHA-256 evidence).
  - Journey 2: Reviewer Queue Live Querying & Filtering (verifying 7 observation categories and statuses).
  - Journey 3: Reviewer Action Append-Only Lifecycle (preserving event timeline history, actor roles, resulting statuses).
  - Journey 4: Shared Packet Data Function verification (all 5 formal dossier sections, canonical legal disclaimers, non-legal notices).
  - Journey 5: Benchmark Scenarios Evaluation (all 4 demo scenarios correctly classified by `calculateSpatialResult`).
  - Journey 6: LedgerStore Reset Safety (restoring initial baseline mock cases without memory leaks or state contamination).
  - Journey 7: Non-Accusatory Language Compliance (zero banned phrases across all notices, scenarios, and outputs).
- **Test Suite Results**: 44 passing tests across 5 test suites (0 failures).

### Phase 8: Operational Developer Documentation & Runbook (P8) - Completed
- **Created `DEMO_RUNBOOK.md`**:
  - Comprehensive runbook detailing local environment commands (`dev`, `test`, `build`, `contract:validate`, `team:validate`).
  - Evaluator demo quickbar operations and 1-click triage of 4 benchmark scenarios.
  - Step-by-step field observation capture guide.
  - Reviewer queue triage and decision drawer guide with sealed case protection rules.
  - Unified packet generation and A4 print verification guide.
  - Complete error handling and input validation table.
  - Mandatory legal disclaimers and non-accusatory language contract reference.
  - Contract baseline documentation covering Ameya reconciliation points.

## [P2 Gap Audit & Truthful Integration Pass] - Completed

### 1. Persistence Behavior (Gap 1)
- Implemented transparent durable local adapter behind `ledgerStore`:
  - Stores case records and immutable event timelines under `localStorage` key `heritage_pulse_cases_v1`.
  - Survives hard browser refresh (`Ctrl + F5`) and browser restarts.
  - Includes safe parsing with automatic fallback to `MOCK_CASES` on corrupted or disabled storage.
  - Added unit and journey tests verifying save, reload, corrupt recovery, and reset behavior.

### 2. Spatial Machine-Status Assertions (Gap 2)
- Added explicit machine-readable status assertions for all 4 benchmark scenarios:
  - `scenario-1-inside`: `POTENTIAL_ZONE_CONCERN`
  - `scenario-2-outside`: `NO_SPATIAL_CONCERN_INDICATED`
  - `scenario-3-near-boundary`: `LOCATION_UNCERTAIN`
  - `scenario-4-poor-gps`: `EVIDENCE_INSUFFICIENT`
- Documented conceptual mapping against prompt names (`INSIDE_PROHIBITED`, `OUTSIDE_BOUNDARIES`, `POOR_GPS`) as `REQUIRES AMEYA DECISION`.

### 3. Evidence Contract Completeness (Gap 3)
- Populated full evidence metadata in `ledgerStore.createCase`:
  - Preserves `evidenceId`, `observationId`, `fileUrl`, `fileMimeType`, `fileSizeBytes`, `sha256Checksum`, and `uploadTimestamp`.
  - Handled missing photo cases gracefully with empty `evidenceList: []` and `null` photo metadata in packet.
  - Enforced format validation (`image/jpeg`, `image/png`, `image/webp`) and 10MB file size limit.

### 4. Removed Unsupported Provenance Claims (Gap 4)
- Replaced misleading `95% conf` claim in `DemoQuickbar.tsx` with truthful `PILOT_PUBLISHED · Indicative (Uncertified)` governance label.
- Traced all displayed provenance fields directly to `PROVENANCE_METADATA` and `SHIVNERI_SITE`.

### 5. Reviewer Transition Consistency (Gap 5)
- Added `CLOSE_DUPLICATE` to `PERMITTED_ACTIONS` in `ReviewerActionCard.tsx`.
- Enforced sealed closed-case protection in `ledgerStore.appendReviewerDecision`: terminal statuses (`CLOSED_REVIEWED`, `CLOSED_DUPLICATE`, `CLOSED_INSUFFICIENT_LOCATION_EVIDENCE`) reject further modifications.
- Permitted official authority closure on `REFERRED` cases.
- Documented status vocabulary mapping (`REQUIRES AMEYA DECISION`).

### 6. Canonical Packet-Data Verification (Gap 6)
- Expanded `ReviewerPacketData` in `packetData.ts` to expose all 18 canonical fields.
- Eliminated synthetic duplicate events in `ReviewerPacketPreview.tsx` by mapping `rawEvents` directly.
- Guaranteed `latestReviewEvent` reflects the latest decision in the timeline.

### 7. Reset Safety (Gap 7)
- Proved `SHIVNERI_GEOMETRY` and `PROVENANCE_METADATA` remain 100% identical and uncorrupted across store resets.
- Confirmed reset cleans local storage and restores `MOCK_CASES` without duplicate IDs.
- Enforced preservation of user-created field observations: `resetDemoData()` prunes only Quickbar demo scenarios (`demoCaseIds`) while keeping real citizen field observations intact.
- Added 2-step visible confirmation on `DemoQuickbar.tsx` ("Confirm Demo Reset?").

### 8. Testing Methodology Clarification (Gap 8)
- Formally classified test suite as store, spatial engine, and journey integration tests (51 tests passing across 5 suites).
- Documented that visual DOM and print styling are manually verified via development server.

## [Release-Readiness Audit] - Completed
- **Spatial Machine-Status Contract**: Canonical values (`POTENTIAL_ZONE_CONCERN`, `NO_SPATIAL_CONCERN_INDICATED`, `LOCATION_UNCERTAIN`, `EVIDENCE_INSUFFICIENT`, `SOURCE_UNAVAILABLE`) preserved intact on `main`. Divergence from completion plan conceptual names documented as `REQUIRES AMEYA DECISION`.
- **Honest Evidence Metadata Audit**: Audited all 10 fields (6 Verified, 1 Partially Verified, 3 Not Part of Current Contract / Requires Ameya Decision). Packet displays only genuinely stored fields.
- **Reviewer Transition Governance**: Sealed closed-case protection enforced in both `ledgerStore.appendReviewerDecision` and `recordReviewAction` for `CLOSED_REVIEWED`, `CLOSED_DUPLICATE`, and `CLOSED_INSUFFICIENT_LOCATION_EVIDENCE`. Documented duality of `REFERRED` (terminal for local queue, closable by statutory authority) as `REQUIRES AMEYA DECISION`.
- **Canonical Initial Reviewer Status**: Clarified that `SUBMITTED_FOR_REVIEW` is the canonical machine-readable status in types, store, and case statuses; `SUBMITTED` is the shortened UI table badge display label.
- **Reset Safety**: Tested and verified that user-created observations survive demo resets, geometry and provenance are immutable, and repeated resets are idempotent.
- **Manual Verification Status**: Formally classified that 11-step manual browser verification steps (browser layout, responsive drawer, MapLibre rendering, A4 print preview, hard browser refresh, and selective demo reset) are documented in `DEMO_RUNBOOK.md` §9.2; execution remains pending.


