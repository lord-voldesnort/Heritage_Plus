# A1 REPOSITORY AUDIT & CODEBASE INVENTORY
## HERITAGE PULSE (हेरITAGE PULSE) — SIH 2026 PS 26197
*Target Monument*: Fort of Shivner (Shivneri Fort) [`MUMMH015`], Junnar, Maharashtra  
*Audit Scope*: Preparation for First Vertical Slice (`Capture -> Create -> Persist -> Spatial Result -> Ledger -> Review Queue -> Review Action -> Packet`)

---

## 1. Audit Context & Environment

* **Repository Path**: `d:\Projects\Heritage_Guard`
* **Active Branch**: `main` (Fast-forwarded with origin/main)
* **Framework**: React 18, TypeScript 5.6, Vite 6.0, Tailwind CSS 3.4
* **Testing Framework**: Vitest 2.1 (33/33 tests passing)
* **GIS Engine**: Turf.js 7.2 & MapLibre GL 5.2

---

## 2. Feature & Component Classification

### 🟢 ALREADY REAL AND WORKING (Do Not Rewrite)

1. **Spatial Reasoning Engine (`src/shared/lib/spatialEngine.ts`)**:
   - Computes geodesic distance in meters from point coordinates to MultiPolygon boundary line strings.
   - Evaluates point-in-polygon containment using Turf.js.
   - Computes device GPS accuracy buffer circles (`turf.buffer`) and checks line intersections (`LOCATION_UNCERTAIN`).
   - Rejects degraded GPS accuracy ($>35\text{m}$) with `EVIDENCE_INSUFFICIENT` / `POOR_GPS`.
   - Verified by 7 unit tests in `spatialEngine.test.ts`.

2. **Geometry Nesting & Multi-Tier Resolution (`src/shared/lib/geometryNesting.test.ts`)**:
   - Validates Bhuvan/NRSC GeoJSON layers: Base Monument Footprint (GID 7068), 100m Prohibited (GID 9785), and 300m Regulated (GID 2394).
   - Topological validity and containment hierarchy ($Footprint \subset Prohibited \subset Regulated$).

3. **Geometry Go/No-Go Gate (`project/GATE_STATUS.json` & `scripts/check-gate.mjs`)**:
   - Validated geometry state: `PASSED_WITH_LIMITATIONS`.
   - Verified source provenance metadata from Bhuvan NRSC ISRO.

4. **Change Ledger Store Interface (`src/shared/lib/ledgerStore.ts`)**:
   - `createCase()`: Generates sequential Case ID (`HP-MH-2026-XXXX`), creates observation, attaches evidence metadata, computes spatial status, and appends `OBSERVATION_CREATED`, `LOCATION_CAPTURED`, `SPATIAL_CALCULATED`, and `REVIEW_ACTION_RECORDED` events.
   - `recordReviewAction()` & `appendReviewerDecision()`: Appends new immutable review events to the case timeline.

5. **Safe Language & Contract Validator (`scripts/validate-contract.mjs` & `src/shared/constants/bannedLanguage.ts`)**:
   - Scans and blocks forbidden legal/accusatory phrases (`illegal construction`, `encroacher`, `guilty`, `demolition`, `violation confirmed`).
   - Enforces neutral administrative phrasing (`potential zone-related concern`, `location uncertain`, `authority verification required`).

6. **Interactive Map & UI Component Suite**:
   - `MapLibreView.tsx` & `SpatialMapCard.tsx`: Renders real Shivneri Fort GeoJSON boundary polygons with MapLibre GL.
   - `DemoQuickbar.tsx`: 1-Click bar allowing instant switching between the 4 Evaluator Benchmark scenarios.

7. **Automated Test Suite (33/33 Tests Passing)**:
   - `spatialEngine.test.ts` (7 tests)
   - `geometryNesting.test.ts` (5 tests)
   - `regression-and-journey.test.ts` (9 tests)
   - `e2e-journey.test.ts` (12 tests)

---

### 🟡 PARTIALLY IMPLEMENTED (To Be Consolidated in A1)

1. **Reviewer Status Governance & Types**:
   - `src/shared/types/index.ts` defines `CaseStatus` with values `SUBMITTED_FOR_REVIEW`, `ADDITIONAL_INFORMATION_NEEDED`, `CLOSED_REVIEWED`.
   - `src/types/case.ts` defines `GovernanceCaseStatus` with values `SUBMITTED`, `ADDITIONAL_INFO_NEEDED`, `CLOSED`.
   - *A1 Action*: Establish `src/shared/contracts/heritagePulseContract.ts` as the canonical contract interface while retaining clean backwards-compatible type aliases.

2. **Observation Category Alignment**:
   - 8 categories defined in `src/shared/constants/categories.ts` (`POSSIBLE_CONSTRUCTION`, `POSSIBLE_ENCROACHMENT`, `PHYSICAL_DAMAGE`, `DUMPING_OR_WASTE`, `BLOCKED_ACCESS`, `STRUCTURE_ALTERATION`, `VISUAL_OBSTRUCTION`, `OTHER_VISIBLE_CHANGE`).
   - Fully aligned across field capture and reviewer forms.

---

### 🟠 MOCKED / HARDCODED (Acceptable for Hackathon Prototype)

1. **Durable Persistence Adapter**:
   - *Current*: `ledgerStore.ts` uses in-memory state initialized from `mockCases.ts` with browser `sessionStorage` sync fallback.
   - *Target for Vertical Slice*: Stable local adapter (`LocalStorageAdapter`) ensuring case creation $\rightarrow$ browser refresh $\rightarrow$ exact same case retrieved.
   - *Backend*: PostgreSQL/PostGIS schema in `BACKEND_SCHEMA.sql` is ready, but local durable storage is chosen for hackathon runtime stability.

2. **Photo Upload & Evidence Checksum**:
   - *Current*: Client-side file dropzone (`PhotoDropzone.tsx`) creates object URLs / mock SHA-256 hash.
   - *Target for Vertical Slice*: Stable `EvidenceRecord` metadata contract.

3. **Authentication & Role Gate**:
   - *Current*: Simulated role gate (`ReviewerRoleGate` in `App.tsx` using `sessionStorage`).

---

### 🔴 MISSING (Gaps Addressed in A1)

1. **Canonical Shared Contract Module (`src/shared/contracts/heritagePulseContract.ts`)**:
   - Single explicit contract module re-exporting canonical types, status validator functions, safe language rules, and packet data structure for Person 4 UI integration.

2. **Canonical Contract Documentation (`docs/A1_CONTRACT.md` & `docs/A1_CONTRACT_DECISIONS.md`)**:
   - Explicit documentation freezing entity shapes, reviewer state machine, and persistence boundary rules.

---

### 🔒 SHOULD NOT BE CHANGED (Strict Freeze)

* ⛔ `spatialEngine.ts` core distance calculation math and Turf.js boolean logic.
* ⛔ `geometryNesting.test.ts` topological layer containment assertions.
* ⛔ `check-gate.mjs` Bhuvan geometry provenance validation script.
* ⛔ Existing 33 unit and integration tests.
