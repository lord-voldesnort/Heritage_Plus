# A3 + A4 Architectural Audit & Verification Plan
**Heritage Pulse · SIH 2026 Prototype (MUMMH015 - Fort of Shivner)**  
**Target Milestone**: A3 (Geometry Provenance Completion) & A4 (Spatial Engine Hardening)  
**Baseline Commit**: `755cfa6` (A2 Frozen Checkpoint)

---

## 1. Executive Summary

This audit assesses the state of geometry provenance, layer integrity, and spatial engine mathematical robustness in Heritage Pulse. 

- **A3 (Geometry Provenance)**: The repository maintains three separate, unaltered Bhuvan/NRSC (ISRO) GeoJSON MultiPolygon layers for Fort of Shivner (`MUMMH015`), raw files, SHA-256 checksums, and source metadata with verbatim disclaimers.
- **A4 (Spatial Engine)**: Multi-tier hierarchical resolution (`resolveMultiTierSpatialResult()`) evaluates protected, prohibited (100m), and regulated (300m) tiers, enforces GPS error margins (±35m gate, edge overlap uncertainty), calculates true perimeter distance using Turf geodesic algorithms (no centroid approximations), and prevents legal accusatory claims.

---

## 2. Comprehensive A3/A4 Requirements Audit Matrix

| Requirement | Area | Status | Existing Implementation | Evidence | Required Action |
|---|---|---|---|---|---|
| **Protected geometry** | A3 | **COMPLETE** | `SHIVNERI_PROTECTED_GEOJSON` in `siteGeometry.ts` | GeoJSON MultiPolygon (gid: 7068), `data/sources/shivneri/bhuvan-nrsc-2026-09-07/asi_protected_areas_7068.geojson` | Verify raw & in-memory fidelity via automated tests. |
| **Prohibited geometry** | A3 | **COMPLETE** | `SHIVNERI_PROHIBITED_GEOJSON` in `siteGeometry.ts` | GeoJSON MultiPolygon (gid: 9785, 100m buffer), `data/sources/shivneri/bhuvan-nrsc-2026-09-07/asi_prohibited_boundary_9785.geojson` | Verify layer separation and containment hierarchy. |
| **Regulated geometry** | A3 | **COMPLETE** | `SHIVNERI_REGULATED_GEOJSON` in `siteGeometry.ts` | GeoJSON MultiPolygon (gid: 2394, 300m buffer), `data/sources/shivneri/bhuvan-nrsc-2026-09-07/asi_regulated_boundary_2394.geojson` | Verify layer separation and containment hierarchy. |
| **Source metadata** | A3 | **COMPLETE** | `PROVENANCE_METADATA` in `siteGeometry.ts` | Full portal URLs, WMS service endpoint, WFS status, verbatim disclaimers | Ensure metadata is surfaced to Reviewer Packet. |
| **Layer IDs/GIDs** | A3 | **COMPLETE** | `PROVENANCE_METADATA.gids` and `checksums.json` | 7068 (protected), 9785 (prohibited), 2394 (regulated) | Verify durable compound key `MUMMH015-{layer}-{gid}`. |
| **CRS** | A3 | **COMPLETE** | `PROVENANCE_METADATA.crs` | Explicit `EPSG:4326` (WGS 84) coordinate representation | Verify coordinate order is `[longitude, latitude]`. |
| **Source version** | A3 | **COMPLETE** | `GeometryRecord.versionLabel` | `v1.0-bhuvan-protected-7068`, `v1.0-bhuvan-prohibited-9785`, `v1.0-bhuvan-regulated-2394` | Verify version is stored in `SpatialResult.geometryVersion`. |
| **Retrieval timestamp** | A3 | **COMPLETE** | `PROVENANCE_METADATA.retrievalDate` | `2026-09-07` timestamp logged in metadata and checksums | Confirm retrieval date is preserved on case creation. |
| **Geometry hashes** | A3 | **COMPLETE** | `data/sources/.../checksums.json` | SHA-256 checksums computed and stored for all 3 layers | Add test verifying runtime geometry matches recorded SHA-256. |
| **Geometry gate** | A3 | **COMPLETE** | `scripts/check-gate.mjs` & `docs/GEOMETRY_GATE.md` | `PASSED_WITH_LIMITATIONS` status verified by `npm run gate:check` | Maintain automated gate assertion in CI/CD pipeline. |
| **MultiPolygon handling** | A4 | **COMPLETE** | `spatialEngine.ts:143-154` | `turf.polygonToLine` iterates MultiPolygon features and computes min distance | Add unit test with multi-component MultiPolygons and holes. |
| **Point containment** | A4 | **COMPLETE** | `spatialEngine.ts:140` | `turf.booleanPointInPolygon` evaluates boundary containment | Tested in `geometryNesting.test.ts` and `spatialEngine.test.ts`. |
| **Boundary distance** | A4 | **COMPLETE** | `spatialEngine.ts:143-154` | `turf.pointToLineDistance` calculates true geodesic distance in km -> m | Verified: interior points return perimeter distance > 0m. |
| **GPS uncertainty** | A4 | **COMPLETE** | `spatialEngine.ts:156-171` | `distanceMeters <= gpsAccuracyMeters` -> `LOCATION_UNCERTAIN` | Tested with edge reference coordinate (19.1931225, 73.8528893). |
| **Poor GPS gate** | A4 | **COMPLETE** | `spatialEngine.ts:120-135` | `gpsAccuracyMeters > 35.0` -> `EVIDENCE_INSUFFICIENT` | Tested with ±46m error telemetry. |
| **Missing geometry** | A4 | **COMPLETE** | `spatialEngine.ts:34-49` | Missing/null geometry -> `SOURCE_UNAVAILABLE` | Verified safe fallback without throwing unhandled exceptions. |
| **Invalid geometry** | A4 | **COMPLETE** | `spatialEngine.ts:98-117` | Confidence score < 0.70 or `RETIRED` -> `SOURCE_UNAVAILABLE` | Verified safe state transition. |
| **Layer attribution** | A4 | **COMPLETE** | `spatialEngine.ts:217-308` | Returns specific tier explanation and higher-tier uncertainty caveat | Verified 3-tier precedence in `spatialEngine.test.ts`. |
| **Determinism** | A4 | **COMPLETE** | `spatialEngine.ts` pure function | Idempotent calculations across repeated executions | Add multi-iteration determinism test suite. |
| **Four scenarios** | A4 | **COMPLETE** | `mockScenarios.ts` & `persistence.test.ts` | Evaluates 4 benchmark scenarios against real resolver | Verified in `persistence.test.ts` Requirement 16. |

---

## 3. Detailed Architectural Findings

### 3.1 Layer Separation & Integrity (A3)
1. **No Merged Geometry**: The three Bhuvan layers (`asi:protected_areas`, `asi:prohibited_boundary`, `asi:regulated_boundary`) remain isolated objects with independent GIDs (7068, 9785, 2394) and buffer distances (0m, 100m, 300m).
2. **Provenance Traceability**: `PROVENANCE_METADATA` provides full provenance (portal URL, WMS endpoint, WFS status, verbatim disclaimer, GIDs, retrieval date, and limitation notes).
3. **No Accusatory / Legal Claims**: All spatial outputs, statements, and explanations adhere to non-accusatory language contracts.

### 3.2 Spatial Math Hardening (A4)
1. **Perimeter Distance vs Centroid**: Distance calculations evaluate geodesic perimeter distance to MultiPolygon boundary line strings.
2. **Multi-Tier Resolution Precedence**:
   - `Protected Area` (Inside) -> `POTENTIAL_ZONE_CONCERN`
   - `Prohibited Buffer` (100m, Inside) -> `POTENTIAL_ZONE_CONCERN` (with protected tier caveat if near boundary)
   - `Regulated Buffer` (300m, Inside) -> `POTENTIAL_ZONE_CONCERN` (with higher tier caveat if near boundary)
   - `Outside Regulated` -> `NO_SPATIAL_CONCERN_INDICATED` (distance to 300m perimeter)
   - `Accuracy Overlap` -> `LOCATION_UNCERTAIN`
   - `GPS Error > 35m` -> `EVIDENCE_INSUFFICIENT`
   - `Missing / Unreviewed Geometry` -> `SOURCE_UNAVAILABLE`
3. **Downstream Immutability**: Spatial calculations are executed strictly at capture/case-creation time. Downstream consumers (`SpatialResultPage`, `CaseDetailPage`, `ReviewerQueuePage`, `ReviewerPacketPreview`) consume the stored `spatialResult` without recalculating.

---

## 4. Implementation & Hardening Plan

1. **A3 Provenance Test Suite**: Add automated tests to verify:
   - Raw GeoJSON file integrity and SHA-256 hashes against `checksums.json`.
   - Immutable historical case provenance (ensuring that hypothetical future geometry changes do not alter historical cases).
   - Provenance completeness in the canonical Reviewer Packet data structure.
2. **A4 Spatial Hardening Test Suite**: Add comprehensive edge-case tests:
   - MultiPolygon with multiple disconnected islands and interior holes.
   - Coordinates at exact boundary vertices (distance = 0.0m).
   - Extreme invalid coordinates (NaN, Infinity, [-999, 999], [0, 0]).
   - Degraded GPS boundary condition (34.9m vs 35.1m).
   - Deterministic execution across 100 consecutive evaluations.
   - Confirmation that no downstream views invoke `@turf/turf` or recalculate spatial results.
