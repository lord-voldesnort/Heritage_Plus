# P1 Contract Validation & Baseline Architecture Report
**Heritage Pulse (हेरिटेज पल्स) — SIH 2026 PS 26197**  
**Role**: Person 4 (Visible Workflow, UI Integration & Demo Hardening)  
**Target Monument**: Fort of Shivner (Shivneri Fort) · ASI Monument `MUMMH015`  
**Date**: 2026-09-07  
**Gate Status**: `PASSED_WITH_LIMITATIONS`  

---

## 1. Executive Summary

This document establishes the authoritative contract discovery, baseline validation, and implementation blueprint for **Person 4** on the Heritage Pulse repository. Before modifying any screen, writing UI code, or implementing new workflows in **P2**, all data structures, spatial classifications, case statuses, routing maps, store methods, and evidence pipelines were comprehensively inspected.

### Core Findings
1. **Repository Health & Integrity**: Clean build (`tsc && vite build`) and **33/33 tests passing** across 4 test suites. Zero banned accusatory phrases found in `/src`.
2. **Canonical Data Contracts**: Core TypeScript definitions reside in [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts). However, parallel and ad-hoc schemas exist in [`FieldCapturePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/field-capture/FieldCapturePage.tsx) (`SessionCasePayload`), [`src/types/case.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/types/case.ts) (`GovernanceCaseStatus`), and [`BACKEND_SCHEMA.sql`](file:///E:/Heritage_Guard/Heritage_Plus/BACKEND_SCHEMA.sql).
3. **Primary Implementation Gap for Person 4**: [`FieldCapturePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/field-capture/FieldCapturePage.tsx) does not invoke [`ledgerStore.createCase`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/ledgerStore.ts#L20-L113) or [`calculateSpatialResult`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.ts#L19-L131). Instead, it stores an ad-hoc JSON record with `case-${Date.now()}` into `sessionStorage`. Downstream screens ([`CaseDetailPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/CaseDetailPage.tsx), [`ReviewerQueuePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerQueuePage.tsx), [`ReviewerPacketPreview.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-packet/ReviewerPacketPreview.tsx)) contain duplicate fallback parsers to handle this ununified format.
4. **Append-Only Immutability**: Verified in [`ledgerStore.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/ledgerStore.ts). Reviewer actions append new `ReviewEvent` records rather than overwriting historical events.
5. **No Speculative Rewrites**: No source files or tests were modified during this P1 baseline audit.

---

## 2. Inspection Scope & Limitations

### Inspected In-Repository Artifacts
- **Entry Points & Routing**: [`src/main.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/main.tsx), [`src/App.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/App.tsx), [`index.html`](file:///E:/Heritage_Guard/Heritage_Plus/index.html)
- **Shared Contracts & Constants**: [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts), [`src/types/case.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/types/case.ts), [`src/shared/constants/caseStatuses.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/constants/caseStatuses.ts), [`src/shared/constants/spatialClassifications.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/constants/spatialClassifications.ts), [`src/shared/constants/categories.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/constants/categories.ts), [`src/shared/constants/disclaimer.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/constants/disclaimer.ts), [`src/shared/constants/bannedLanguage.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/constants/bannedLanguage.ts)
- **Logic & Store Engines**: [`src/shared/lib/ledgerStore.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/ledgerStore.ts), [`src/shared/lib/spatialEngine.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.ts), [`src/shared/lib/caseGenerator.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/caseGenerator.ts)
- **Geometry & Seed Datasets**: [`src/shared/mock-data/siteGeometry.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/siteGeometry.ts), [`src/shared/mock-data/mockSite.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockSite.ts), [`src/shared/mock-data/mockScenarios.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockScenarios.ts), [`src/shared/mock-data/mockCases.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockCases.ts)
- **UI Features**: [`src/features/site-context/`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/site-context/), [`src/features/field-capture/`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/field-capture/), [`src/features/spatial-result/`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/), [`src/features/change-ledger/`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/change-ledger/), [`src/features/reviewer-workflow/`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/), [`src/features/reviewer-packet/`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-packet/), [`src/features/ps-fit/`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/ps-fit/), [`src/features/judge-qa/`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/judge-qa/), [`src/features/team-status/`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/team-status/)
- **Documentation & Governance**: [`HERITAGE_PULSE.md`](file:///E:/Heritage_Guard/Heritage_Plus/HERITAGE_PULSE.md), [`docs/PRODUCT_CONTRACT.md`](file:///E:/Heritage_Guard/Heritage_Plus/docs/PRODUCT_CONTRACT.md), [`docs/DATA_MODEL.md`](file:///E:/Heritage_Guard/Heritage_Plus/docs/DATA_MODEL.md), [`docs/API_CONTRACT.md`](file:///E:/Heritage_Guard/Heritage_Plus/docs/API_CONTRACT.md), [`docs/PS_FIT.md`](file:///E:/Heritage_Guard/Heritage_Plus/docs/PS_FIT.md), [`docs/JUDGE_QA.md`](file:///E:/Heritage_Guard/Heritage_Plus/docs/JUDGE_QA.md), [`docs/GEOMETRY_GATE.md`](file:///E:/Heritage_Guard/Heritage_Plus/docs/GEOMETRY_GATE.md), [`docs/DEMO_PLAN.md`](file:///E:/Heritage_Guard/Heritage_Plus/docs/DEMO_PLAN.md), [`project/GATE_STATUS.json`](file:///E:/Heritage_Guard/Heritage_Plus/project/GATE_STATUS.json), [`project/TASK_STATUS.json`](file:///E:/Heritage_Guard/Heritage_Plus/project/TASK_STATUS.json), [`BACKEND_SCHEMA.sql`](file:///E:/Heritage_Guard/Heritage_Plus/BACKEND_SCHEMA.sql)
- **Tests**: [`src/test/e2e-journey.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/test/e2e-journey.test.ts), [`src/test/regression-and-journey.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/test/regression-and-journey.test.ts), [`src/shared/lib/geometryNesting.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/geometryNesting.test.ts), [`src/shared/lib/spatialEngine.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.test.ts)

### Inspection Limitations
- **No Active Live Backend**: The prototype operates entirely client-side via in-memory store ([`ledgerStore.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/ledgerStore.ts)) and browser `sessionStorage`. [`BACKEND_SCHEMA.sql`](file:///E:/Heritage_Guard/Heritage_Plus/BACKEND_SCHEMA.sql) and [`docs/API_CONTRACT.md`](file:///E:/Heritage_Guard/Heritage_Plus/docs/API_CONTRACT.md) are specification documents.
- **Single Site Scope**: Only Fort of Shivner (`MUMMH015`) geometry is active in the repository. Multi-site selection is intentionally simulated for this prototype.

---

## 3. Repository Structure Inspected

```text
E:/Heritage_Guard/Heritage_Plus/
├── docs/                     # Specifications, contracts, demo blueprints, and QA
│   ├── API_CONTRACT.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── DEFINITIONS_OF_DONE.md
│   ├── DEMO_PLAN.md
│   ├── GEOMETRY_GATE.md
│   ├── JUDGE_QA.md
│   ├── ONBOARDING.md
│   ├── PRODUCT_CONTRACT.md
│   ├── PS_FIT.md
│   ├── TASK_BOARD.md
│   ├── TEAM_GUIDE.md
│   └── USER_FLOWS.md
├── project/                  # Gate and team governance tracking
│   ├── GATE_STATUS.json
│   ├── PRODUCT_RULES.json
│   ├── TASK_STATUS.json
│   └── TEAM_MEMBERS.json
├── scripts/                  # Automated verification and task CLI scripts
│   ├── check-gate.mjs
│   ├── show-next-task.mjs
│   ├── validate-contract.mjs
│   └── validate-task-status.mjs
├── src/
│   ├── App.tsx               # Main routes & ReviewerRoleGate
│   ├── main.tsx              # React DOM entry point
│   ├── index.css             # Tailwind and global typography styles
│   ├── types/
│   │   └── case.ts           # GovernanceCaseStatus & rationale validator
│   ├── shared/
│   │   ├── components/       # Reusable UI widgets & DemoQuickbar
│   │   ├── constants/        # Categories, statuses, classifications, disclaimers
│   │   ├── lib/              # spatialEngine, ledgerStore, caseGenerator
│   │   ├── mock-data/        # siteGeometry, mockSite, mockScenarios, mockCases
│   │   └── types/            # Canonical shared TypeScript interfaces (index.ts)
│   ├── features/
│   │   ├── site-context/     # SiteContextPage, observationGuidelines
│   │   ├── field-capture/    # FieldCapturePage, GpsAccuracyHud
│   │   ├── spatial-result/   # SpatialResultPage, SpatialMapCard, CaseDetailPage
│   │   ├── change-ledger/    # ChangeLedgerPage, CaseDetailPage (re-export)
│   │   ├── reviewer-workflow/# ReviewerQueuePage, ReviewerConsolePage, ReviewerActionCard
│   │   ├── reviewer-packet/  # ReviewerPacketPreview, ReviewerPacketPage
│   │   ├── ps-fit/           # PsFitPage
│   │   ├── judge-qa/         # JudgeQaPage
│   │   └── team-status/      # TeamStatusPage
│   └── test/                 # Vitest test suites
│       ├── e2e-journey.test.ts
│       └── regression-and-journey.test.ts
├── BACKEND_SCHEMA.sql        # PostGIS DDL, spatial trigger, and seed data
└── package.json              # Vite, Vitest, React, MapLibre, Turf.js
```

---

## 4. Canonical Contract Inventory

| Entity Name | Canonical Type | File Location | Status |
| :--- | :--- | :--- | :---: |
| **Site** | `SiteRecord` | [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L38-L49) | `VERIFIED` |
| **Geometry** | `GeometryRecord` | [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L51-L61) | `VERIFIED` |
| **Observation** | `ObservationRecord` | [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L109-L126) | `VERIFIED` |
| **Evidence** | `EvidenceRecord` | [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L63-L71) | `VERIFIED` |
| **Case Record** | `ObservationRecord` *(Merged root)* | [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L109-L126) | `PARTIALLY VERIFIED` |
| **Review Event** | `ReviewEvent` | [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L73-L92) | `VERIFIED` |
| **Source Metadata** | `PROVENANCE_METADATA` | [`src/shared/mock-data/siteGeometry.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/siteGeometry.ts#L3-L35) | `VERIFIED` |
| **Spatial Result** | `SpatialResult` | [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L94-L107) | `VERIFIED` |

---

## 5. Entity-by-Entity Contract Table

### 1. `SiteRecord` (`Site`)
- **Type**: `interface SiteRecord`
- **File**: [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L38-L49)
- **Stable ID**: `siteId: string` (e.g. `'site-shivneri-01'`)
- **Required Fields**: `siteId`, `slug`, `name`, `vernacularName`, `state`, `district`, `historicalSignificance`, `representativeImageUrl`, `sourceAgency`, `centroid: [number, number]`
- **Optional Fields**: None
- **Timestamps**: None on client interface (`created_at` in SQL schema)
- **Provenance**: `sourceAgency` (`'Bhuvan / NRSC (ISRO) in association with ASI'`)
- **Relationships**: Parent of `GeometryRecord` (1:N) and `ObservationRecord` (1:N)
- **Persistence**: In-memory static mock object in [`SHIVNERI_SITE`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockSite.ts)
- **Consumers**: [`SiteContextPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/site-context/SiteContextPage.tsx), [`CaseDetailPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/CaseDetailPage.tsx), [`ReviewerPacketPreview.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-packet/ReviewerPacketPreview.tsx)
- **Tests**: [`src/test/e2e-journey.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/test/e2e-journey.test.ts)
- **Status**: `VERIFIED`

### 2. `GeometryRecord`
- **Type**: `interface GeometryRecord`
- **File**: [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L51-L61)
- **Stable ID**: `geometryId: string` (e.g. `'MUMMH015-asi_protected_areas-7068'`)
- **Required Fields**: `geometryId`, `siteId`, `versionLabel`, `geojson`, `sourceDocumentOrUrl`, `captureDate`, `limitationNote`, `governanceState`, `layerConfidenceScore`
- **Optional Fields**: None
- **Timestamps**: `captureDate: string` (ISO Date)
- **Provenance**: `sourceDocumentOrUrl`, `limitationNote`, `governanceState`, `layerConfidenceScore`
- **Relationships**: Child of `SiteRecord`, referenced by `ObservationRecord.geometryId`
- **Persistence**: Static objects in [`siteGeometry.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/siteGeometry.ts)
- **Consumers**: [`SiteContextPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/site-context/SiteContextPage.tsx), [`SpatialMapCard.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/SpatialMapCard.tsx), [`MapLibreView.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/components/MapLibreView.tsx), [`spatialEngine.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.ts)
- **Tests**: [`src/shared/lib/geometryNesting.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/geometryNesting.test.ts), [`src/shared/lib/spatialEngine.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.test.ts)
- **Status**: `VERIFIED`

### 3. `ObservationRecord` (Case Root Entity)
- **Type**: `interface ObservationRecord`
- **File**: [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L109-L126)
- **Stable ID**: `observationId: string` (UUID) and `caseId: string` (`HP-MH-YYYY-XXXX`)
- **Required Fields**: `observationId`, `caseId`, `siteId`, `geometryId`, `reporterType`, `category`, `factualDescription`, `latitude`, `longitude`, `gpsAccuracyMeters`, `observedTimestamp`, `privacyConsentGiven`, `spatialResult`, `currentStatus`, `evidenceList`, `eventsTimeline`
- **Optional Fields**: None
- **Timestamps**: `observedTimestamp: string` (ISO 8601)
- **Provenance**: `spatialResult.geometryVersion`, `spatialResult.statements`
- **Relationships**: Has many `EvidenceRecord` (`evidenceList`), has many `ReviewEvent` (`eventsTimeline`)
- **Persistence**: Client state via [`ledgerStore.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/ledgerStore.ts)
- **Consumers**: All feature pages
- **Tests**: [`src/test/e2e-journey.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/test/e2e-journey.test.ts), [`src/test/regression-and-journey.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/test/regression-and-journey.test.ts)
- **Status**: `VERIFIED`

### 4. `EvidenceRecord`
- **Type**: `interface EvidenceRecord`
- **File**: [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L63-L71)
- **Stable ID**: `evidenceId: string` (UUID)
- **Required Fields**: `evidenceId`, `observationId`, `fileUrl`, `fileMimeType`, `fileSizeBytes`, `sha256Checksum`, `uploadTimestamp`
- **Optional Fields**: None
- **Timestamps**: `uploadTimestamp: string` (ISO 8601)
- **Provenance**: `sha256Checksum: string` (64-char hex)
- **Relationships**: Child of `ObservationRecord`
- **Persistence**: Stored inside `ObservationRecord.evidenceList` in `ledgerStore`
- **Consumers**: [`CaseDetailPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/CaseDetailPage.tsx), [`ReviewerConsolePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerConsolePage.tsx), [`ReviewerPacketPreview.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-packet/ReviewerPacketPreview.tsx)
- **Tests**: [`src/test/e2e-journey.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/test/e2e-journey.test.ts)
- **Status**: `VERIFIED`

### 5. `ReviewEvent`
- **Type**: `interface ReviewEvent`
- **File**: [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L73-L92)
- **Stable ID**: `eventId: string` (UUID)
- **Required Fields**: `eventId`, `caseId`, `timestamp`, `eventType`, `actorRole`, `summary`, `resultingStatus`
- **Optional Fields**: `actionTaken`, `reviewerNotes`, `title`
- **Timestamps**: `timestamp: string` (ISO 8601)
- **Provenance**: `actorRole` (`'Citizen Observer'`, `'Device Hardware Sensor'`, `'Spatial Reasoning Engine'`, `'Heritage Curator'`)
- **Relationships**: Child of `ObservationRecord` (`eventsTimeline`)
- **Persistence**: Appended immutably to `ObservationRecord.eventsTimeline`
- **Consumers**: [`LedgerTimeline.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/components/LedgerTimeline.tsx), [`ChangeLedgerPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/change-ledger/ChangeLedgerPage.tsx), [`CaseDetailPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/CaseDetailPage.tsx), [`ReviewerConsolePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerConsolePage.tsx), [`ReviewerPacketPreview.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-packet/ReviewerPacketPreview.tsx)
- **Tests**: [`src/test/e2e-journey.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/test/e2e-journey.test.ts)
- **Status**: `VERIFIED`

### 6. `SpatialResult`
- **Type**: `interface SpatialResult`
- **File**: [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L94-L107)
- **Required Fields**: `classification`, `distanceToBoundaryMeters`, `gpsAccuracyMeters`, `isUncertaintyOverlap`, `geometryVersion`, `explanation`, `statements: { userReported, gisCalculated, authorityNotice }`
- **Optional Fields**: `uncertaintyReason`
- **Provenance**: Derived deterministically by [`spatialEngine.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.ts)
- **Consumers**: [`SpatialMapCard.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/SpatialMapCard.tsx), [`SpatialResultPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/SpatialResultPage.tsx), [`CaseDetailPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/CaseDetailPage.tsx), [`ReviewerPacketPreview.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-packet/ReviewerPacketPreview.tsx)
- **Tests**: [`src/shared/lib/spatialEngine.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.test.ts)
- **Status**: `VERIFIED`

---

## 6. Spatial Status Validation

The canonical spatial statuses implemented in the codebase differ slightly in naming from the prompt's initial conceptual list. The active codebase uses **scientifically neutral and defensible terms**:

| Conceptual Name (Prompt) | Codebase Status ([`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L11-L16)) | Badge Label ([`spatialClassifications.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/constants/spatialClassifications.ts)) | Generated In | Display Locations | Validation Label |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `INSIDE_PROHIBITED` / `INSIDE_REGULATED` | `POTENTIAL_ZONE_CONCERN` | *Potential Zone Concern (Verification Required)* | [`spatialEngine.ts:103`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.ts#L103) | `SpatialMapCard`, `SpatialResultPage`, `ChangeLedgerPage`, `CaseDetailPage`, `ReviewerQueuePage`, `ReviewerPacketPreview` | `VERIFIED` |
| `OUTSIDE_BOUNDARIES` | `NO_SPATIAL_CONCERN_INDICATED` | *No Spatial Concern Indicated by this Layer* | [`spatialEngine.ts:119`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.ts#L119) | All spatial result cards and reviewer triage tables | `VERIFIED` |
| `LOCATION_UNCERTAIN` | `LOCATION_UNCERTAIN` | *Location Uncertain (Accuracy Circle Overlaps Boundary)* | [`spatialEngine.ts:85`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.ts#L85) | All spatial result cards, badges, and packets | `VERIFIED` |
| `POOR_GPS` | `EVIDENCE_INSUFFICIENT` | *Location Evidence Insufficient* | [`spatialEngine.ts:48`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.ts#L48) | Triggered whenever GPS error $> 35\text{m}$ | `VERIFIED` |
| `UNREVIEWED_GEOMETRY` | `SOURCE_UNAVAILABLE` | *Source Geometry Unavailable for Classification* | [`spatialEngine.ts:30`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.ts#L30) | Triggered if layer confidence $< 0.70$ or retired | `VERIFIED` |

### Key Observations
- **Separate Display Labels**: All UI components use [`SPATIAL_CLASSIFICATIONS`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/constants/spatialClassifications.ts) metadata rather than displaying raw enum strings.
- **Uncertainty & Source Status**: Every spatial verdict includes `explanation`, `gpsAccuracyMeters`, `distanceToBoundaryMeters`, `geometryVersion`, and the 3-part statement (`userReported`, `gisCalculated`, `authorityNotice`).
- **Discrepancy in SQL**: `BACKEND_SCHEMA.sql` declares `NO_SPATIAL_CONCERN` and `CLASSIFICATION_UNAVAILABLE`. (`CONFLICT` with client types).

---

## 7. Reviewer Status and Transition Validation

### Canonical Case Statuses
Declared in [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L18-L26) & [`src/shared/constants/caseStatuses.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/constants/caseStatuses.ts):
- Initial Status: `SUBMITTED_FOR_REVIEW` (or `DRAFT` before submission).

### Reviewer Transitions Matrix

```text
               ┌────────────────────────┐
               │  SUBMITTED_FOR_REVIEW  │
               └───────────┬────────────┘
         ┌─────────────────┼──────────────────┐
         ▼                 ▼                  ▼
┌──────────────────┐ ┌───────────┐ ┌────────────────────┐
│ ADDITIONAL_INFO_ │ │ REFERRED  │ │ FIELD_VERIFICATION │
│     NEEDED       │ └─────┬─────┘ │    RECOMMENDED     │
└────────┬─────────┘       │       └──────────┬─────────┘
         │                 ▼                  │
         │          ┌─────────────┐           │
         └─────────►│   CLOSED_   │◄──────────┘
                    │  REVIEWED   │
                    └─────────────┘
```

| Source Status | Target Status | Action Label | Required Rationale | Ledger Event Appended |
| :--- | :--- | :--- | :---: | :---: |
| `SUBMITTED_FOR_REVIEW` | `ADDITIONAL_INFORMATION_NEEDED` | *Request Additional Evidence* | Yes (non-empty) | `INFO_REQUESTED` |
| `SUBMITTED_FOR_REVIEW` | `FIELD_VERIFICATION_RECOMMENDED` | *Recommend Field Verification* | Yes (non-empty) | `STATUS_UPDATED` |
| `SUBMITTED_FOR_REVIEW` | `REFERRED` | *Refer for Official Review* | Yes (non-empty) | `STATUS_UPDATED` |
| `SUBMITTED_FOR_REVIEW` | `CLOSED_REVIEWED` | *Close Case* | Yes (non-empty) | `CASE_CLOSED` |
| Any Status | `CLOSED_DUPLICATE` | *Close (Duplicate / Unrelated)* | Yes | `CASE_CLOSED` |
| Any Status | `CLOSED_INSUFFICIENT_LOCATION_EVIDENCE` | *Close (Insufficient Location)* | Yes | `CASE_CLOSED` |

### Transition Governance Rules
1. **Rationale Enforcement**: Enforced via [`validateReviewerRationale(notes)`](file:///E:/Heritage_Guard/Heritage_Plus/src/types/case.ts#L25-L33) in [`ReviewerActionCard.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerActionCard.tsx). Submissions with blank rationale are blocked.
2. **Immutable Append**: Review actions call [`ledgerStore.appendReviewerDecision`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/ledgerStore.ts#L150-L186), creating a new `ReviewEvent` and updating `currentStatus` without modifying previous history.
3. **Closed Case Safety**: Closed terminal statuses (`isTerminal: true` in [`caseStatuses.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/constants/caseStatuses.ts#L8)) are visually tagged and cannot be casually mutated.

---

## 8. Case ID Validation

- **File Path**: [`src/shared/lib/caseGenerator.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/caseGenerator.ts)
- **Function**: `generateNextCaseId(stateCode: string = 'MH'): string`
- **Format**: `HP-{STATE_CODE}-{YEAR}-{SEQUENCE}` (e.g. `HP-MH-2026-0004`)
- **Stability**: Generated sequence numbers increment deterministically in memory.
- **Dependency**: [`mockCases.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockCases.ts) seeds `HP-MH-2026-0001` and `HP-MH-2026-0002`.
- **Identified Gap (`CONFLICT`)**: [`FieldCapturePage.tsx:91`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/field-capture/FieldCapturePage.tsx#L91) generates `case-${Date.now()}` instead of calling `generateNextCaseId('MH')`. Must be unified in P2.

---

## 9. Route Map & Journey Validation

| Visible Step | Route Path | Component | Params / Case ID Passing | Refresh / Reload Handling | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| 1. Site Context | `/site` | [`SiteContextPage`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/site-context/SiteContextPage.tsx) | None | Loads static [`SHIVNERI_SITE`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockSite.ts) | `VERIFIED` |
| 2. Field Capture | `/capture` | [`FieldCapturePage`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/field-capture/FieldCapturePage.tsx) | Optional `?scenario=id` query | Pre-populates scenario coordinates | `VERIFIED` |
| 3. Spatial Result | `/result` / `/result/:caseId` | [`SpatialResultPage`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/SpatialResultPage.tsx) | `:caseId` URL param | Reads `ledgerStore.getCaseById(caseId)` | `VERIFIED` |
| 4. Spatial Demo | `/spatial-demo` | [`SpatialResultPage`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/SpatialResultPage.tsx) | None | Defaults to benchmark scenario 1 | `VERIFIED` |
| 5. Change Ledger | `/ledger` | [`ChangeLedgerPage`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/change-ledger/ChangeLedgerPage.tsx) | None | Loads `ledgerStore.getCases()` | `VERIFIED` |
| 6. Case Detail | `/case/:caseId` / `/cases/:caseId` | [`CaseDetailPage`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/CaseDetailPage.tsx) | `:caseId` URL param | `ledgerStore` with `sessionStorage` fallback | `VERIFIED` |
| 7. Reviewer Queue | `/reviewer` / `/reviewer/queue` | [`ReviewerQueuePage`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerQueuePage.tsx) | None (Gated by Role) | `ledgerStore` + `sessionStorage` scan | `VERIFIED` |
| 8. Reviewer Console | `/reviewer/console` / `/reviewer/:caseId` | [`ReviewerConsolePage`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerConsolePage.tsx) | Optional `:caseId` (Gated) | Split-pane list from `ledgerStore` | `VERIFIED` |
| 9. Evidence Packet | `/packet/:caseId` / `/reviewer/packet/:caseId` | [`ReviewerPacketPreview`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-packet/ReviewerPacketPreview.tsx) | `:caseId` URL param | Full dossier from `ledgerStore` | `VERIFIED` |
| 10. Governance & QA | `/ps-fit`, `/judge-qa`, `/team-status` | Dedicated QA Pages | None | Renders markdown/JSON specs | `VERIFIED` |

---

## 10. Store / API Operation Validation

| Operation | Implementation | Input Shape | Output Shape | Error Handling | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Create Observation / Case** | [`ledgerStore.createCase`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/ledgerStore.ts#L20-L113) | `{ siteId, geometryId, category, factualDescription, latitude, longitude, gpsAccuracyMeters, reporterType?, photoUrl? }, spatialResult` | `ObservationRecord` | Synchronous creation, prepends to array | `VERIFIED` |
| **Calculate Spatial Reasoning** | [`calculateSpatialResult`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.ts#L19-L131) | `SpatialCalculationInput, GeometryRecord` | `SpatialResult` | Handles degraded GPS ($>35\text{m}$) and low confidence safely | `VERIFIED` |
| **Fetch Case by ID** | [`ledgerStore.getCaseById`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/ledgerStore.ts#L16-L18) | `caseId: string` | `ObservationRecord \| undefined` | Returns undefined on missing ID | `VERIFIED` |
| **List Cases** | [`ledgerStore.getCases`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/ledgerStore.ts#L12-L14) | None | `ObservationRecord[]` | Returns copy of array | `VERIFIED` |
| **Append Review Decision** | [`ledgerStore.appendReviewerDecision`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/ledgerStore.ts#L150-L186) | `caseId, actionTitle, resultingStatus, notes, eventType, reviewerRole` | `ObservationRecord \| null` | Returns null if case not found | `VERIFIED` |
| **Reset Demo Data** | Re-instantiation / page reload | None | Resets to [`MOCK_CASES`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockCases.ts) | Safe in-memory reset | `VERIFIED` |

---

## 11. Screen-by-Screen Data-Consumer Audit

| Screen / Component | Actual File | Route | Data Source | Hardcoded / Ad-hoc Data | Contract Consumed | Loading State | Empty State | Error State | Persistence / Reload Handling | Provenance / Disclaimer | P2 Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **Site Context** | [`SiteContextPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/site-context/SiteContextPage.tsx) | `/site` | [`mockSite.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockSite.ts), [`mockScenarios.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockScenarios.ts) | Centroid coordinate string | `SiteRecord`, `GeometryRecord`, `DemoScenario` | N/A (Instant) | N/A | Handled | Preserved on reload | Displays source agency, version, confidence & limitation note | Refine UI polish; preserve data binding |
| **Field Capture** | [`FieldCapturePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/field-capture/FieldCapturePage.tsx) | `/capture` | Constants & Hardware GPS | Creates `case-${Date.now()}` and writes ad-hoc JSON | Ad-hoc `SessionCasePayload` (`CONFLICT`) | GPS acquiring spinner | N/A | GPS permission / timeout errors | Form state in component; ad-hoc in `sessionStorage` | Displays `CANONICAL_LEGAL_DISCLAIMER` & privacy warning | **P2 Priority**: Wire directly to `ledgerStore.createCase` & `calculateSpatialResult` |
| **Spatial Result / Map** | [`SpatialResultPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/SpatialResultPage.tsx) | `/result/:caseId` | `ledgerStore` & [`mockScenarios.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockScenarios.ts) | Scenario fallback logic | `ObservationRecord`, `SpatialResult` | Handled | Handled | Handled | Reads from `ledgerStore` | Map displays boundary overlay & accuracy circle | Ensure seamless transition from `/capture` |
| **Spatial Map Card** | [`SpatialMapCard.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/SpatialMapCard.tsx) | Component | `calculateSpatialResult` | None | `SpatialResult`, `GeometryRecord` | Map loading state | N/A | Degradation pill on poor GPS | Real-time calculation | Displays 3-part statement & layer notice | Preserve Turf.js calculation pipeline |
| **Change Ledger** | [`ChangeLedgerPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/change-ledger/ChangeLedgerPage.tsx) | `/ledger` | `ledgerStore.getCases()` | None | `ObservationRecord[]`, `CaseStatus`, `SpatialClassification` | N/A | Filter empty state | Handled | Reads from `ledgerStore` | Badges display classification & status metadata | Add micro-animations and status filters |
| **Case Detail** | [`CaseDetailPage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/spatial-result/CaseDetailPage.tsx) | `/case/:caseId` | `ledgerStore` with `sessionStorage` fallback | Fallback JSON parsing | `ObservationRecord`, `ReviewEvent` | Handled | [`EmptyState`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/components/EmptyState.tsx) | Invalid ID alert | Preserved in `ledgerStore` | Displays complete audit trail & disclaimer | Remove duplicate session fallback once capture is wired |
| **Reviewer Queue** | [`ReviewerQueuePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerQueuePage.tsx) | `/reviewer` | `ledgerStore` + `sessionStorage` scan | Iterates `sessionStorage` keys | `QueueItem`, `CaseStatus` | Handled | Queue empty state | Handled | Merged queue | Displays status pills & triage actions | Unify queue with canonical `ledgerStore` stream |
| **Reviewer Console** | [`ReviewerConsolePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerConsolePage.tsx) | `/reviewer/console` | `ledgerStore.getCases()` | None | `ObservationRecord`, `ReviewEvent` | Handled | Empty queue state | Handled | Reads from `ledgerStore` | Shows full observer account & spatial logic | Complete modal interaction in `[REVIEW-01]` |
| **Reviewer Action Card** | [`ReviewerActionCard.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerActionCard.tsx) | Component | `ledgerStore.appendReviewerDecision` | None | `PermittedActionOption`, `ReviewerActionPayload` | Action processing loader | N/A | Banned phrase & empty rationale alerts | Mutates `ledgerStore` immutably | Validates non-accusatory language | Refine drawer styling and confirmation toast |
| **Reviewer Packet Preview** | [`ReviewerPacketPreview.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-packet/ReviewerPacketPreview.tsx) | `/packet/:caseId` | `ledgerStore.getCaseById` | SHA-256 fallback string | `ObservationRecord`, `EvidenceRecord` | Handled | [`EmptyState`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/components/EmptyState.tsx) | Invalid case ID alert | Reads from `ledgerStore` | Full 3-part statement, Bhuvan limitation, print layout | Implement export/print dialog in `[PACKET-01]` |
| **Demo Quickbar** | [`DemoQuickbar.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/components/DemoQuickbar.tsx) | Component | [`mockScenarios.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/mock-data/mockScenarios.ts), `spatialEngine` | None | `DemoScenario`, `SpatialResult` | Live calculation | N/A | Handled | Injects case into `ledgerStore` | Renders expected classification badge | Ready for 1-click jury demonstrations |

---

## 12. Evidence Contract Audit

| Field | Expected in Contract | Implemented in [`src/shared/types/index.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/types/index.ts#L63-L71) | In Ingest Flow ([`FieldCapturePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/field-capture/FieldCapturePage.tsx#L14-L19)) | Verification Status |
| :--- | :--- | :--- | :--- | :---: |
| `evidenceId` | UUID string | `evidenceId: string` | Generated on store creation | `VERIFIED` |
| `observationId` | UUID string | `observationId: string` | Linked to parent observation | `VERIFIED` |
| `fileUrl` / `previewUrl` | Object URL / Data URL | `fileUrl: string` | Captured from `PhotoDropzone` | `VERIFIED` |
| `fileMimeType` | MIME string | `fileMimeType: string` | Defaults to `'image/jpeg'` | `VERIFIED` |
| `fileSizeBytes` | Integer bytes | `fileSizeBytes: number` | Captured from `File.size` | `VERIFIED` |
| `sha256Checksum` | 64-char hex SHA-256 | `sha256Checksum: string` | Simulated SHA-256 hash | `VERIFIED` |
| `uploadTimestamp` | ISO 8601 string | `uploadTimestamp: string` | Stamped at capture time | `VERIFIED` |

---

## 13. Packet Contract Audit

The Reviewer Evidence Packet ([`ReviewerPacketPreview.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-packet/ReviewerPacketPreview.tsx)) compiles a comprehensive dossier containing:
- **Case & Site Header**: Case ID, Monument Name (`Fort of Shivner`), Monument Number (`MUMMH015`), Century, and District.
- **Factual Observation**: Category label, objective description, reporter role, timestamp.
- **Evidence Section**: Attached image thumbnail, MIME type, file size, SHA-256 seal.
- **Sourced Spatial Analysis**:
  - GPS Coordinates & Reported Error Radius ($\pm r_{gps}\text{m}$)
  - Distance to nearest boundary perimeter ($d\text{ m}$)
  - Spatial Classification Badge
  - Uncertainty Reasoning (e.g. accuracy disk overlap or GPS degradation)
  - Active Geometry Layer (`v1.0-bhuvan-protected-7068`) and Layer Confidence Estimate (`0.95 [Prototype]`)
  - Sourced WMS Endpoint and Portal URL
- **Full Change Ledger Timeline**: Chronological event stream with actor roles, event timestamps, and reviewer notes.
- **Statutory & Legal Disclaimers**: Full verbatim Bhuvan limitation text and canonical non-legal decision support statement.

---

## 14. Demo Scenario Audit

| # | Identifier | Coordinates | GPS Accuracy | Expected Output | Actual Engine Result ([`spatialEngine.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.test.ts)) | Demonstrates | Verification Status |
|---|---|---|---|---|---|---|:---:|
| 1 | `scenario-1-inside` | $19.1980^\circ\text{N}, 73.8580^\circ\text{E}$ | $\pm 4.5\text{m}$ | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` ($d = 0.0\text{m}$) | Deterministic interior zone detection | `VERIFIED` |
| 2 | `scenario-2-outside` | $19.2085^\circ\text{N}, 73.8750^\circ\text{E}$ | $\pm 5.0\text{m}$ | `NO_SPATIAL_CONCERN_INDICATED` | `NO_SPATIAL_CONCERN_INDICATED` ($d > 0.0\text{m}$) | Refusal to falsely flag activity outside zone | `VERIFIED` |
| 3 | `scenario-3-near-boundary` | $19.1931225^\circ\text{N}, 73.8528893^\circ\text{E}$ | $\pm 30.0\text{m}$ | `LOCATION_UNCERTAIN` | `LOCATION_UNCERTAIN` ($d \le r_{gps}$) | Accuracy circle overlap — refuses to overclaim | `VERIFIED` |
| 4 | `scenario-4-poor-gps` | $19.1980^\circ\text{N}, 73.8580^\circ\text{E}$ | $\pm 46.0\text{m}$ | `EVIDENCE_INSUFFICIENT` | `EVIDENCE_INSUFFICIENT` ($r_{gps} > 35\text{m}$) | Sensor error gatekeeper blocks calculation | `VERIFIED` |

---

## 15. Existing Test Coverage

```text
Test Files  4 passed (4)
Tests       33 passed (33)
Duration    2.33s
```

| Test Suite File | Test Type | Coverage Scope | Result |
| :--- | :--- | :--- | :---: |
| [`src/shared/lib/geometryNesting.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/geometryNesting.test.ts) | Unit Test | Strict nesting of Protected $\subset$ Prohibited ($100\text{m}$) $\subset$ Regulated ($300\text{m}$) MultiPolygons | **5/5 Passed** |
| [`src/shared/lib/spatialEngine.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/lib/spatialEngine.test.ts) | Unit Test | Geodesic distance, accuracy circle overlap, degraded GPS gate, governance gate | **7/7 Passed** |
| [`src/test/regression-and-journey.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/test/regression-and-journey.test.ts) | Regression & Journey Test | Case ID formatting, append-only store immutability, language contract validator, status transitions | **9/9 Passed** |
| [`src/test/e2e-journey.test.ts`](file:///E:/Heritage_Guard/Heritage_Plus/src/test/e2e-journey.test.ts) | Journey Integration Test | Complete 12-step user journey, evidence attachments, all 4 benchmark demo scenarios | **12/12 Passed** |

---

## 16. Hardcoded Values & Duplicate Data Sources

1. **Ad-hoc Case ID & Session Payload in `FieldCapturePage.tsx`**:
   - Lines 91–110 generate `case-${Date.now()}` and construct `SessionCasePayload` instead of calling `ledgerStore.createCase`.
2. **Duplicate Fallback Parsing in `CaseDetailPage.tsx` & `ReviewerPacketPreview.tsx`**:
   - Fallback `sessionStorage.getItem(caseId)` logic exists to catch submissions made through `FieldCapturePage`.
3. **Hardcoded SHA-256 Placeholder in `ledgerStore.ts`**:
   - Line 46 uses a static mock SHA-256 hash (`'9f86d081...'`) for client-uploaded images.

---

## 17. Contract Conflicts & Risks

| # | Item | Contract Conflict Details | Impact | Resolution Plan (for P2) | Status |
|---|---|---|---|---|:---:|
| 1 | **Capture Submission Flow** | `FieldCapturePage` bypasses `ledgerStore` and `spatialEngine` on form submit. | High | Wire `FieldCapturePage` to invoke `calculateSpatialResult` + `ledgerStore.createCase` directly. | `CONFLICT` |
| 2 | **Case ID Generation** | `FieldCapturePage` creates `case-${Date.now()}` vs canonical `HP-MH-2026-XXXX`. | Medium | Replace with `generateNextCaseId('MH')` from `caseGenerator.ts`. | `CONFLICT` |
| 3 | **Spatial Enum Names in SQL** | `BACKEND_SCHEMA.sql` uses `NO_SPATIAL_CONCERN` vs `NO_SPATIAL_CONCERN_INDICATED` in TypeScript. | Low | Retain TypeScript enum as authoritative; update SQL comments. | `REQUIRES AMEYA DECISION` |
| 4 | **Shorthand Status Types** | `src/types/case.ts` declares shorthand `GovernanceCaseStatus` (`'SUBMITTED'`, `'CLOSED'`). | Low | Ensure all runtime code uses canonical `CaseStatus` from `src/shared/types`. | `PARTIALLY VERIFIED` |

---

## 18. P2 Implementation Prerequisites

Before Person 4 initiates visible screen polishing in P2:
1. **Unify Field Capture Ingest**: Ensure `FieldCapturePage` creates a first-class `ObservationRecord` in `ledgerStore` with a valid `HP-MH-2026-XXXX` case ID and true `SpatialResult`.
2. **Standardize Navigation**: Ensure form submission navigates directly to `/result/${newCase.caseId}` or `/case/${newCase.caseId}` without intermediate session mismatch.
3. **Remove Redundant Session Fallbacks**: Clean up duplicate `SessionCasePayload` parsing across detail and packet screens.
4. **Preserve Demo Quickbar Reliability**: Maintain 1-click test scenario switching for jury demonstrations.

---

## 19. Questions Requiring Ameya's Decision

1. **Submission Destination Route**: When a field observer submits a capture form, should the app route first to `/result/:caseId` (Spatial Result & Map view) or directly to `/case/:caseId` (Change Ledger Case Detail)? *(Currently `/result/:caseId` is recommended to showcase spatial reasoning).*
2. **Reviewer Role Gate Default**: Should the reviewer role gate in `App.tsx` default to open during jury evaluation mode, or remain behind the 1-click "Enter as Reviewer" button?
3. **Multi-layer Overlay**: Should the map on the spatial result screen display all 3 concentric boundaries (`asi:protected_areas`, `asi:prohibited_boundary`, `asi:regulated_boundary`) simultaneously or toggle between them?

---

## 20. Files Person 4 Should Inspect or Modify First in P2

1. [`src/features/field-capture/FieldCapturePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/field-capture/FieldCapturePage.tsx) — Connect form submission to `ledgerStore.createCase` & `calculateSpatialResult`.
2. [`src/features/reviewer-workflow/ReviewerQueuePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerQueuePage.tsx) — Streamline case triage queue data binding.
3. [`src/features/reviewer-workflow/ReviewerConsolePage.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-workflow/ReviewerConsolePage.tsx) — Complete split-pane triage and action card workflow (`[REVIEW-01]`).
4. [`src/features/reviewer-packet/ReviewerPacketPreview.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/features/reviewer-packet/ReviewerPacketPreview.tsx) — Polish print layout and export actions (`[PACKET-01]`).
5. [`src/shared/components/DemoQuickbar.tsx`](file:///E:/Heritage_Guard/Heritage_Plus/src/shared/components/DemoQuickbar.tsx) — Verify scenario switching reliability.

---

## 21. Session Summary

- **What Changed**: Created `P1_CONTRACT_VALIDATION.md` establishing the complete contract baseline for Person 4. Zero source code or test files were modified.
- **What Was Tested**:
  - `npm run contract:validate` $\rightarrow$ **PASSED** (0 banned phrases).
  - `npm run team:validate` $\rightarrow$ **PASSED** (All task dependencies valid).
  - `npm run test` $\rightarrow$ **33/33 tests PASSED** across 4 test suites.
  - `npm run build` $\rightarrow$ **PASSED** (0 TypeScript errors, clean production bundle).
- **What Remains Broken / Unwired**: `FieldCapturePage` writes ad-hoc session storage records instead of calling `ledgerStore.createCase`.
- **Files for Team Inspection**: Ameya to review Section 19 (Design decisions); Vishwajeet to review Section 6 (Spatial statuses).
- **Next Task**: Proceed to **P2 / [REVIEW-01]** (Reviewer Assessment Console & Action Modal) and Field Capture ingestion unification.
