# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## HERITAGE PULSE (हेरिटेज पल्स)
### A Provenance-Aware, Uncertainty-Driven Change Ledger for Community-Sourced Safeguarding of India’s Protected Heritage Sites
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Team Sinister Six*

---

## 1. Executive Summary & Problem Context

India’s protected heritage sites are exposed to visible changes and threats: unauthorized or unclear construction, extensions, physical damage, dumping, blocked access, alterations, visual obstruction, and changes to surrounding settings. A visitor, resident, student, or volunteer may notice one of these changes, but a photograph or informal message is often insufficient for serious review.

Existing official applications (such as Indian Heritage, Bhuvan ASI application, and National Monuments Authority NOC portals) provide monument information, interactive maps, or authority-side permission workflows. However, Bhuvan explicitly notes that mapped locations and protected boundaries require verification and cannot be used for legal purposes.

**Heritage Pulse** addresses the specific **evidence-continuity gap** between field observation and responsible review:

> *Can an unstructured field observation be converted into a trustworthy, uncertainty-labelled, source-linked heritage change case that another person can review?*

Heritage Pulse is protection-first. It is deliberately **not** a tourism application, digital twin, 3D reconstruction platform, social network, generic complaint portal, legal-verdict engine, or automatic encroachment detector.

---

## 2. Honest SIH Positioning

PS 26197 asks for student innovations that showcase India’s rich cultural heritage and traditions. Heritage Pulse interprets safeguarding protected heritage as a legitimate, essential way of sustaining and preserving cultural heritage.

* **Core Innovation**: Converting community field observations into structured, uncertainty-aware change-ledger records that support responsible review.
* **Showcase Component**: A concise **Site Context Card** (site name, one verified significance paragraph, one representative image, and sourced map layer) establishes cultural importance as context for evidence workflows.

---

## 3. Product Thesis: The 5 Connected Layers

1. **Site Context Card**: Contains site identity, short significance description, representative photograph, target geometry/zone source, and statement of limitations.
2. **Field Capture Layer**: Mobile-first capture of observation category, factual description, photo evidence, device GPS coordinates, accuracy radius, timestamp, and consent options.
3. **Spatial Reasoning Layer**: Performs Point-in-Polygon testing, Distance-to-Boundary calculation, and GPS Accuracy-Circle overlap checking against source-labelled GeoJSON geometry.
4. **Change Ledger**: The hero feature—an append-only, traceable record of observation events, location captures, source versions, classifications, evidence uploads, review requests, and status changes.
5. **Reviewer Packet**: Structured exportable HTML/PDF packet containing complete case evidence, uncertainty statement, map context, and review timeline.

---

## 4. Scope & Visible Change Categories

The umbrella concept is **visible heritage change**. Supported categories include:
* **Possible Construction**: New structure, extension, wall, or foundation near site.
* **Possible Encroachment**: Activity or structure appearing to occupy sensitive zone area.
* **Physical Damage**: Wall, carving, gateway, staircase, or feature damaged.
* **Dumping or Waste**: Debris or waste near protected feature or access route.
* **Blocked Access**: Route, entrance, path, or public access obstructed.
* **Alteration**: Repair, painting, extension, signage, or visual modification changing site appearance.
* **Visual Obstruction**: New object/structure affecting visibility or setting.

---

## 5. Ethical & Privacy Guardrails

1. **No Accusations or Guilt**: The form asks "What did you observe?" rather than "Who is the encroacher?".
2. **No Names or Faces**: Form explicitly warns against including personal names, faces, private details, or allegations.
3. **Refusal to Overclaim**: System returns cautious engineering outputs (e.g., `Location uncertain`, `Potential zone concern – authority verification required`) and never claims legal violation.
4. **3-Statement Verdict Separation**:
   * *What the reporter said*
   * *What the map calculation returned*
   * *What an authorized reviewer must check*

---

## 6. Functional Requirements Matrix

### Epic 1: Site Context Card (Shivneri Fort Prototype)
* **FR-1.1**: Display official site name (`Shivneri Fort`), location (Junnar, Pune, Maharashtra), and brief historical significance paragraph.
* **FR-1.2**: Display sourced spatial layer metadata, source date, agency, and explicit limitation disclaimer.

### Epic 2: Field Capture Studio
* **FR-2.1**: Select from 7 standardized visible-change categories.
* **FR-2.2**: Capture photo context with automatic hardware timestamp and GPS coordinate extraction.
* **FR-2.3**: Display real-time GPS Accuracy HUD ($r_{gps}$) with dynamic feedback.
* **FR-2.4**: Enforce objective, non-accusatory text prompt guidelines.

### Epic 3: Spatial Reasoning Engine
* **FR-3.1**: Point-in-polygon evaluation against source GeoJSON geometry.
* **FR-3.2**: Minimum distance-to-boundary computation.
* **FR-3.3**: GPS accuracy-circle overlap detection against boundary perimeters.
* **FR-3.4**: Return explainable outputs: `Potential zone-related concern`, `No spatial concern indicated by this layer`, `Location uncertain`, `Classification unavailable`.

### Epic 4: Change Ledger & Timeline
* **FR-4.1**: Append-only event store recording observation created, location captured, source applied, classification generated, evidence added, and review actions.
* **FR-4.2**: Immutable case ID assignment (`HP-MH-2026-XXXX`).

### Epic 5: Reviewer Console & Packet Export
* **FR-5.1**: Simulated reviewer workflow with status states (`Submitted`, `Additional info needed`, `Field verification recommended`, `Referred manually`, `Closed – insufficient location`, `Closed – reviewed`).
* **FR-5.2**: One-click generation of exportable Reviewer Evidence Packets (HTML/PDF).

---

## 7. Target Personas

* **Visitor / Tourist**: Captures a visible change safely without making legal claims.
* **Local Resident**: Reports site concerns near a protected site with privacy and structure.
* **Student / Volunteer**: Conducts field documentation for heritage research or conservation.
* **NGO / Curator / Reviewer**: Examines evidence packets and decides next official verification steps.

---

## 8. Success Metrics

* 1 Target Site (Shivneri Fort) with reviewed source geometry.
* 4 Seeded Demo Scenarios (Inside, Outside, Near Boundary, Poor GPS) producing 100% correct explainable output.
* 0 False Certainty in ambiguous edge cases.
* Field submission completed in under 90 seconds.
