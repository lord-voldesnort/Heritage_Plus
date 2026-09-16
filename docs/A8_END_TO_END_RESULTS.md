# A8 End-to-End Application Journey & Scenario Validation Results

**Product**: Heritage Pulse · SIH 2026 Prototype  
**Monument**: Fort of Shivner (Shivneri Fort) [MUMMH015], Junnar, Pune District, Maharashtra  
**Milestone**: A8 (Final Validation, Clean-Environment Demo Verification & Prototype Freeze)  
**Date**: September 2026  

---

## 1. Complete Capture-to-Packet User Journey

The complete 33-step user journey was executed and verified against active application code:

| Step # | Journey Step / Touchpoint | Route / Component | Observed Behavior | Verification Result |
|---|---|---|---|---|
| 1 | Site Context Home | `/` (`SiteContextPage.tsx`) | Displays Fort of Shivner, Shivneri Fort, MUMMH015, Junnar, Maharashtra. | **PASS** |
| 2 | Sourced Layers Breakdown | `SiteContextPage.tsx` | Separately renders Protected Area (GID 7068), Prohibited Boundary (GID 9785), and Regulated Boundary (GID 2394). | **PASS** |
| 3 | Source Provenance Card | `SiteContextPage.tsx` | Surfaces Bhuvan / NRSC (ISRO), retrieval date `2026-09-07`, CRS `EPSG:4326`, and gate `PASSED_WITH_LIMITATIONS`. | **PASS** |
| 4 | Verbatim Disclaimers | `SiteContextPage.tsx` | Surfaces statutory ASI verification requirement and non-legal determination notices. | **PASS** |
| 5 | Navigate to Field Capture | `/capture` (`FieldCapturePage.tsx`) | Field observation capture interface loads with GPS telemetry HUD. | **PASS** |
| 6 | Select Category | `FieldCapturePage.tsx` | Selects from 7 canonical non-accusatory categories (e.g. `POSSIBLE_CONSTRUCTION`). | **PASS** |
| 7 | Neutral Factual Description | `FieldCapturePage.tsx` | Description input with Safe Language Protocol enforcement (`containsBannedLanguage`). | **PASS** |
| 8 | Evidence Attachment | `FieldCapturePage.tsx` | Attaches image, calculates file size, MIME type, and generates SHA-256 hash. | **PASS** |
| 9 | Telemetry / Quick-Fill | `FieldCapturePage.tsx` | Captures GPS coordinates and circular error margin (or loads 1-click benchmark scenario). | **PASS** |
| 10 | Submit Observation | `FieldCapturePage.tsx` | Invokes single spatial evaluation via `resolveMultiTierSpatialResult()`. | **PASS** |
| 11 | Stable Case ID Generation | `ledgerStore.createCase()` | Generates monotonic, non-colliding `HP-MH-YYYY-SEQ` identifier. | **PASS** |
| 12 | Persistence Write-Through | `ClientStorageAdapter` | Persists case, spatial result, evidence metadata, and initial 4 ledger events to `localStorage`. | **PASS** |
| 13 | Spatial Result View | `/result/:id` (`SpatialResultPage.tsx`) | Reads persisted `case.spatialResult` directly from store without recalculation. | **PASS** |
| 14 | Case Detail View | `/case/:id` (`CaseDetailPage.tsx`) | Displays telemetry grid, evidence photo, SHA-256 digest, and action links. | **PASS** |
| 15 | Change Ledger History | `/ledger` (`ChangeLedgerPage.tsx`) | Append-only timeline renders all historical events chronologically. | **PASS** |
| 16 | Reviewer Queue | `/reviewer` (`ReviewerQueuePage.tsx`) | Queue loads cases from store, supports filtering by status, search, and displays telemetry. | **PASS** |
| 17 | Reviewer Action Selection | `ReviewerActionCard.tsx` | Selects from 6 permitted actions (e.g. `RECOMMEND_FIELD_VERIFICATION`). | **PASS** |
| 18 | Institutional Justification | `ReviewerActionCard.tsx` | Captures required institutional rationale with Safe Language validation. | **PASS** |
| 19 | Append Review Decision | `ledgerStore.recordReviewAction()` | Appends new `ReviewEvent` with unique UUID, timestamp, actor role, and updates case status. | **PASS** |
| 20 | Historical Event Immutability | `ledgerStore.ts` | Prior events remain bit-for-bit identical; zero mutation of existing history. | **PASS** |
| 21 | Reviewer Packet View | `/packet/:id` (`ReviewerPacketPreview.tsx`) | Compiles standardized Reviewer Packet via `buildCanonicalReviewerPacketData()`. | **PASS** |
| 22 | Packet / Case Equality | `ReviewerPacketPreview.tsx` | Packet identity, status, observation, and telemetry strictly match stored case. | **PASS** |
| 23 | Packet / Ledger Equality | `ReviewerPacketPreview.tsx` | Packet timeline is an exact reflection of `case.eventsTimeline`. | **PASS** |
| 24 | Packet / Evidence Equality | `ReviewerPacketPreview.tsx` | Packet surfaces complete evidence metadata and SHA-256 cryptographic digest. | **PASS** |
| 25 | Packet / Spatial Equality | `ReviewerPacketPreview.tsx` | Packet spatial verdict strictly equals stored `case.spatialResult` (zero Turf re-runs). | **PASS** |
| 26 | Print / Export Packet | `ReviewerPacketPreview.tsx` | Standard browser print stylesheet formats clean, multi-page audit evidence dossier. | **PASS** |
| 27 | Storage Rehydration / Reload | `LedgerStore.hydrateCases()` | Full application restart preserves case, review decisions, and timeline without contradiction. | **PASS** |

---

## 2. Four Golden Benchmark Scenarios (Observed & Verified)

All four scenarios were executed through the multi-tier spatial reasoning engine and tracked across all application layers:

| Scenario | Coordinates | GPS Accuracy | Multi-Tier Resolver Classification | Stored Result | Result UI | Case UI | Reviewer UI | Packet Data | Consistent? |
|---|---|---|---|---|---|---|---|---|---|
| **Scenario 1: Inside Protected** | 19.1980°N, 73.8580°E | ±4.5m | `POTENTIAL_ZONE_CONCERN` (Protected layer GID 7068, 128.8m from perimeter) | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | **YES (PASS)** |
| **Scenario 2: Outside Regulated** | 19.2085°N, 73.8750°E | ±5.0m | `NO_SPATIAL_CONCERN_INDICATED` (Regulated layer GID 2394, 984.7m outside) | `NO_SPATIAL_CONCERN_INDICATED` | `NO_SPATIAL_CONCERN_INDICATED` | `NO_SPATIAL_CONCERN_INDICATED` | `NO_SPATIAL_CONCERN_INDICATED` | `NO_SPATIAL_CONCERN_INDICATED` | **YES (PASS)** |
| **Scenario 3: Near Boundary / Multi-Tier Uncertainty** | 19.1931225°N, 73.8528893°E | ±30.0m | `POTENTIAL_ZONE_CONCERN` (Prohibited layer GID 9785, 71.6m inside; with higher-tier Protected uncertainty annotation) | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | **YES (PASS)** |
| **Scenario 4: Degraded GPS** | 19.1980°N, 73.8580°E | ±46.0m | `EVIDENCE_INSUFFICIENT` (Sensor error >35m gate threshold) | `EVIDENCE_INSUFFICIENT` | `EVIDENCE_INSUFFICIENT` | `EVIDENCE_INSUFFICIENT` | `EVIDENCE_INSUFFICIENT` | `EVIDENCE_INSUFFICIENT` | **YES (PASS)** |

### Multi-Tier Uncertainty Behavior for Scenario 3
- **Protected Area Layer (Higher-Tier)**: Perimeter distance is $26.0\text{ m} \le 30.0\text{ m}$ GPS accuracy error margin. Single-layer evaluation yields `LOCATION_UNCERTAIN`.
- **Prohibited Boundary Layer (Primary Buffer)**: Point is located inside the 100m Prohibited Zone at $71.6\text{ m} > 30.0\text{ m}$ distance from the outer perimeter.
- **Authoritative Resolution**: `resolveMultiTierSpatialResult()` attributes the primary classification to the confident Prohibited tier (`POTENTIAL_ZONE_CONCERN`, $71.6\text{ m}$) while annotating the higher-tier Protected Area boundary uncertainty in the explanation note.

---

## 3. Failure-State & Boundary Condition Validation

| Failure Condition | Injected Input / Action | System Handling | Safety Guarantee | Verification |
|---|---|---|---|---|
| **Empty description** | `factualDescription: "   "` | Input validation error thrown; submission blocked. | No false successful case created. | **PASS** |
| **Out-of-bounds latitude** | `latitude: 95.0` | Throws WGS 84 coordinate boundary validation error. | Corrupt geometry rejected. | **PASS** |
| **Negative GPS accuracy** | `gpsAccuracyMeters: -5.0` | Throws non-negative telemetry validation error. | Sensor anomaly blocked. | **PASS** |
| **Degraded GPS telemetry** | `gpsAccuracyMeters: 46.0m` | Evaluates to `EVIDENCE_INSUFFICIENT` classification. | Prevents false zone proximity claims. | **PASS** |
| **Nonexistent case retrieval** | `getCaseById("HP-MH-INVALID")` | Returns `undefined`; UI renders shared `EmptyState` component. | Zero application crash. | **PASS** |
| **Invalid reviewer action** | `action: "INVALID_STATUS"` | `recordReviewAction` returns `null`; state unmutated. | Zero false ledger events. | **PASS** |
| **Missing photo evidence** | `photoUrl: undefined` | Creates case with `evidenceList: []`. | No fabricated placeholder images. | **PASS** |
| **Closed-case action** | Action on `CLOSED_REVIEWED` case | Appends explicit new `ReviewEvent` to timeline. | Preserves complete audit trail. | **PASS** |
| **Downstream recalculation check** | Packet / Reviewer page load | Zero calls to spatial calculators or Turf functions. | Stored spatial result is sole source of truth. | **PASS** |

---

## 4. Responsive Mobile / Viewport Assessment

- **Tested Viewports**: Responsive mobile simulation (375px, 390px, 430px widths) and desktop layouts.
- **Mobile Touchpoints Verified**: Responsive navbar, collapsible navigation drawer, GPS HUD layout, photo upload preview, touch-friendly reviewer action selectors, and printable Reviewer Packet layout.
- **Documented Limitation**: Validated via responsive viewport emulation. Physical Android on-device hardware testing was not performed in this session and is documented honestly as **LIMITED**.
