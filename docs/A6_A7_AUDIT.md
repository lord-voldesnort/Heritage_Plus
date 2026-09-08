# A6 & A7 Audit Report: Reviewer Workflow, Event Integrity, Evidence & Canonical Packet

**Product**: Heritage Pulse · SIH 2026 Prototype  
**Monument**: MUMMH015 (Fort of Shivner / Shivneri Fort)  
**Date**: September 2026  
**Scope**: A6 (Reviewer Workflow & Review-Event Integrity) and A7 (Evidence Integrity & Canonical Reviewer Packet Integrity)  
**Baseline**: A5 Frozen Checkpoint (`bac3d95`)

---

## 1. Architectural Audit Table

| Requirement | Status | Existing Implementation | Evidence | Gap | Action |
|---|---|---|---|---|---|
| **Reviewer queue** | **COMPLETE** | `ReviewerQueuePage.tsx` loads directly from `ledgerStore.getCases()` without recalculation. Renders status pills, search query, category mapping, and empty states. | `ReviewerQueuePage.tsx:74-90` | None | Verify via test |
| **Reviewer actions** | **COMPLETE** | `ReviewerActionCard.tsx` and `ledgerStore.recordReviewAction()` support all permitted actions (`REQUEST_ADDITIONAL_EVIDENCE`, `RECOMMEND_FIELD_VERIFICATION`, `REFER_OFFICIAL_REVIEW`, `CLOSE_NO_ACTION`, `CLOSE_DUPLICATE`, `CLOSE_INSUFFICIENT_EVIDENCE`). | `ReviewerActionCard.tsx:37-92`, `ledgerStore.ts:220-263` | None | Verify via test |
| **Status transitions** | **COMPLETE** | Permitted transitions update `currentStatus` to valid canonical `CaseStatus` values defined in `CASE_STATUSES`. | `caseStatuses.ts:11-68`, `ledgerStore.ts:230-258` | None | Verify via test |
| **Invalid transition rejection** | **COMPLETE** | `recordReviewAction` verifies status against `CASE_STATUSES`. Rejects invalid actions with `null`, keeping case and timeline unmutated. | `ledgerStore.ts:230-233`, `persistence.test.ts:208-244` | None | Verify via test |
| **Append-only events** | **COMPLETE** | Each reviewer action creates a new `ReviewEvent` with unique `eventId`, timestamp, `actorRole`, notes, and resulting status, appended to `eventsTimeline`. | `ledgerStore.ts:236-255` | None | Verify via test |
| **Event persistence** | **COMPLETE** | Appended events are written synchronously through `adapter.saveCases()` into client storage (`localStorage`), surviving hydration/reload. | `ledgerStore.ts:257-261`, `persistence.test.ts:153-205` | None | Verify via test |
| **Event ordering** | **COMPLETE** | Events are appended sequentially preserving monotonic chronological timeline (`OBSERVATION_CREATED` → `LOCATION_CAPTURED` → `SPATIAL_CALCULATED` → `REVIEW_ACTION_RECORDED` → subsequent reviewer events). | `ledgerStore.ts:147-186, 254`, `persistence.test.ts:153-205` | None | Verify via test |
| **Closed-case protection** | **COMPLETE** | Closed cases (`CLOSED_REVIEWED`, `CLOSED_DUPLICATE`, `CLOSED_INSUFFICIENT_LOCATION_EVIDENCE`, `REFERRED`) are terminal in UI metadata; actions appended to closed cases create explicit new audit events without altering historical events. | `caseStatuses.ts:40-67`, `ledgerStore.ts:251-255` | Explicit test for closed-case behavior | Add targeted test |
| **Evidence metadata** | **COMPLETE** | `EvidenceRecord` stores `evidenceId`, `observationId`, `fileUrl`, `fileMimeType`, `fileSizeBytes`, `sha256Checksum`, and `uploadTimestamp`. | `types/index.ts:62-70`, `mockCases.ts:34-44`, `ledgerStore.ts:133-145` | None | Verify via test |
| **Evidence checksum** | **COMPLETE** | SHA-256 cryptographic hash is generated/stored for each evidence file, displayed in Case Detail, Reviewer Packet, and tested in persistence. | `CaseDetailPage.tsx:82`, `ReviewerPacketPreview.tsx:432-445`, `persistence.test.ts:140-143` | None | Verify via test |
| **Evidence linkage** | **COMPLETE** | Evidence records are strictly scoped inside their parent `ObservationRecord.evidenceList`. `saveEvidenceMetadata(caseId, evidence)` guarantees linkage to the target case. | `ledgerStore.ts:288-304` | Explicit test verifying cross-case isolation | Add targeted test |
| **Evidence storage status** | **COMPLETE** | Truthful distinction between durable client metadata/SHA-256 checksums and session-scoped local binary object URLs (`blob:...`) / sample URLs. | `A5_VERIFICATION_RESULTS.md:46-52`, `DEMO_RUNBOOK.md:89-94` | None | Document limitations |
| **Canonical packet builder** | **COMPLETE** | Exactly one canonical builder `buildCanonicalReviewerPacketData` in `heritagePulseContract.ts`, consumed by `ledgerStore.getPacketData()` and `ReviewerPacketPreview.tsx`. | `heritagePulseContract.ts:158-210`, `ReviewerPacketPreview.tsx:36` | None | Verify via test |
| **Packet provenance** | **COMPLETE** | Reviewer packet surfaces Bhuvan/NRSC source agency, URL, gate status (`PASSED_WITH_LIMITATIONS`), CRS (`EPSG:4326`), retrieval date, and verbatim ASI verification disclaimer. | `heritagePulseContract.ts:195-204`, `ReviewerPacketPreview.tsx:340-370` | None | Verify via test |
| **Packet/case equality** | **COMPLETE** | Packet fields (`caseId`, `currentStatus`, `factualDescription`, `coordinates`, `category`) strictly equal persisted `CaseRecord` fields. | `heritagePulseContract.ts:170-209`, `ReviewerPacket.test.ts:11-34` | None | Verify via test |
| **Packet/ledger equality** | **COMPLETE** | Packet `eventsTimeline` is a direct reflection of `caseRecord.eventsTimeline`, preserving complete chronological audit history. | `heritagePulseContract.ts:206`, `ReviewerPacket.test.ts:82-93` | None | Verify via test |
| **Packet/spatial equality** | **COMPLETE** | Packet `spatialVerdict` reads directly from persisted `caseRecord.spatialResult` (classification, perimeter distance, GPS error, explanation, statements). | `heritagePulseContract.ts:185-194`, `ReviewerPacket.test.ts:27-29` | None | Verify via test |
| **No spatial recalculation** | **COMPLETE** | Zero calls to `calculateSpatialResult` or `resolveMultiTierSpatialResult` or `@turf` inside reviewer workflow, queue, console, packet preview, or case detail. | Grep audit confirmed zero imports in `src/features/reviewer*`, `src/features/change-ledger` | None | Add regression test |

---

## 2. Key Audit Findings

1. **Single Source of Truth**: `LedgerStore` (`src/shared/lib/ledgerStore.ts`) backed by `ClientStorageAdapter` is the sole persistence authority. No direct `localStorage` access exists anywhere else in the application.
2. **Deterministic Packet Generation**: `buildCanonicalReviewerPacketData` in `src/shared/contracts/heritagePulseContract.ts` is the sole packet compiler. It does not perform geometric calculation or mutate state.
3. **Strict Spatial Boundary**: Spatial calculation occurs strictly once during field observation submission via `resolveMultiTierSpatialResult()`. All downstream consumers (Result page, Change Ledger, Reviewer Queue, Reviewer Console, Reviewer Packet) read the stored result.
4. **Append-Only Ledger Guarantee**: `recordReviewAction` and `appendLedgerEvent` append new `ReviewEvent` records with unique UUIDs. Historical events are never modified or deleted.
5. **Truthful Evidence Semantics**: Evidence metadata, file size, MIME type, upload timestamp, and SHA-256 cryptographic hashes are persisted. Binary image previews are session/local object URLs.

---

## 3. Required Action Plan

1. **Extend Test Coverage**: Add targeted tests verifying all A6 (Reviewer Workflow & Event Integrity) and A7 (Evidence & Packet Integrity) edge cases and equality guarantees.
2. **Produce Documentation**:
   - `docs/A6_REVIEWER_WORKFLOW.md`
   - `docs/A7_EVIDENCE_PACKET.md`
3. **Execute Full Validation**: Verify 100% test pass, TypeScript clean, Vite build clean, Geometry gate `PASSED_WITH_LIMITATIONS`, Contract clean, Team status clean.
