# PRODUCT CONTRACT & FREEZE
## HERITAGE PULSE (हेरिटेज पल्स)
**Smart India Hackathon 2026 · Problem Statement PS 26197 · Theme: Heritage & Culture**  
*Owner*: Ameya (Product Lead) | *Technical Reviewer*: Vishwajeet | *UX Reviewer*: Vivek

---

## 1. One-Sentence Product Definition

> **Heritage Pulse is a mobile-first field-evidence and Change Ledger system for protected heritage sites that converts community-sourced visible-change observations into structured, uncertainty-aware, source-linked records for responsible authority review.**

---

## 2. Target Users

1. **Primary Reporter (Citizen / Visitor / Student / Volunteer)**: Notices a visible physical condition near a protected monument and captures a neutral observation without making legal allegations.
2. **Local Resident / Culture Bearer**: Provides factual local context and observes surrounding setting changes safely.
3. **Institutional Reviewer (Curator / Heritage NGO / Conservation Officer)**: Evaluates the assembled case evidence, verifies boundary proximity and GPS uncertainty, and issues administrative recommendations.

---

## 3. MVP 12-Step User Journey

1. **Select Target Site**: User views Shivneri Fort Site Context Card with verified significance and sourced layer notice.
2. **View Context & Limitations**: User reads explicit non-legal decision support notice.
3. **Capture Factual Description**: Objective description entered in response to *"What did you observe?"*.
4. **Attach Photo Evidence**: Photo captured or uploaded with automatic timestamping.
5. **Acquire GPS Telemetry**: Real-time GPS coordinate and reported horizontal accuracy radius ($r_{gps}$) captured.
6. **Select Observation Category**: One of 7 standard visible-change categories chosen.
7. **Spatial Calculation**: Comparison of observation against source-labelled MultiPolygon boundary.
8. **Explainable Spatial Verdict**: System renders 3-part statement (Reporter account + GIS math + Authority verification reminder).
9. **Case ID Generation**: Sequential, tamper-evident case ID issued (e.g. `HP-MH-2026-0001`).
10. **Append to Change Ledger**: Event logged in the append-only chronological history.
11. **Reviewer Assessment**: Reviewer requests clarification, recommends ground verification, or refers the case.
12. **Reviewer Packet Export**: System compiles an exportable HTML/PDF dossier with all evidence and uncertainty notes.

---

## 4. In-Scope Observation Categories

* `Possible construction or extension` (`POSSIBLE_CONSTRUCTION`): New structure, foundation, wall, scaffolding, or structural extension visible near the site.
* `Possible encroachment` (`POSSIBLE_ENCROACHMENT`): Activity or temporary structure appearing to occupy a sensitive protected zone.
* `Physical damage` (`PHYSICAL_DAMAGE`): Stone fracture, displaced masonry, structural weathering, wall collapse, or carving detachment.
* `Dumping or waste` (`DUMPING_OR_WASTE`): Rubble, discarded building materials, or waste accumulation near monument feature or access route.
* `Blocked access` (`BLOCKED_ACCESS`): Pathway, entrance, gateway, public passage, or access route obstructed.
* `Structure alteration` (`STRUCTURE_ALTERATION`): Surface painting, plaster repair, masonry modification, or architectural alteration of existing structure.
* `Visual obstruction` (`VISUAL_OBSTRUCTION`): Temporary structure, commercial signage, hoarding frame, or object altering monument sightlines or setting.
* `Other visible change` (`OTHER_VISIBLE_CHANGE`): Unclassified physical, contextual, or environmental condition noted.

---

## 5. Explicit Out-of-Scope Non-Goals (What We Do NOT Build)

* ❌ Automated illegal construction determination or legal guilt verdicts.
* ❌ Identification of suspected property owners, contractors, or alleged offenders.
* ❌ Public shaming or accusation feeds.
* ❌ Drone surveillance or real-time satellite change detection AI.
* ❌ Facial recognition or license plate scanning.
* ❌ Automatic demolition or enforcement recommendations.
* ❌ NOC issuance, NOC verification, or municipal building permit approvals.
* ❌ Replacement for ASI, NMA, Police, or court judicial authority.
* ❌ Nationwide multi-thousand monument mapping in MVP.

---

## 6. Safe Language, Privacy Rules & Disclaimers

The product strictly enforces non-accusatory, scientifically defensible language:
* **Approved Phrases**: *"Potential zone-related concern"*, *"Possible construction activity"*, *"Location uncertain"*, *"Evidence incomplete"*, *"Authority verification required"*.
* **Banned Phrases**: *"Illegal construction detected"*, *"Encroacher identified"*, *"Guilty"*, *"Demolition required"*, *"NOC absent"*, *"Violation confirmed"*.

**Field Capture Privacy Warning**:
> *"Do not photograph identifiable human faces or private property signage."*

**Allowed Case Status Progression**:
> `DRAFT -> SUBMITTED -> ADDITIONAL_INFO_NEEDED | FIELD_VERIFICATION_RECOMMENDED | REFERRED | CLOSED`

**Mandatory Advisory Disclaimer**:
> *"Indicative decision support only. This system does not determine legal status or property boundaries. Authority verification is required."*

---

## 7. Four Benchmark Demo Scenarios

| # | Scenario Name | Coordinates | GPS Accuracy | Expected System Output |
|---|---|---|---|---|
| 1 | **Clearly Inside Zone** | $19.1982^\circ\text{N}, 73.8624^\circ\text{E}$ | $\pm 4.5\text{m}$ | `POTENTIAL_ZONE_CONCERN` (Inside Sourced Layer) |
| 2 | **Clearly Outside Zone** | $19.2085^\circ\text{N}, 73.8750^\circ\text{E}$ | $\pm 5.0\text{m}$ | `NO_SPATIAL_CONCERN_INDICATED` (180m Outside) |
| 3 | **Near Boundary (Edge)** | $19.2010^\circ\text{N}, 73.8650^\circ\text{E}$ | $\pm 14.5\text{m}$ | `LOCATION_UNCERTAIN` (Accuracy circle overlaps boundary) |
| 4 | **Degraded GPS Signal** | $19.1982^\circ\text{N}, 73.8624^\circ\text{E}$ | $\pm 46.0\text{m}$ | `EVIDENCE_INSUFFICIENT` (Error $> 35\text{m}$ threshold) |

---

## 8. Definition of a Completed Case

A case is considered complete when:
1. It contains a valid Case ID, timestamp, and site linkage.
2. A factual description and category are recorded.
3. GPS coordinates and reported accuracy radius are captured.
4. Spatial reasoning output and uncertainty notes are generated.
5. All lifecycle events are immutably logged in the Change Ledger.
6. A standardized Reviewer Packet can be compiled and printed.
