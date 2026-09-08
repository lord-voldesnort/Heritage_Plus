# A8 Master Demo Runbook & Presentation Guide (SIH 2026)

**Target Problem Statement**: PS 26197 (Heritage & Culture)  
**Product**: Heritage Pulse (हेरिटेज पल्स)  
**Active Site**: Fort of Shivner (Shivneri Fort) [MUMMH015], Junnar, Pune District, Maharashtra  
**Target Duration**: 3–5 Minutes  

---

## 1. Quick Start & Setup

```bash
# 1. Clone repository & install dependencies
git clone https://github.com/lord-voldesnort/Heritage_Guard.git
cd Heritage_Guard
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

## 2. Three-Minute Core Pitch Narration

> *"A field observation becomes a structured case. Heritage Pulse compares it with three source-labelled Bhuvan layers, preserves uncertainty instead of overclaiming, maintains the full Change Ledger, allows a reviewer to act, and produces a traceable evidence packet."*

---

## 3. Step-by-Step Judge-Facing Demonstration Script

### Step 1: Sourced Monument Context (`/`) — 45 Seconds
1. **Show Site**: Open Home Page (`/`). Point out Fort of Shivner (Shivneri Fort / शिवनेरी किल्ला [MUMMH015]).
2. **Highlight Bhuvan Provenance**:
   - Protected Area (`asi:protected_areas` GID 7068)
   - 100m Prohibited Boundary (`asi:prohibited_boundary` GID 9785)
   - 300m Regulated Boundary (`asi:regulated_boundary` GID 2394)
3. **Show Institutional Disclaimers**: Show verbatim Bhuvan source notice and Geometry Gate status (`PASSED_WITH_LIMITATIONS`).

### Step 2: Field Capture & Spatial Evaluation (`/capture`) — 60 Seconds
1. Click **"Field Capture"** in the top navigation bar.
2. Demonstrate the **1-Click Quick-Fill Scenarios**:
   - Click **Scenario 1 (Inside Protected)**: Sets coordinates `(19.1980°N, 73.8580°E)` with `±4.5m` GPS accuracy.
   - Note the factual description: *"Foundation excavation observed near north gateway"*.
   - Point out the uploaded photo and calculated SHA-256 checksum.
3. Click **"Submit Observation & Calculate Spatial Proximity"**.
4. Show the immediate transition to the **Spatial Result View (`/result/:id`)**:
   - Classification: `POTENTIAL_ZONE_CONCERN`
   - Perimeter Distance: `128.8m` from outer protected boundary
   - Source Layer: `v1.0-bhuvan-protected-7068`
   - Stable Case ID: `HP-MH-2026-XXXX`

### Step 3: Change Ledger & Audit Trail (`/ledger`, `/case/:id`) — 45 Seconds
1. Click **"View Case Detail"** or open **"Change Ledger"** (`/ledger`).
2. Show the append-only `eventsTimeline`:
   - `OBSERVATION_CREATED` (Citizen Observer)
   - `LOCATION_CAPTURED` (Hardware Sensor)
   - `SPATIAL_CALCULATED` (Spatial Engine)
   - `REVIEW_ACTION_RECORDED` (Submitted for Review)
3. Highlight that historical events are immutable and cannot be rewritten.

### Step 4: Institutional Reviewer Workflow (`/reviewer`) — 60 Seconds
1. Navigate to **"Reviewer Queue"** (`/reviewer`).
2. Show the newly submitted case in the triage queue.
3. Click **"Review Action"** to open the `ReviewerActionCard`.
4. Select **"Recommend Field Verification"** (`FIELD_VERIFICATION_RECOMMENDED`).
5. Enter institutional justification:
   > *"Physical on-ground boundary verification scheduled with ASI Pune Circle field unit."*
6. Click **"Append Decision to Change Ledger"**.
7. Show that case status updates to `FIELD_VERIFICATION_RECOMMENDED` and a 5th review event is appended.

### Step 5: Canonical Reviewer Packet Export (`/packet/:id`) — 45 Seconds
1. Click **"Export Reviewer Packet"** (`/packet/:id`).
2. Point out the comprehensive 8-section evidence dossier:
   - Header with vernacular name and monument number
   - Factual observation summary & category
   - GPS telemetry with circular error disk
   - Exact spatial result reading from stored state (zero recalculation)
   - Bhuvan source provenance and gate limitation statement
   - Evidence photo with cryptographic SHA-256 digest
   - Full Change Ledger timeline
   - Statutory non-legal determination disclaimer
3. Click **"Print / Export PDF"** to demonstrate the clean printable format.

---

## 4. Four Benchmark Scenarios Reference Card

| Button | Scenario Name | Coordinates | GPS Accuracy | Expected Verdict | Key Demonstration Point |
|---|---|---|---|---|---|
| **Scenario 1** | Inside Protected | 19.1980°N, 73.8580°E | ±4.5m | `POTENTIAL_ZONE_CONCERN` | Standard positive observation within monument perimeter. |
| **Scenario 2** | Outside Regulated | 19.2085°N, 73.8750°E | ±5.0m | `NO_SPATIAL_CONCERN_INDICATED` | Clear negative finding 984m outside regulated boundary. |
| **Scenario 3** | Near Boundary (Uncertainty) | 19.1931225°N, 73.8528893°E | ±30.0m | `POTENTIAL_ZONE_CONCERN` | Multi-tier reasoning: point inside 100m Prohibited layer with higher-tier Protected uncertainty note. |
| **Scenario 4** | Degraded GPS | 19.1980°N, 73.8580°E | ±46.0m | `EVIDENCE_INSUFFICIENT` | Refuses to overclaim when sensor uncertainty exceeds 35m threshold. |

---

## 5. Live Demo Fallback & Recovery Procedures

- **Demo Reset**: Click **"Reset Demo Data"** on the top quickbar to restore clean baseline mock cases.
- **GPS Hardware Offline**: Use the 1-Click Scenario Quick-Fill buttons which provide validated ground-truth coordinates.
- **Camera Access Blocked**: File selector accepts local image files or falls back to sample mock imagery automatically.
- **Offline / Local Execution**: The entire application runs 100% locally on `localhost:5173` with zero external API dependencies.
