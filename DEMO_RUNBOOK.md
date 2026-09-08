# Heritage Pulse — Operational Developer & Judge Evaluation Runbook
**System**: Heritage Pulse (SIH 2026 PS 26197 · ASI Monument MUMMH015 · Fort of Shivner)  
**Branch**: `person4/p1-p8-complete-local` (Person 4 Local Integration Suite)  
**Classification**: Indicative Technical Decision Support & Structured Evidence Packaging  
**Implementation Status**: P2 is complete and hard-refresh persistence is verified via durable local adapter  

---

## 1. Quickstart & Local Environment

### Prerequisites
- Node.js v18+ (tested on Node v20/v22)
- npm v9+

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Run local development server (Manual UI & A4 Print Inspection)
npm run dev
# Default port: http://localhost:5173/

# 3. Execute complete test suite (Store, Spatial Engine & Journey Integration)
npm run test

# 4. Verify non-accusatory language contract (Zero banned phrases in /src)
npm run contract:validate

# 5. Verify task status & dependency integrity
npm run team:validate

# 6. Build production distribution bundle
npm run build
```

---

## 2. Persistence Architecture & Reset Operations

### Persistence Mechanism
`ledgerStore` implements a transparent durable local adapter behind the existing canonical interface:
- **Durable Storage**: Case records and audit events are persisted in `localStorage` under the key `heritage_pulse_cases_v1`.
- **Hard Refresh Survival**: Captured observations and appended reviewer decisions survive hard browser refreshes (`Ctrl + F5`) and browser tab restarts.
- **Graceful Error Recovery**: If storage is corrupted, disabled, or unavailable, `ledgerStore` safely falls back to the canonical in-memory `MOCK_CASES` without crashing.
- **Source Geometry Isolation**: Source geometry and authoritative Bhuvan GIS layers remain immutable in code and are never overwritten by local user data.

### Store Reset Operations ("Reset Demo" with User-Case Safety)
The Evaluator Demo Quickbar (`DemoQuickbar.tsx`) is pinned at the bottom-right of every interactive screen.
- **Dedicated Reset Button with 2-Step Confirmation**: Click "Reset Demo" once to enter confirmation mode ("Confirm Demo Reset?"), click again to execute.
- **Real User-Case Preservation**: `resetDemoData()` prunes temporary Quickbar demo scenarios (`demoCaseIds`) and re-seeds baseline `MOCK_CASES`, while **strictly preserving real user-created field observations** logged through the `/capture` workflow.
- **Destructive Full Reset**: `resetAllData()` is available programmatically for test harness purges to return to the pristine 2-case baseline.
- **Reset Safety**: The reset operation preserves source geometry (`SHIVNERI_GEOMETRY`) and provenance metadata (`PROVENANCE_METADATA`), does not produce duplicate case IDs, and displays an animated visual confirmation toast.

---

## 3. Benchmark Scenarios & Machine-Readable Spatial Statuses

The Quickbar provides 1-click triage for the 4 benchmark scenarios evaluated by `calculateSpatialResult`:

| Scenario ID | Test Name | Machine-Readable Codebase Status | Conceptual Prompt Name | Telemetry / Threshold | Alignment Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `scenario-1-inside` | Clearly Inside | `POTENTIAL_ZONE_CONCERN` | `INSIDE_PROHIBITED` | Lat `19.1980`, Lng `73.8580`, `±4.5m` GPS error | `REQUIRES AMEYA DECISION` |
| `scenario-2-outside` | Clearly Outside | `NO_SPATIAL_CONCERN_INDICATED` | `OUTSIDE_BOUNDARIES` | Lat `19.2085`, Lng `73.8750`, `±5.0m` GPS error | `REQUIRES AMEYA DECISION` |
| `scenario-3-near-boundary` | Near Boundary | `LOCATION_UNCERTAIN` | `LOCATION_UNCERTAIN` | Lat `19.1931`, Lng `73.8528`, `±30.0m` GPS error (overlap disk) | Fully Aligned |
| `scenario-4-poor-gps` | Degraded GPS | `EVIDENCE_INSUFFICIENT` | `POOR_GPS` | Lat `19.1980`, Lng `73.8580`, `±46.0m` GPS error ($> 35\text{m}$) | `REQUIRES AMEYA DECISION` |

> [!WARNING]
> **Spatial-Status Contract Divergence (`REQUIRES AMEYA DECISION`)**:  
> The active codebase exclusively uses: `POTENTIAL_ZONE_CONCERN`, `NO_SPATIAL_CONCERN_INDICATED`, `LOCATION_UNCERTAIN`, `EVIDENCE_INSUFFICIENT`, `SOURCE_UNAVAILABLE`.  
> The conceptual completion plan specified: `INSIDE_PROHIBITED`, `INSIDE_REGULATED`, `OUTSIDE_BOUNDARIES`, `LOCATION_UNCERTAIN`, `POOR_GPS`, `UNREVIEWED_GEOMETRY`.  
> **These enums have NOT been renamed in this task to preserve the canonical main-branch contract.** The mapping is asserted in tests and documented here pending Ameya's formal enum decision. Do NOT consider the spatial contract "fully aligned" until Ameya approves either the codebase names or a migration.

---

## 4. Step-by-Step Field Observation Capture Flow

1. **Navigate to Field Capture**:
   - Visit `/capture` or click "Log Field Observation" in the navigation bar.
2. **Select Observation Category**:
   - Choose one of the 7 approved categories:
     - `Possible construction`: New structure, extension, wall, or foundation.
     - `Possible alteration`: Activity or structure occupying protected-zone area.
     - `Physical damage`: Damaged wall, carving, gateway, staircase, or feature.
     - `Dumping or waste`: Debris or waste near protected feature.
     - `Blocked access`: Obstructed route, entrance, or pathway.
     - `Visual obstruction`: Repair, painting, extension, or signage changing site context.
     - `Other visible change`: Any other notable physical change.
3. **Enter Factual Description**:
   - Provide an objective, non-accusatory description of the observed condition (e.g., "Stone wall displacement observed 10m from northern gate.").
4. **Acquire GPS Hardware Coordinates**:
   - Click "Acquire High-Precision Coordinates" or use simulated field coordinates (e.g., Latitude `19.1980`, Longitude `73.8580`, Accuracy `±4.2m`).
   - If GPS horizontal accuracy exceeds 35 meters, an inline warning banner appears advising re-acquisition under open sky.
5. **Attach Photographic Evidence**:
   - Drag & drop or browse a photo (accepted formats: JPEG, PNG, WebP; max size: 10MB).
   - An inline check verifies file format, file size limit, and SHA-256 integrity metadata.
6. **Submit to Change Ledger**:
   - Click "Record Observation in Change Ledger".
   - The system executes `calculateSpatialResult`, issues a canonical case identifier (`HP-MH-YYYY-XXXX`), persists the record to the durable local store, generates immutable timeline audit events, and redirects to `/result/:caseId`.

---

## 5. Reviewer Triage Queue & Decision Drawer

1. **Navigate to Reviewer Queue**:
   - Visit `/reviewer/queue` or click "Reviewer Triage" in the navigation header.
2. **Filtering Controls**:
   - Filter cases by **Status** across all lifecycle states (`SUBMITTED_FOR_REVIEW`, `ADDITIONAL_INFORMATION_NEEDED`, `FIELD_VERIFICATION_RECOMMENDED`, `REFERRED`, `CLOSED_REVIEWED`, `CLOSED_DUPLICATE`).
   - Filter cases by **Category** across all 7 observation types.
3. **Inspect Case Detail**:
   - Select a case card to view spatial telemetry, boundary distance, GPS error circle, and photographic evidence with SHA-256 checksum.
4. **Submit Reviewer Decision**:
   - Click "Review Case" to open the action drawer (`ReviewerActionCard.tsx`).
   - Select an allowed action:
     - *Request Additional Evidence* (`ADDITIONAL_INFORMATION_NEEDED` · `INFO_REQUESTED`)
     - *Recommend Field Verification* (`FIELD_VERIFICATION_RECOMMENDED` · `STATUS_UPDATED`)
     - *Refer for Official Review* (`REFERRED` · `STATUS_UPDATED`)
     - *Close Case - Reviewed* (`CLOSED_REVIEWED` · `CASE_CLOSED`)
     - *Close Case - Duplicate* (`CLOSED_DUPLICATE` · `CASE_CLOSED`)
   - Enter mandatory administrative rationale (e.g., "Ground inspection scheduled with Junnar conservation team").
   - Click "Submit Reviewer Action". The decision is appended to `eventsTimeline` and immediately synchronized to persistent storage.
5. **Sealed Closed-Case Protection**:
   - Terminal closed statuses (`CLOSED_REVIEWED`, `CLOSED_DUPLICATE`, `CLOSED_INSUFFICIENT_LOCATION_EVIDENCE`) lock the case. Any attempt to modify closed cases is blocked at both the UI drawer and the store level. Cases in `REFERRED` remain eligible for authority review closure (`CLOSED_REVIEWED`).

### 5.1 Canonical Reviewer Lifecycle Transition Matrix

| Current Status | Allowed Next Status | Event Type | Required Note/Reason | Terminal? | UI Action Label |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `DRAFT` | `SUBMITTED_FOR_REVIEW` | `OBSERVATION_CREATED` | System telemetry & factual notes | No | Record Observation |
| `SUBMITTED_FOR_REVIEW` | `ADDITIONAL_INFORMATION_NEEDED` | `INFO_REQUESTED` | Mandatory curator rationale | No | Request Additional Evidence |
| `SUBMITTED_FOR_REVIEW` | `FIELD_VERIFICATION_RECOMMENDED` | `STATUS_UPDATED` | Mandatory curator rationale | No | Recommend Field Verification |
| `SUBMITTED_FOR_REVIEW` | `REFERRED` | `STATUS_UPDATED` | Mandatory referral rationale | Duality* | Refer for Official Review |
| `SUBMITTED_FOR_REVIEW` | `CLOSED_REVIEWED` | `CASE_CLOSED` | Mandatory closure justification | Yes | Close Case |
| `SUBMITTED_FOR_REVIEW` | `CLOSED_DUPLICATE` | `CASE_CLOSED` | Mandatory duplicate reference | Yes | Close Case (Duplicate / Unrelated) |
| `ADDITIONAL_INFORMATION_NEEDED` | `FIELD_VERIFICATION_RECOMMENDED` | `STATUS_UPDATED` | Mandatory curator rationale | No | Recommend Field Verification |
| `ADDITIONAL_INFORMATION_NEEDED` | `REFERRED` | `STATUS_UPDATED` | Mandatory referral rationale | Duality* | Refer for Official Review |
| `ADDITIONAL_INFORMATION_NEEDED` | `CLOSED_REVIEWED` | `CASE_CLOSED` | Mandatory closure justification | Yes | Close Case |
| `ADDITIONAL_INFORMATION_NEEDED` | `CLOSED_INSUFFICIENT_LOCATION_EVIDENCE` | `CASE_CLOSED` | Telemetry justification | Yes | System / Reviewer Close |
| `FIELD_VERIFICATION_RECOMMENDED` | `REFERRED` | `STATUS_UPDATED` | Mandatory referral rationale | Duality* | Refer for Official Review |
| `FIELD_VERIFICATION_RECOMMENDED` | `CLOSED_REVIEWED` | `CASE_CLOSED` | Mandatory inspection report notes | Yes | Close Case |
| `FIELD_VERIFICATION_RECOMMENDED` | `CLOSED_DUPLICATE` | `CASE_CLOSED` | Mandatory duplicate reference | Yes | Close Case (Duplicate / Unrelated) |
| `REFERRED` | `CLOSED_REVIEWED` | `CASE_CLOSED` | Authority conclusion notes | Yes (Authority) | Close Case - Verification Complete |
| `CLOSED_REVIEWED` | None (Sealed) | N/A | Immutable historical record | **Yes** | Blocked / Disabled |
| `CLOSED_DUPLICATE` | None (Sealed) | N/A | Immutable historical record | **Yes** | Blocked / Disabled |
| `CLOSED_INSUFFICIENT_LOCATION_EVIDENCE` | None (Sealed) | N/A | Immutable historical record | **Yes** | Blocked / Disabled |

*\*Note on `REFERRED` Duality (`REQUIRES AMEYA DECISION`)*: In `caseStatuses.ts`, `REFERRED` is annotated with `isTerminal: true` representing handoff from the local triage queue. In `regression-and-journey.test.ts`, statutory authority reviewers are authorized to transition `REFERRED -> CLOSED_REVIEWED`. This governance distinction is enforced accordingly and documented for Ameya's final alignment.

---

## 6. Reviewer Packet Preview & Printable Dossier

1. **Access Dossier Preview**:
   - Navigate to `/packet/:caseId` or click "Generate Formal Review Packet" on any case detail page.
2. **Unified Data Architecture**:
   - Powered by the single shared function `getReviewerPacketData(caseId)` (`src/features/reviewer-packet/packetData.ts`), guaranteeing identical telemetry, classification, and provenance across screen and print views.
3. **5 Formal Dossier Sections**:
   - **Section 1: Executive Summary & Non-Legal Determination Notice**:
     - Highlights observation category, spatial classification, case ID, and statutory non-legal decision support notice.
   - **Section 2: Spatial Telemetry & Boundary Calculation**:
     - Latitude, longitude, horizontal accuracy error circle, distance to protected boundary in meters, and point-in-polygon results.
   - **Section 3: Photographic Evidence & Integrity Verification**:
     - Evidence image, SHA-256 cryptographic checksum, file size, and upload timestamp.
   - **Section 4: Source Geometry Provenance & Authority Notice**:
     - Authoritative agency attribution (Bhuvan/NRSC ISRO & ASI), monument number (`MUMMH015`), geometry layer version, and verbatim limitation note.
   - **Section 5: Change Ledger Audit Timeline & Canonical Legal Disclaimer**:
     - Chronological event timeline (reporter, sensor, spatial engine, reviewer actions) and mandatory legal disclaimer.
4. **A4 Print Verification**:
   - Press `Ctrl + P` (or Cmd + P) in browser.
   - Verify layout formats cleanly across standard A4 pages with zero text clipping, clean margins, and proper page breaks.

### 6.1 Honest Evidence Metadata Audit Matrix

| Field Name | Storage Location | Audit Classification | Notes / Contract Status |
| :--- | :--- | :--- | :--- |
| **Evidence ID** | `EvidenceRecord.evidenceId` | **VERIFIED** | Canonical UUID generated at capture time |
| **Original Filename** | N/A | **NOT PART OF CURRENT CONTRACT** | Not in `EvidenceRecord` interface; `REQUIRES AMEYA DECISION` to add |
| **MIME Type** | `EvidenceRecord.fileMimeType` | **VERIFIED** | Restricted to `image/jpeg`, `image/png`, `image/webp` |
| **File Size** | `EvidenceRecord.fileSizeBytes` | **VERIFIED** | Stored in bytes, displayed as KB in packet |
| **SHA-256 Checksum** | `EvidenceRecord.sha256Checksum` | **VERIFIED** | Calculated via Web Crypto API on file buffer |
| **Capture Timestamp** | `EvidenceRecord.uploadTimestamp` | **VERIFIED** | ISO 8601 timestamp (`observedTimestamp` on parent record) |
| **Consent-based GPS/Device** | `ObservationRecord.privacyConsentGiven` | **VERIFIED** | Explicit consent flag, coordinates, and error circle |
| **Upload / Storage Status** | N/A | **NOT PART OF CURRENT CONTRACT** | In-memory/local prototype; `REQUIRES AMEYA DECISION` |
| **Case / Observation ID** | `EvidenceRecord.observationId` | **VERIFIED** | Linked to parent `caseId` (`HP-MH-YYYY-XXXX`) |
| **Asset Classification** | `ObservationRecord.spatialResult` | **PARTIALLY VERIFIED** | Spatial classification verified; photo asset category (`ORIGINAL/PROCESSED/PREVIEW`) is not in contract (`REQUIRES AMEYA DECISION`) |

---

## 7. System Integrity & Failure Handling

| Scenario | Symptom / Trigger | System Response & Resolution |
| :--- | :--- | :--- |
| **Missing Category** | User submits capture form without selecting a category | Inline amber guidance notice: *"Observation category is required. Please select an approved category."* Submission blocked. |
| **Empty Description** | Factual notes field is blank or whitespace | Inline amber guidance notice: *"Please provide a factual description of the observed physical condition."* Submission blocked. |
| **Missing Location** | GPS coordinates have not been acquired | Inline guidance notice: *"Hardware GPS coordinates are required before recording to the ledger."* |
| **Degraded GPS Accuracy** | Hardware GPS reports horizontal error > 35m | Warning banner: *"GPS accuracy error circle exceeds the 35m confidence threshold. Please re-acquire under open sky."* |
| **Invalid Image Format** | File uploaded is not JPEG, PNG, or WebP | Notice banner in dropzone: *"Unsupported image format. Please select a JPEG, PNG, or WebP photo."* |
| **Oversized Image** | Uploaded image exceeds 10MB limit | Notice banner: *"Image exceeds 10MB limit. Please choose a compressed photo."* |
| **Non-Existent Case** | Accessing `/result/invalid-id` or `/packet/invalid-id` | Graceful empty-state card rendered with "Return to Reviewer Queue" navigation button. |
| **Storage Corruption** | Corrupted data in `localStorage` | System catches parsing exception, logs warning, and seamlessly restores clean mock cases without crash. |
| **Store Reset** | Demo cases cluttering ledger | Click "Reset Store" in Quickbar to reset store back to baseline cases and sync storage. |

---

## 8. Mandatory Legal Disclaimers & Safe Language Policy

All user-facing screens and printed dossiers must include the following verbatim notices:

### Statutory Legal Disclaimer
```
"Indicative decision support only. Heritage Pulse does not determine legal status, verify permission status, or identify offenders. Statutory preservation determination rests exclusively with the designated competent authority."
```

### Non-Legal Determination Notice
```
"Statutory Preservation Notice: Heritage Pulse provides technical decision support and evidence packaging only. It does not determine legal compliance, verify NOC or permission records, or identify offenders. Formal statutory evaluation remains the sole prerogative of the competent authority."
```

### Strict Non-Accusatory Language Policy
The following phrases are strictly forbidden across code, UI copy, and data models:
- `"illegal construction detected"`
- `"encroacher identified"`
- `"guilty"`
- `"demolition required"`
- `"noc absent"`
- `"violation confirmed"`
- `"criminal trespass"`
- `"punishable offense"`
- `"perpetrator named"`
- `"illegal occupant"`

---

## 9. Verification Methodology & Testing Levels

### 9.1 Honest Test Classification
Automated test suites run under Vitest in a simulated Node/jsdom runtime. **No browser automation framework (e.g. Playwright, Cypress, Selenium, or RTL) is installed in this repository.** Automated tests are classified as follows:
- **Unit Tests**: [`geometryNesting.test.ts`](file:///e:/Heritage_Guard/Heritage_Plus/src/shared/lib/geometryNesting.test.ts) (geometry parsing, coordinate bounds, nesting logic).
- **Spatial-Engine Tests**: [`spatialEngine.test.ts`](file:///e:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.test.ts) (point-in-polygon ray casting, Euclidean/Haversine boundary distances, GPS error circle overlap).
- **Store Integration Tests**: [`person4-journey.test.ts`](file:///e:/Heritage_Guard/Heritage_Plus/src/test/person4-journey.test.ts) (durable persistence, corrupt storage fallback, append-only review events, terminal closed-case sealing, idempotent selective demo resets).
- **Journey Integration Tests**: [`regression-and-journey.test.ts`](file:///e:/Heritage_Guard/Heritage_Plus/src/test/regression-and-journey.test.ts), [`e2e-journey.test.ts`](file:///e:/Heritage_Guard/Heritage_Plus/src/test/e2e-journey.test.ts), [`person4-journey.test.ts`](file:///e:/Heritage_Guard/Heritage_Plus/src/test/person4-journey.test.ts) (full vertical slice from observation input through spatial calculation, ledger registration, reviewer triage, and formal packet generation).
- **Simulated Browser Persistence**: Note that automated persistence tests evaluate `localStorage` in the Vitest simulated environment. True visual rendering, CSS glassmorphism, responsive drawers, and hard browser reload behavior require live manual verification in a running browser.

### 9.2 11-Step Manual Live Browser Verification Guide
> [!NOTE]
> **Execution Status**: Documented manual verification steps; execution remains pending. The steps below detail how to manually verify visual layout, responsive drawer behavior, MapLibre rendering, A4 print preview, hard browser refresh persistence, and selective demo reset in a running browser.

1. **Starting the App**:
   - Run `npm run dev` in the terminal and open `http://localhost:5173/` in Google Chrome or Microsoft Edge.
2. **Capturing a Case**:
   - Navigate to `/capture`, select category `Physical damage`, enter factual notes ("Stone joint displacement near North gate"), acquire coordinates (simulated or device GPS), and attach an image. Click "Record Observation in Change Ledger".
3. **Opening the Spatial Result**:
   - Verify immediate redirect to `/result/:caseId`. Confirm the map renders the monument boundary with the observed location point, error circle, and computed status badge (`POTENTIAL_ZONE_CONCERN`).
4. **Opening the Ledger**:
   - Scroll down on the result page to inspect the Change Ledger section. Confirm 4 initial chronological events: `OBSERVATION_CREATED`, `LOCATION_CAPTURED`, `SPATIAL_CALCULATED`, and `SUBMITTED_FOR_REVIEW`.
5. **Opening the Reviewer Queue**:
   - Click "Reviewer Triage" in the top navigation or visit `/reviewer/queue`. Verify the captured case appears at the top of the queue table with canonical machine-readable status `SUBMITTED_FOR_REVIEW` (rendered with the `SUBMITTED` UI badge).
6. **Applying a Reviewer Action**:
   - Click the row or "Review Case" to open the action drawer (`ReviewerActionCard.tsx`). Select "Recommend Field Verification", enter required administrative rationale ("Schedule inspection by Junnar conservation team"), and submit.
7. **Viewing the Updated Timeline**:
   - Return to the case detail page or queue and confirm the status has updated to `FIELD_VERIFICATION_RECOMMENDED`. Inspect the event timeline to confirm the reviewer action is appended with curator role, timestamp, and notes.
8. **Opening the Packet**:
   - Click "Generate Formal Review Packet" or navigate to `/packet/:caseId`. Confirm all 5 formal sections render with identical telemetry, non-legal decision support notice, and source provenance.
9. **Checking Print Preview**:
   - Press `Ctrl + P` (or Cmd + P) to open the browser print dialog. Confirm the layout conforms to standard A4 print dimensions with clean margins, visible borders, and zero clipped text. Cancel print preview.
10. **Reloading the Browser**:
    - Perform a hard browser refresh (`Ctrl + F5`). Verify all data (case records, reviewer actions, timeline events) survives reload without loss or corruption.
11. **Testing Selective Demo Reset**:
    - Click "S1 (Inside)" in the Quickbar to load a demo scenario case. Next, click "Reset Demo" in the Quickbar. Verify the button prompts "Confirm Demo Reset?". Click it again. Confirm the demo scenario case is cleared, baseline cases are restored, and **the user-captured case from Step 2 remains intact in the ledger**.

---

## 10. Contract Baseline & Reconciliation Status (Ameya vs Main)

As documented in `CHANGELOG.md`, Person 4’s deliverables operate against the canonical contracts of `main`:
1. **Nested Spatial Result**: `ObservationRecord.spatialResult: SpatialResult` is consumed universally.
2. **Reviewer Event Types**: `ReviewEvent` supports `'INFO_REQUESTED'`, `'STATUS_UPDATED'`, `'CASE_CLOSED'`.
3. **Append-Only Store**: `ledgerStore.appendReviewerDecision` handles state transitions with audit trail preservation.
4. **Single Source of Truth**: All `sessionStorage` fallback branches and parallel data payloads have been eradicated.
5. **Status Vocabulary Alignment**:
   - `ADDITIONAL_INFO_NEEDED` (Prompt) vs `ADDITIONAL_INFORMATION_NEEDED` (Codebase) — `REQUIRES AMEYA DECISION`
   - `CLOSED_NO_ACTION` (Prompt) vs `CLOSED_REVIEWED` (Codebase) — `REQUIRES AMEYA DECISION`
   - `CLOSED_INSUFFICIENT_EVIDENCE` (Prompt) vs `CLOSED_INSUFFICIENT_LOCATION_EVIDENCE` (Codebase) — `REQUIRES AMEYA DECISION`
   - Spatial machine statuses: `INSIDE_PROHIBITED` / `OUTSIDE_BOUNDARIES` / `POOR_GPS` vs `POTENTIAL_ZONE_CONCERN` / `NO_SPATIAL_CONCERN_INDICATED` / `EVIDENCE_INSUFFICIENT` — `REQUIRES AMEYA DECISION`

*End of Runbook.*
