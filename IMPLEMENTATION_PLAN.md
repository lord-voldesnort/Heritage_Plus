# ENGINEERING IMPLEMENTATION PLAN & BUILD SEQUENCE
## HERITAGE PULSE (हेरिटेज पल्स)
### Prototype Execution Plan, Go/No-Go Decision Gate & 3-Minute Demo Script
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Team Sinister Six*

---

## 1. Build Sequence & Engineering Phases

To ensure technical discipline and avoid feature sprawl, development strictly follows **Evidence-Continuity Order**:

```
+----------------------------------------------------------------------------------------------------+
|                                      HERITAGE PULSE BUILD SEQUENCE                                 |
+----------------------------------------------------------------------------------------------------+
|  Phase 0: Go/No-Go Validation Gate (Before UI polish)                                             |
|  └── Select Shivneri Fort, obtain source geometry, test 4 seeded scenarios locally.               |
|                                                                                                    |
|  Phase 1: Data Model & Spatial Core                                                                |
|  └── Build sites, geometry_records, observation_records, evidence_records, review_events schema. |
|                                                                                                    |
|  Phase 2: Mobile Field Capture Studio                                                             |
|  └── Implement 7 categories, photo context, hardware timestamp, GPS accuracy HUD, privacy rules.  |
|                                                                                                    |
|  Phase 3: Case Page & Change Ledger Timeline                                                       |
|  └── Render Case ID, site context card, map point, accuracy circle, verdict, and event timeline.   |
|                                                                                                    |
|  Phase 4: Reviewer Packet Export                                                                  |
|  └── Implement structured HTML/PDF Reviewer Packet generator.                                      |
|                                                                                                    |
|  Phase 5: Demo Scenario Preparation & Seeding                                                      |
|  └── Seed 4 test cases (Inside, Outside, Near Boundary, Poor GPS).                                |
|                                                                                                    |
|  Phase 6: Field Validation                                                                        |
|  └── Validate workflow at Shivneri Fort, test GPS under real conditions, verify non-accusation.    |
|                                                                                                    |
|  Phase 7: Final Hardening                                                                         |
|  └── Verify error handling, missing permissions, packet export, and mobile layout robustness.      |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Four Seeded Demo Scenarios for Evaluators

When demonstrating to SIH judges, the team will present 4 deterministic test scenarios:

| # | Scenario | Point vs Boundary | GPS Error ($r_{gps}$) | Expected System Output | Key Demonstration |
|---|---|---|---|---|---|
| **1** | **Clearly Inside** | Point strictly inside Shivneri geometry | $\pm 4.5\text{m}$ | `Potential zone-related concern – authority verification required.` | Spatial classification + evidence packet generation |
| **2** | **Clearly Outside** | Point 180m outside boundary | $\pm 5.0\text{m}$ | `No spatial concern indicated by this layer.` | System does not flag everything |
| **3** | **Near Boundary** | Point 6.0m from edge | $\pm 12.5\text{m}$ (Overlaps line) | `Location uncertain – additional evidence required.` | **Uncertainty-aware refusal to overclaim** |
| **4** | **Poor GPS Accuracy** | Point inside geometry | $\pm 48.0\text{m}$ ($> 35\text{m}$) | `Location evidence insufficient.` | Hardware error gatekeeper |

---

## 3. The 3-Minute SIH Demo Video Blueprint

### Scene 1: The Field Problem (0:00 – 0:30)
* **Visual**: Show Shivneri Fort site photo and an informal WhatsApp photo of stone displacement.
* **Narration**: *"A visitor notices a possible change near a protected heritage site. A photograph or WhatsApp message may show something, but it does not preserve reliable location, source, uncertainty, or review history."*

### Scene 2: Mobile Field Capture (0:30 – 1:10)
* **Visual**: Open Heritage Pulse on a mobile PWA viewport. Select **Shivneri Fort**, tap category **"Possible Construction"**, upload photo, write a factual description ("Foundation trench excavated 10m from north gateway"), and enable GPS location ($\pm 4.5\text{m}$).
* **Narration**: *"Heritage Pulse captures the observation, photo, hardware timestamp, and GPS accuracy. It enforces factual description guidelines and avoids false accusations."*

### Scene 3: Spatial Reasoning Engine (1:10 – 1:45)
* **Visual**: Show the observation point plotted on the MapLibre/Leaflet canvas against Shivneri Fort's source polygon.
* **Narration**: *"Our spatial reasoning engine tests the point against the source-labelled geometry, measures the distance to the boundary line, and checks the device accuracy radius."*

### Scene 4: The Trust Moment (1:45 – 2:15)
* **Visual**: Switch to Demo Scenario 3 (Near Boundary). Watch the output update dynamically to `Location uncertain – additional evidence required.`
* **Narration**: *"Here is our core trust feature. When the GPS accuracy circle overlaps the boundary line, Heritage Pulse refuses to issue a false finding. It explicitly flags the case as Location Uncertain."*

### Scene 5: Change Ledger & Reviewer Packet (2:15 – 3:00)
* **Visual**: Open Case `#HP-MH-2026-0001` in the Change Ledger. Show the append-only event timeline. Open the Reviewer Console, click **Export Reviewer Packet**, and display the generated PDF.
* **Narration**: *"Heritage Pulse records every step in an append-only Change Ledger and compiles an exportable Reviewer Packet. It does not make legal findings; it makes visible heritage changes traceable and reviewable before an authority decides."*

---

## 4. Risks & Mitigations

| Risk | Consequence | Engineering Mitigation |
|---|---|---|
| **Incorrect Geometry** | False spatial classification | Source/version provenance card, reviewer state, no active layer without source metadata. |
| **GPS Error** | Wrongly classified point | Accuracy circle overlap checking; near-boundary uncertainty rule. |
| **False Accusation** | Harm to individuals/businesses | No names, no owner detection, objective wording guidelines, no public feed. |
| **Weak PS Fit** | Judges view as complaint app | Position as preservation-oriented safeguarding technology with Site Context Card. |
| **Existing System Overlap** | Judges mention Bhuvan/NMA | Demonstrate evidence continuity layer: *Observation $\to$ Provenance $\to$ Uncertainty $\to$ Review Packet*. |
