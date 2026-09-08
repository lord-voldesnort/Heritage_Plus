# Heritage Pulse — Demo Runbook (SIH 2026)
**Target Problem Statement**: PS 26197 (Heritage & Culture)  
**Active Site**: Fort of Shivner (Shivneri Fort) [MUMMH015], Junnar, Pune District, Maharashtra  
**Target Duration**: 3–5 Minutes

---

## 1. Quick Start & Setup

```bash
# 1. Install dependencies (if fresh clone)
npm install

# 2. Run verification gates
npm test
npm run gate:check
npm run contract:validate

# 3. Start local development server
npm run dev
```

Open browser at: `http://localhost:5173`

---

## 2. 3–5 Minute Judge-Facing Demo Narrative

### Step 1: Site Context & Sourced Provenance (`/`)
1. Open the home page.
2. Point out the **Active Prototype Site Card**:
   - **Monument**: Fort of Shivner (`MUMMH015`), Junnar, Maharashtra.
   - **Source Agency**: Bhuvan / NRSC (ISRO) in association with Archaeological Survey of India (ASI).
   - **CRS & Layer**: `EPSG:4326` (WGS 84), active layer `v1.0-bhuvan-protected-7068` (Confidence: 95%).
   - **Verbatim Disclaimer**: Explicitly highlight the Bhuvan Version 1.0 limitation statement (*"indicative decision support only; authority verification required"*).
3. Point out the **MapLibre Polygon Boundary View** displaying the true surveyed MultiPolygon boundary.

### Step 2: Field Observation Capture (`/capture`)
1. Click **"Document Visible Change"** or navigate to `/capture`.
2. Select an **Observation Category** (e.g. `POSSIBLE_CONSTRUCTION` or `ALTERATION_OR_OBSTRUCTION`).
3. Enter a neutral factual description:
   - *"Stone masonry foundation and mortar mixing observed near north gateway approach."*
4. Click **"Acquire Current Position"** or use the quick scenario coordinates:
   - **Latitude**: `19.1980`
   - **Longitude**: `73.8580`
   - **GPS Accuracy**: `±4.5m`
5. Upload or drag-and-drop a sample photo evidence file.
6. Check **"I confirm this is an objective factual observation"**.
7. Click **"Submit Observation for Spatial Review"**.

### Step 3: Engine-Derived Spatial Assessment (`/result/:caseId`)
1. Show the automatically assigned **Stable Case ID** (e.g. `HP-20260908-001`).
2. Highlight the **Spatial Reasoning Card**:
   - **Classification**: `POTENTIAL_ZONE_CONCERN` (Amber Badge).
   - **Geodesic Distance**: `128.8m` from surveyed boundary perimeter.
   - **Structured 3-Part Statements**:
     - *User-Reported*: Observation notes.
     - *GIS-Calculated*: Point falls within surveyed boundary polygon (`v1.0-bhuvan-protected-7068`).
     - *Authority Notice*: Indicative decision support only. Authority verification required.
3. Emphasize that **NO centroid or bounding box shortcuts** were used; distance is calculated to the true MultiPolygon boundary.

### Step 4: Change Ledger & Audit Trail (`/case/:caseId`)
1. Click **"Change Ledger"** to view the case audit trail.
2. Highlight the **Append-Only Timeline**:
   - Initial `CASE_CREATED` event timestamped with actor role `VISITOR` and status `SUBMITTED_FOR_REVIEW`.
   - Explain to judges that all reviewer actions create immutable, chronological audit records.

### Step 5: Reviewer Workflow & Action (`/reviewer`)
1. Navigate to the **Reviewer Queue** (`/reviewer`).
2. Show the newly created case in the queue with status pill `Submitted for Review`.
3. Open the case and scroll to the **Reviewer Action Card**:
4. Select a permitted action:
   - **Action**: *Recommend Field Verification* (`FIELD_VERIFICATION_RECOMMENDED`).
   - **Reviewer Note**: *"Priority physical inspection scheduled with Junnar circle curator."*
   - **Reviewer ID**: `REV-ASI-MH-042`.
5. Click **"Record Review Action & Update Ledger"**.
6. Show that a new `REVIEW_ACTION_RECORDED` event is appended to the ledger and case status updates immediately.

### Step 6: Canonical Reviewer Packet Export (`/packet/:caseId`)
1. Click **"Reviewer Packet"** or **"Generate Formal Reviewer Packet"**.
2. Walk through the formal review artifact:
   - **Official Headers**: Monument ID `MUMMH015`, Fort of Shivner, Junnar, Pune, Maharashtra.
   - **Field Evidence Metadata**: SHA-256 file checksum, upload timestamp, storage state.
   - **Spatial Finding**: Boundary tier, perimeter distance, GPS error margin.
   - **Provenance & Gate**: Bhuvan portal URL, WMS endpoint, gate status `PASSED_WITH_LIMITATIONS`.
   - **Full Audit History**: Complete ledger events.
   - **Statutory Notice**: Non-legal-determination disclaimer.
3. Click **"Print / Export PDF"** to demonstrate clean printable output.

---

## 3. Four Benchmark Scenarios (1-Click Demo Quickbar)

Use the floating **Demo Quickbar** at the bottom of the screen to quickly demonstrate all 4 conditions to judges:

| Scenario | Condition Demonstrated | Expected Result | Why It Matters |
|---|---|---|---|
| **Scenario 1** | Clearly inside protected zone (±4.5m GPS) | `POTENTIAL_ZONE_CONCERN` (128.8m from perimeter) | Demonstrates accurate spatial detection and formal evidence packet creation. |
| **Scenario 2** | Clearly outside 300m regulated zone (±5.0m GPS) | `NO_SPATIAL_CONCERN_INDICATED` (984.7m outside) | Proves system does NOT falsely flag activity outside protected boundaries. |
| **Scenario 3** | Near boundary edge uncertainty (±30.0m GPS) | `POTENTIAL_ZONE_CONCERN` with protected uncertainty note | Proves system refuses to overclaim when sensor error circle intersects boundary. |
| **Scenario 4** | Degraded GPS accuracy (±46.0m GPS > 35m) | `EVIDENCE_INSUFFICIENT` | Proves sensor error gatekeeper prevents false positives from poor telemetry. |

---

## 4. Reset & Failure Recovery

- To return to a clean demo baseline at any time, click **"Reset Demo Data"** in the Demo Quickbar or header.
- Reset restores initial seeded cases while **preserving all Bhuvan geometry layers and source provenance**.

---

## 5. Judge Q&A & Disclosure Points

1. **Is this legally binding?**  
   *No. Heritage Pulse is an indicative decision-support and evidence-compilation tool for human heritage curators and ASI authorities. It labels uncertainty and does not determine guilt or replace formal statutory processes.*
2. **Where does the boundary data come from?**  
   *Official ISRO/Bhuvan cultural monuments spatial layers (`asi:protected_areas`, `asi:prohibited_boundary`, `asi:regulated_boundary`) retrieved via WMS GetFeatureInfo for Fort of Shivner (`MUMMH015`).*
3. **How does it handle poor GPS in hill forts?**  
   *If device GPS accuracy error exceeds ±35m, the system automatically gates calculation and returns `EVIDENCE_INSUFFICIENT`, prompting repositioning in open sky.*
