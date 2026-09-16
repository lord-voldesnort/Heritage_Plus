# HERITAGE PULSE (हेरिटेज पल्स)
## A Provenance-Aware, Uncertainty-Driven Change Ledger for Community-Sourced Safeguarding of India’s Protected Heritage Sites
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Prepared for Team Sinister Six*
*Organization: AICTE | Department: AICTE, MIC-Student Innovation | Theme: Heritage & Culture*

---

## 1. Executive Summary & Core Decision

### 1.1 Executive Decision
**Heritage Pulse** is a mobile-first field-evidence and change-ledger system for protected heritage sites. It allows a visitor, resident, student, volunteer, or heritage worker to record a visible change near one selected protected site—such as possible new construction, extension, physical damage, dumping, blocked access, physical alteration, or visual obstruction—and converts that observation into a structured, time-stamped, map-aware, provenance-preserving case record for review.

Heritage Pulse is deliberately **not** a tourism application, digital twin, 3D reconstruction platform, social network, generic complaint portal, legal-verdict engine, or automatic encroachment detector. Its central job is narrower:

> *Can an unstructured field observation be converted into a trustworthy, uncertainty-labelled, source-linked heritage change case that another person can review?*

The product is protection-first. Its cultural relevance comes from safeguarding protected heritage and preserving the integrity of the cultural sites and traditions associated with them. The interface includes a compact **Site Context Card**—site name, one verified significance paragraph, one representative image, and the sourced map layer—as context for the evidence workflow.

The hero feature is the **Change Ledger**: a traceable record of what was observed, where it was observed, when it was observed, which evidence supports it, how certain the location is, which map and source versions were used, what remained uncertain, and what review action followed.

```
+---------------------------------------------------------------------------------------------------+
|                                  THE HERITAGE PULSE CORE THESIS                                   |
|                                                                                                   |
|   "Field observation → source & timestamp → map relationship → GPS uncertainty →                 |
|    change ledger → human review → structured packet."                                             |
|                                                                                                   |
|   1. Ingests neutral citizen observations without generating slanderous accusations.              |
|   2. Computes spatial truth using polygon geometry & device uncertainty circles (no overclaiming). |
|   3. Preserves an append-only, dated Change Ledger of physical and contextual continuity.          |
|   4. Generates standardized, audit-ready Reviewer Packets for curators and heritage bodies.       |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Honest SIH Positioning

PS 26197 asks for student innovations that showcase India’s rich cultural heritage and traditions. Heritage Pulse interprets heritage safeguarding as a legitimate and essential way of sustaining and preserving cultural heritage.

**Honest Position Statement**:
> Heritage Pulse is a preservation-oriented software innovation under Heritage & Culture. It protects the evidentiary integrity of protected heritage sites by converting community and field observations into structured, uncertainty-aware records that can support responsible review. A concise site-context layer explains the cultural importance of the protected site, but the core innovation is the safeguarding and change-ledger workflow.

**Judges' Challenge Defense**:
> *"We intentionally avoided building another tourism or monument-discovery application because official and institutional systems already provide heritage information and maps. Our innovation addresses the preservation gap after a person notices change: we make that observation traceable, spatially cautious, and reviewable without pretending to make a legal determination."*

---

## 3. The Problem & Existing Capabilities

### 3.1 The Gap in Existing Systems

| Existing Capability | What it provides | What Heritage Pulse adds |
|---|---|---|
| **Indian Heritage / Heritage Maps** | Public monument information, descriptions, maps. | Field observation-to-case workflow with evidence continuity. |
| **Bhuvan Heritage Application** | Mapped layers, visualization, measurement. | Source version, GPS uncertainty, photo context, case history, cautious status. |
| **NMA / NOAPS Workflows** | Permission and authority-side NOC processes. | Pre-review evidence preparation; does not inspect or approve NOCs. |
| **WhatsApp / Email / Social Media** | Fast informal reporting. | Structured metadata, map relationship, uncertainty, provenance, review timeline. |
| **General GIS Tools** | Mapping and spatial analysis. | Domain-specific heritage change ledger and exportable reviewer packet. |

---

## 4. Prototype Target Site & Use Case

### 4.1 Prototype Site
* **Shivneri Fort** (Junnar, Pune District, Maharashtra) — birthplace of Chhatrapati Shivaji Maharaj.
* One site is used to validate the end-to-end workflow before scaling to additional sites via the repeatable onboarding protocol.

### 4.2 Prototype User Story
A visitor, student, resident, or heritage volunteer observes possible construction, damage, dumping, obstruction, or physical alteration near Shivneri Fort. They use Heritage Pulse to capture the observation, photograph, GPS point, location accuracy, description, and time. The system compares the observation with the selected source-labelled site or zone layer, checks whether GPS uncertainty overlaps the boundary, records the observation in an append-only Change Ledger, and generates a neutral review packet stating what is known, what is uncertain, and what an authorized reviewer should verify.

### 4.3 Visible Change Categories

1. **Possible Construction**: New structure, extension, wall, or foundation visible near site.
2. **Possible Encroachment**: Activity or structure appearing to occupy sensitive zone area.
3. **Physical Damage**: Wall, carving, gateway, staircase, or feature damaged.
4. **Dumping or Waste**: Debris or waste near protected feature or access route.
5. **Blocked Access**: Route, entrance, path, or public access obstructed.
6. **Alteration**: Repair, painting, extension, signage, or visual modification changing site appearance.
7. **Visual Obstruction**: New object/structure affecting visibility or setting.

---

## 5. Product Definition: The 5 Connected Layers

1. **Site Context Card**: Contains site identity, short significance paragraph, representative image, target site geometry or zone source, and statement of limitations.
2. **Field Capture Layer**: Mobile-first capture of observation category, factual description, photo, device GPS location, accuracy radius, timestamp, and privacy consent.
3. **Spatial Reasoning Layer**: Point-in-polygon testing, distance-to-boundary calculation, and GPS accuracy-circle overlap checking against source GeoJSON.
4. **Change Ledger**: The core product—append-only record of observation events, location captures, source versions, classifications, evidence uploads, review requests, and status changes.
5. **Reviewer Packet**: Exportable HTML/PDF packet containing case summary, map context, photo evidence, uncertainty statement, evidence limitations, case ID, and status timeline.

---

## 6. Spatial Uncertainty Model

The system tests three spatial conditions:
* **Point-in-Polygon**: Tests if reported coordinate falls inside the active GeoJSON polygon.
* **Distance-to-Boundary**: Calculates Euclidean/geodesic distance to boundary edge.
* **Accuracy-Circle Overlap**: Treats device-reported horizontal accuracy as uncertainty radius. If accuracy circle overlaps the boundary edge, returns `LOCATION_UNCERTAIN`.

### Engineering Outputs
* **Point clearly inside**: `Potential zone-related concern – authority verification required.`
* **Point clearly outside**: `No spatial concern indicated by this layer; this does not prove absence of other issues.`
* **Accuracy circle overlaps boundary**: `Location uncertain; additional evidence required.`
* **Source geometry unreviewed**: `Classification unavailable; source review required.`
* **Poor GPS ($> 35\text{m}$)**: `Location evidence insufficient.`

---

## 7. Change Ledger Data Model

1. **Site Record**: Site ID, name, description, cultural context, source, source date, active status.
2. **Geometry Record**: Geometry, CRS, source document/URL, capture date, reviewer, limitation note, version label, governance state.
3. **Observation Record**: Reporter type, category, factual description, date, timestamp, location, GPS accuracy, privacy consent.
4. **Evidence Record**: Photo ID, upload time, file metadata, MIME type, size, SHA-256 checksum.
5. **Review Event**: Reviewer role, timestamp, action (`SUBMITTED`, `ADDITIONAL_INFO_NEEDED`, `FIELD_VERIFICATION_RECOMMENDED`, `REFERRED_MANUALLY`, `CLOSED_INSUFFICIENT_LOCATION`, `CLOSED_DUPLICATE`, `CLOSED_REVIEWED`), notes, next status.

---

## 8. Four Seeded Evaluator Scenarios

1. **Clearly Inside Source Zone**: Potential zone-related concern.
2. **Clearly Outside**: No spatial concern indicated by this layer.
3. **Near Boundary (Overlap)**: Location uncertain (refusal to overclaim).
4. **Poor GPS Accuracy**: Location evidence insufficient.

---

## 9. Explicit Non-Goals

Do **not** build or claim:
* Nationwide monument coverage in MVP.
* Automatic illegal-construction detection.
* Satellite-AI or drone enforcement.
* 3D reconstruction or digital twin.
* Facial recognition or owner identification.
* Public accusation feed / NOC verification / Police FIR workflow.
* Live ASI/NMA integration or automatic demolition orders.

---

## 10. Repeatable Onboarding Protocol & Scalability

Heritage Pulse scales by onboarding new sites through a 8-check registry protocol:
1. Source-labelled site or zone geometry.
2. Source capture date.
3. Limitation note.
4. Cultural context card.
5. Designated reviewer / review status.
6. Inside, outside, and near-boundary test cases.
7. Published version number.
8. Retirement or correction mechanism.

---

## 11. Final Verdict

> **Heritage Pulse is a protection-first, evidence-continuity product.** Its winning potential comes from discipline: *One site, one geometry, one observation flow, one uncertainty model, one Change Ledger, one reviewer packet.*
