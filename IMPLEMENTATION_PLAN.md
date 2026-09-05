# DESIGN IMPLEMENTATION PLAN & BUILD SEQUENCE
## HERITAGE GUARD (हेरिटेज गार्ड)
### SIH 2026 Engineering Roadmap, Risk Controls & 120-Second Jury Script
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Team Sinister Six*

---

## 1. Engineering Build Sequence: Evidence-Order Architecture

To avoid feature bloat and ensure that every layer presented to judges is technically defensible, development must strictly follow **Evidence-Order Progression**:

```
+----------------------------------------------------------------------------------------------------+
|                                    EVIDENCE-ORDER BUILD PIPELINE                                   |
+----------------------------------------------------------------------------------------------------+
|  Phase 1: Validated Spatial Data Pack                                                             |
|  └── Curate 1 complete cluster (Chand Baori) with genuine ASI gazette polygons & oral stories.     |
|                                                                                                    |
|  Phase 2: Mathematical Spatial Engine                                                             |
|  └── Build Turf.js + PostGIS point-in-polygon and distance-to-boundary uncertainty evaluator.     |
|                                                                                                    |
|  Phase 3: Heritage Twin Showcase UI                                                               |
|  └── Create rich mobile-first PWA with Sandstone & Indigo theme, vernacular names, and audio.    |
|                                                                                                    |
|  Phase 4: Field Observation Studio with Offline Engine                                            |
|  └── Implement IndexedDB caching, live GPS accuracy meter HUD, and SHA-256 Web Crypto hashing.    |
|                                                                                                    |
|  Phase 5: Curator Safeguarding Console & Dossier Generator                                        |
|  └── Build triage review table, before/after change ledger, and 1-click official PDF export.       |
|                                                                                                    |
|  Phase 6: Rehearsal of the 120-Second SIH Demo Script                                             |
|  └── Rehearse the 4 deterministic test scenarios with zero reliance on live external 3rd-party APIs|
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Risk Controls & Go/No-Go Gates

| Failure Mode / Risk | Engineering Control | Go / No-Go Signal |
|---|---|---|
| **Weak / Inaccurate Geometry** | Pin to a single, officially published ASI Bhuvan polygon; publish data date and limitations explicitly. | **No spatial engine demo** until all 3 boundary polygons render cleanly in Leaflet. |
| **Cultural Overreach / Misrepresentation** | Ingest only public or community-consented living practices; provide explicit consent tags (`PUBLIC`, `WITHHELD`). | Every living practice card must display an explicit consent and custodian source tag. |
| **Defamation & False Accusations** | Enforce objective observation taxonomy; strictly exclude any input fields for accused individuals or guilt. | Zero prohibited accusation fields in database schema and client forms. |
| **Network Blackouts at SIH Venue** | Bundle offline service workers, cached vector tiles, and client-side Turf.js calculations with local seeds. | **120-second demo must operate 100% in Airplane Mode** without network errors. |
| **Feature Sprawl / Tourism Creep** | Maintain focus on the hero chain: *Cultural Context $\to$ Neutral Observation $\to$ Spatial Reasoning $\to$ Audit Dossier*. | Any feature not serving evidence continuity is dropped. |

---

## 3. Four Deterministic Test Scenarios for Evaluators

When presenting to SIH judges, never rely on random GPS coordinates. Provide the jury with 4 pre-seeded, mathematically verifiable test points:

```
+-----------------------------------------------------------------------------------------------------+
|                                    EVALUATOR TEST BENCH MATRIX                                      |
+---+----------------------+------------------------+----------+--------------------------------------+
| # | Scenario             | Coordinates            | Acc (m)  | Expected Deterministic Verdict       |
+---+----------------------+------------------------+----------+--------------------------------------+
| 1 | Strict Prohibited    | 27.0093°N, 76.6062°E   | ± 4.2m   | INSIDE_PROHIBITED_ZONE (100m Buffer) |
|   | (Near Stepwell Core) |                        |          | Distance: 0m. Requires review.       |
+---+----------------------+------------------------+----------+--------------------------------------+
| 2 | Boundary Edge Case   | 27.0105°N, 76.6075°E   | ± 14.5m  | BOUNDARY_UNCERTAIN                   |
|   | (Uncertainty Disk)   |                        |          | Edge distance (8.2m) <= Acc (14.5m). |
+---+----------------------+------------------------+----------+--------------------------------------+
| 3 | Outside Statutory    | 27.0142°N, 76.6110°E   | ± 5.0m   | OUTSIDE_STATUTORY_ZONES              |
|   | Zones (280m away)    |                        |          | Distance: 180m from regulated edge.  |
+---+----------------------+------------------------+----------+--------------------------------------+
| 4 | Degraded GPS Signal  | 27.0093°N, 76.6062°E   | ± 46.0m  | LOC_UNCERTAIN                        |
|   | (Dense Canopy/Walls) |                        |          | Error > 35m scientific threshold.    |
+---+----------------------+------------------------+----------+--------------------------------------+
```

---

## 4. The 120-Second National-Level SIH Demo Script

### Act 1: The Cultural Reality (0:00 – 0:25)
* **Screen**: *Heritage Twin Showcase (`Chand Baori`)*
* **Presenter 1**: *"Respected Judges, India’s heritage is not just stone monuments; it is living practice. Existing apps reduce our heritage to tourist selfie spots. Heritage Guard builds a versioned Digital Twin that connects architectural history with living community stewardship."*
* **Action**: Click the **Living Practice** card; play a 5-second audio snippet of an elder explaining the monsoon water gratitude ritual. Point out the **Community Consented** badge.

### Act 2: Sourced Spatial Truth (0:25 – 0:50)
* **Screen**: *Spatial Truth Boundary Map*
* **Presenter 2**: *"Under the AMASR Act, every monument has a 100-meter Prohibited Zone and a 200-meter Regulated Zone. But standard apps use crude circular pins. Notice our map: we render validated ASI Bhuvan MultiPolygons with explicit gazette provenance, survey dates, and data limitations."*
* **Action**: Pan across the gold monument core, crimson 100m zone, and amber 200m zone. Open the Provenance Drawer.

### Act 3: Offline Capture & The Uncertainty Breakthrough (0:50 – 1:20)
* **Screen**: *Field Observation Studio*
* **Presenter 1**: *"Now, imagine a visitor or student notices displaced masonry in an outer arcade. Notice what our app DOES NOT do: it never asks 'Who did this?' and never accuses anyone of a crime. It captures objective physical condition."*
* **Action**: Tap pre-seeded Scenario 2 (Boundary Edge Case). Show the live GPS Accuracy Meter reading $\pm 14.5\text{m}$. Tap Submit.
* **Presenter 2**: *"Here is our scientific innovation. Because the distance to the boundary line is 8.2 meters and the phone's GPS error is 14.5 meters, our spatial engine REFUSES to issue a false accusation. It flags the case as **Boundary Uncertain**."*
* **Action**: Highlight the 3-Statement Verdict: *What the citizen saw*, *What the GIS computed*, and *What the Competent Authority must verify*.

### Act 4: The Safeguarding Dossier & Institutional Impact (1:20 – 2:00)
* **Screen**: *Curator Safeguarding Console*
* **Presenter 1**: *"In the Curator Console, the Archaeological Survey of India receives an uncorrupted, review-ready packet with raw EXIF telemetry, SHA-256 media seals, and historical change ledger context."*
* **Action**: Click **Export Official Safeguarding Dossier**. Display the generated PDF with its verifiable cryptographic QR code.
* **Presenter 2**: *"Heritage Guard does not replace the authority; it gives them trustworthy evidence before irreversible cultural loss occurs. We preserve the chain between cultural meaning, physical context, and responsible protection. Thank you."*
