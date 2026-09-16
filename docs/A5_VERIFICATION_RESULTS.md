# A5 Final Verification Results & Gate Report
**Heritage Pulse · SIH 2026 Prototype (MUMMH015 - Fort of Shivner)**  
**Milestone**: A5 (Final Verification, Demo Readiness & Release Freeze)  
**Date**: September 2026

---

## 1. Executive Summary

Heritage Pulse has completed all verification gates for A5. The full end-to-end workflow—from Site Context to Field Capture, Spatial Reasoning, Case Persistence, Change Ledger, Reviewer Workflow, and Reviewer Packet Export—has been verified with 100% data continuity, deterministic spatial calculation, and zero forbidden accusatory language.

---

## 2. Four Golden Benchmark Scenarios (Observed Values)

All four scenarios were evaluated through the authoritative spatial resolver (`resolveMultiTierSpatialResult()`) and tracked through the persistence boundary and Reviewer Packet:

| Scenario | Coordinates | GPS Accuracy | Resolver Classification | Layer Attributed | Perimeter Distance | Stored Result | Result UI | Case UI | Reviewer UI | Packet Data | Data Consistent? |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Scenario 1: Inside Protected** | 19.1980°N, 73.8580°E | ±4.5m | `POTENTIAL_ZONE_CONCERN` | `v1.0-bhuvan-protected-7068` (Protected Area) | 128.8m | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | **YES (PASS)** |
| **Scenario 2: Outside Regulated** | 19.2085°N, 73.8750°E | ±5.0m | `NO_SPATIAL_CONCERN_INDICATED` | `v1.0-bhuvan-regulated-2394` (300m Regulated Boundary) | 984.7m | `NO_SPATIAL_CONCERN_INDICATED` | `NO_SPATIAL_CONCERN_INDICATED` | `NO_SPATIAL_CONCERN_INDICATED` | `NO_SPATIAL_CONCERN_INDICATED` | `NO_SPATIAL_CONCERN_INDICATED` | **YES (PASS)** |
| **Scenario 3: Near Boundary / Multi-Tier Uncertainty** | 19.1931225°N, 73.8528893°E | ±30.0m | `POTENTIAL_ZONE_CONCERN` (Prohibited Tier with explicit Protected uncertainty note) | `v1.0-bhuvan-prohibited-9785` (100m Prohibited Zone) | 71.6m (to Prohibited boundary) / 26.0m (to Protected boundary) | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | `POTENTIAL_ZONE_CONCERN` | **YES (PASS)** |
| **Scenario 4: Degraded GPS** | 19.1980°N, 73.8580°E | ±46.0m | `EVIDENCE_INSUFFICIENT` | N/A (Sensor error gate >35m) | null | `EVIDENCE_INSUFFICIENT` | `EVIDENCE_INSUFFICIENT` | `EVIDENCE_INSUFFICIENT` | `EVIDENCE_INSUFFICIENT` | `EVIDENCE_INSUFFICIENT` | **YES (PASS)** |

### Detailed Analysis of Scenario 3 (Multi-Tier vs Single-Layer Behavior)
- **Single-Layer Evaluation against Protected Area**: Distance from coordinate to Protected boundary is $26.0\text{ m} \le 30.0\text{ m}$ (GPS error margin). Evaluated in isolation, `calculateSpatialResult` returns `LOCATION_UNCERTAIN` (`isUncertaintyOverlap: true`).
- **Multi-Tier Evaluation across all 3 Tiers**: The coordinate is located comfortably inside the 100m Prohibited Buffer layer ($71.6\text{ m}$ from Prohibited perimeter $> 30.0\text{ m}$ GPS accuracy).
- **Resolver Output**: `resolveMultiTierSpatialResult()` attributes the primary classification to the confident Prohibited tier (`POTENTIAL_ZONE_CONCERN`, $71.6\text{ m}$ perimeter distance) while annotating the higher-tier Protected Area boundary uncertainty in the explanation:
  > *"Potential zone-related concern – point is within the 100m Prohibited Zone layer (v1.0-bhuvan-prohibited-9785). GPS accuracy is ±30.0m. Note: The relationship to the more restrictive Protected Area layer (v1.0-bhuvan-protected-7068) could not be reliably determined due to GPS accuracy."*
- **Data Consistency**: The engine-derived classification, distance ($71.6\text{ m}$), and explanation are saved into the `CaseRecord` and consumed identically by Result, Case Detail, Reviewer Queue, and Packet views.

---

## 3. End-to-End Journey Verification

- **Step 1 — Site Context (`/`)**: Displays monument metadata (`MUMMH015`, Fort of Shivner), Bhuvan/NRSC provenance, EPSG:4326 CRS, and verbatim limitation notices. — **PASS**
- **Step 2 — Field Capture (`/capture`)**: Validates input observation, categories, coordinates, and photo evidence. — **PASS**
- **Step 3 — Spatial Resolution**: `resolveMultiTierSpatialResult()` evaluates the 3 MultiPolygon tiers exactly once. Zero centroid shortcuts. — **PASS**
- **Step 4 — Case Creation**: Assigns non-colliding stable Case ID (`HP-YYYYMMDD-SEQ`) and appends initial `CASE_CREATED` event to `eventsTimeline`. — **PASS**
- **Step 5 — Persistence**: `LedgerStore` + `ClientStorageAdapter` writes case to `localStorage`. Case metadata, evidence metadata, SHA-256 checksums, and ledger history survive page reload and browser restarts. — **PASS**
- **Step 6 — Spatial Result (`/result/:id`)**: Renders stored `spatialResult`, distance, and 3-part statements. Zero recalculation. — **PASS**
- **Step 7 — Change Ledger (`/case/:id`)**: Renders append-only chronological history. — **PASS**
- **Step 8 — Reviewer Queue (`/reviewer`)**: Filters and displays active cases by status pills. — **PASS**
- **Step 9 — Reviewer Actions**: Validates state transitions, appends new `ReviewEvent`, preserves prior events. Invalid actions rejected safely. — **PASS**
- **Step 10 — Reviewer Packet (`/packet/:id`)**: Assembles packet via `buildCanonicalReviewerPacketData()` with exact matching spatial verdict, evidence hashes, and verbatim disclaimers. Clean print/export formatting. — **PASS**

---

## 4. Evidence Persistence & Lifetime

- **Case Metadata Persistence**: Case IDs, observation fields, coordinates, spatial results, and status persist across browser sessions in `localStorage`.
- **Evidence Metadata Persistence**: Evidence IDs (`EVD-YYYYMMDD-SEQ`), filenames, MIME types, file sizes, upload timestamps, and SHA-256 cryptographic hashes persist in `localStorage`.
- **Binary Image Persistence**: Binary image files are held in local browser memory via object URLs (`blob:...`).
- **Browser Refresh**: Survives refresh within the active browser session.
- **Browser Restart**: Case records, evidence metadata, and SHA-256 checksums survive restart. Binary image previews use local object URLs and are not guaranteed to survive a full browser process restart; the image preview may require re-selection.

---

## 5. Failure-State Matrix

| Failure Condition | Expected Behavior | Observed Result | Status |
|---|---|---|---|
| Out of bounds coordinates (e.g. Lat 91.0°) | Return `SOURCE_UNAVAILABLE` without persisting corrupt case | Handled safely; returns `SOURCE_UNAVAILABLE` | **PASS** |
| Coordinates NaN / Infinity | Return `SOURCE_UNAVAILABLE` | Handled safely; returns `SOURCE_UNAVAILABLE` | **PASS** |
| Negative GPS accuracy | Return `EVIDENCE_INSUFFICIENT` | Handled safely; returns `EVIDENCE_INSUFFICIENT` | **PASS** |
| GPS accuracy > 35m | Return `EVIDENCE_INSUFFICIENT` (Sensor gate) | Handled safely; triggers `EVIDENCE_INSUFFICIENT` | **PASS** |
| Missing / null geometry record | Return `SOURCE_UNAVAILABLE` | Handled safely; no unhandled exception | **PASS** |
| Geometry confidence < 0.70 / RETIRED | Return `SOURCE_UNAVAILABLE` | Handled safely; returns `SOURCE_UNAVAILABLE` | **PASS** |
| Invalid reviewer transition | Reject transition; no state mutation or fake event | Action rejected with console error; case intact | **PASS** |
| Non-existent Case ID query | Show "Case Not Found" with return button | Handled safely; renders friendly error view | **PASS** |

---

## 6. Verification Commands Baseline

| Command | Check | Result |
|---|---|---|
| `npm test` | Unit, spatial, packet, persistence, and hardening tests | **PASS** (57/57 passing) |
| `npx tsc --noEmit` | TypeScript typecheck across entire codebase | **PASS** (0 errors) |
| `npm run build` | Production Vite bundle generation | **PASS** (Clean build in ~10s) |
| `npm run gate:check` | Bhuvan geometry Go/No-Go gate | **PASS** (`PASSED_WITH_LIMITATIONS`) |
| `npm run contract:validate` | Scanner for banned accusatory/legal words in `/src` | **PASS** (0 violations) |
| `npm run team:validate` | Task board status and owner dependency validation | **PASS** (All valid) |

---

## 7. Documented Limitations

1. **Client-Durable Prototype**: Case records, evidence metadata, and ledger events persist in browser `localStorage`. Multi-tenant cloud synchronization is an extension for production.
2. **Binary Evidence Lifetime**: Evidence metadata, MIME types, file sizes, and SHA-256 hashes persist indefinitely in client storage; local object URLs used for binary image rendering are scoped to the browser process lifetime.
3. **Bhuvan Source Data**: Sourced from official Bhuvan/NRSC Version 1.0 datasets mapped in association with ASI; requires formal on-ground statutory ASI verification for legal proceedings.
