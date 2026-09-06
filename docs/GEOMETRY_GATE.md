# GEOMETRY GO/NO-GO GATE SPECIFICATION
## Heritage Pulse · Quality & Spatial Rigor Gate (GATE-01)
**Gate Owners**: Vishwajeet (Spatial Lead) & Ameya (Integration Lead)  
*Status*: Active Enforced Blocker

---

## 1. Why this Gate Exists
The entire spatial reasoning engine and Change Ledger are meaningless without a source-checked, mathematically valid boundary/zone geometry for our chosen target site. 

Inventing a circular radius around a guessed point is **strictly forbidden**. It produces false positives, misleads reviewers, and destroys the technical credibility of the product before the jury.

---

## 2. Gate Requirements & Checklist

To move `geometryGate.status` from `NOT_PASSED` to `PASSED` in `/project/GATE_STATUS.json`, the following 6 requirements must be validated:

1. **Single Target Site Selection**: Exactly one prototype site selected (e.g., *Shivneri Fort, Junnar, Maharashtra*).
2. **Authoritative Source Acquisition**: A source-documented GeoJSON geometry acquired from an official gazette, ASI survey map, or verified cadastral sheet.
3. **Provenance Documentation**: Source agency/document URL, capture date, CRS (EPSG:4326), and known limitation notes recorded.
4. **Deterministic Test Points Prepared**:
   - Point 1: Clearly Inside Sourced Polygon.
   - Point 2: Clearly Outside Sourced Polygon.
   - Point 3: Near Boundary Edge ($\le \text{GPS error margin}$).
5. **Degraded GPS Handling Verified**: Simulated high GPS error ($> 35\text{m}$) confirmed to return `LOCATION_UNCERTAIN` / `EVIDENCE_INSUFFICIENT`.
6. **No-Guessing Rule**: If genuine geometry cannot be validated, the team must switch sites rather than fabricate a centroid circle.

---

## 3. Structural Blocking Enforcement

The following development tasks are structurally blocked until this gate passes:
* `SPATIAL-01`: Implement Point-in-Polygon & Distance calculations
* `SPATIAL-02`: Accuracy-Circle Overlap & Uncertainty Evaluator
* `UI-02`: Interactive Map with Vector Layers
* `LEDGER-01`: Full Ledger Integration with Spatial Events

Running `npm run gate:check` will inspect `/project/GATE_STATUS.json` and exit with an error if the gate is `NOT_PASSED`.
