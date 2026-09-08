# A3 + A4 Freeze Record
**Heritage Pulse · SIH 2026 Prototype (MUMMH015 - Fort of Shivner)**  
**Milestone**: A3 (Geometry & Source Provenance) + A4 (Spatial Engine Hardening & Verification)

---

## 1. Checkpoint Identification

- **A2 Baseline Checkpoint**: `755cfa6` (`755cfa6ed1b084847071e8790981b22052e9e3e8`)
- **A3+A4 Implementation Commit**: `e28bfce15930986ad7c1b05d3a9b5ef50900b774`
- **Active Branch**: `ameya/integration-a1-p1`
- **Final Status**: **A3+A4 FROZEN**

---

## 2. Verification Gates Summary

| Verification Gate | Command | Result | Details |
|---|---|---|---|
| **Unit & Hardening Tests** | `npm test` | **PASS** | 56/56 passing across 5 test suites (`geometryNesting`, `spatialEngine`, `reviewerPacket`, `persistence`, `spatialHardening`). |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **PASS** | 0 type errors. |
| **Production Build** | `npm run build` | **PASS** | Clean production bundle generated via Vite. |
| **Geometry Gate Check** | `npm run gate:check` | **PASS** | `PASSED_WITH_LIMITATIONS` for MUMMH015. |
| **Contract Validation** | `npm run contract:validate` | **PASS** | Zero forbidden accusatory words in `/src`. |
| **Team Status Integrity** | `npm run team:validate` | **PASS** | All task statuses, owners, and dependencies valid. |

---

## 3. A3 — Geometry & Source Provenance Verification

1. **Three Isolated Bhuvan Layers**:
   - `asi:protected_areas` (GID: 7068, Buffer: 0m, SHA-256: `4ba4be...`)
   - `asi:prohibited_boundary` (GID: 9785, Buffer: 100m, SHA-256: `928fc7...`)
   - `asi:regulated_boundary` (GID: 2394, Buffer: 300m, SHA-256: `9d03d5...`)
2. **Coordinate Reference System**: Explicitly maintained as `EPSG:4326` (WGS 84, `[lng, lat]` coordinate arrays).
3. **Provenance Metadata**: Full provenance retained in `PROVENANCE_METADATA` and surfaced to Reviewer Packet (`sourceAgency`, `portalUrl`, `wmsEndpoint`, `retrievalDate: 2026-09-07`, verbatim disclaimers, compound keys `MUMMH015-{layer}-{gid}`).
4. **Historical Immutability**: Historical case records preserve their calculation-time `geometryVersion` and spatial explanations.

---

## 4. A4 — Spatial Engine Hardening Verification

1. **Authoritative Resolution**: [`resolveMultiTierSpatialResult()`](file:///d:/Projects/Heritage_Guard/src/shared/lib/spatialEngine.ts) remains the single canonical entrypoint for multi-tier spatial reasoning.
2. **Robust MultiPolygon / Hole Support**: Boundary line collection flattening via `turf.flatten()` ensures robust handling of single polygons, polygons with interior holes (donuts), and multi-component MultiPolygons.
3. **Geodesic Distance**: True perimeter distance calculated via `turf.pointToLineDistance()`; zero centroid or bounding box approximations.
4. **GPS Uncertainty & Quality Gate**:
   - Near boundary distance $\le$ `gpsAccuracyMeters` -> `LOCATION_UNCERTAIN`.
   - Sensor error `gpsAccuracyMeters > 35.0m` -> `EVIDENCE_INSUFFICIENT`.
5. **Determinism**: 100% deterministic across 100 consecutive iterations.
6. **Benchmark Scenarios**: All 4 evaluator demo scenarios verified against the real resolver.
7. **Downstream Immutability**: Zero downstream UI pages recalculate spatial state; all views consume stored `ObservationRecord.spatialResult`.

---

## 5. Freeze Decision

A3 and A4 are hereby **FROZEN**. The working tree is verified, all six verification gates have passed, and **A5 (Final Verification & Demo Hardening)** is cleared to begin from this baseline.
