# DEFINITIONS OF DONE (DoD)
## HERITAGE PULSE (हेरिटेज पल्स)
*Quality Standards & Acceptance Criteria Matrix*

---

## 1. Global Quality Gate (Applies to All Tasks)

A task cannot be marked `DONE` in `TASK_STATUS.json` until:
1. All TypeScript compiler errors are resolved (`npm run build`).
2. Vitest automated tests pass (`npm run test`).
3. Contract scanner passes with zero banned accusatory terms (`npm run contract:validate`).
4. Task board validation passes (`npm run team:validate`).
5. Pull Request has been reviewed and approved by the assigned domain lead.

---

## 2. Feature-Specific Acceptance Criteria

### Spatial & GIS Features (`SPATIAL-*`)
* Uses valid MultiPolygon boundaries from source documentation; centroid circular radius calculations are absent.
* Boundary distance is computed using geodesic methods in meters.
* GPS accuracy circle intersection with boundary strictly produces `LOCATION_UNCERTAIN`.
* Degraded GPS error $> 35\text{m}$ strictly produces `EVIDENCE_INSUFFICIENT` / `LOCATION_UNCERTAIN`.

### Field Capture & UI Features (`UI-*`)
* Fully usable on mobile viewport ($375\text{px} - 430\text{px}$) with single-hand reachability.
* Touch targets are at least $48\text{px} \times 48\text{px}$.
* Form displays objective question *"What did you observe?"* with zero accusatory wording.
* Clear visual distinction between confirmed facts, GIS computations, and uncertainty.

### Change Ledger Features (`LEDGER-*`)
* All state transitions and reviewer inputs generate new dated `ReviewEvent` entries.
* Original observation records and initial timestamps are never modified in place.
* Every case receives a valid, unique Case ID format (e.g. `HP-MH-2026-XXXX`).

### Reviewer Packet & Export (`PACKET-*`)
* Contains complete 3-part statement separation (Citizen account, GIS math, Authority notice).
* Includes raw coordinates, GPS error margin, capture timestamp, and source layer reference.
* Print preview / PDF layout renders cleanly on standard A4 paper dimensions without layout clipping.
