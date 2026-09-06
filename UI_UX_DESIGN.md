# UI/UX DESIGN SPECIFICATION & COMPONENT SYSTEM
## HERITAGE PULSE (हेरिटेज पल्स)
### A Mobile-First Field-Evidence & Change-Ledger Interface
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Team Sinister Six*

---

## 1. Interface Design Philosophy

Heritage Pulse avoids generic consumer tourism styling and bureaucratic government forms. It prioritizes **clarity, solemnity, and evidence integrity**:

* **Color Palette**: Warm Sandstone (`#D97706`), Deep Slate Canvas (`#0F172A`), Terracotta Warning (`#DC2626`), Emerald Verified (`#059669`), Parchment Paper (`#F8FAFC`).
* **Typography**: *Outfit* for modern legible UI headers/buttons, *Inter* for body text, *JetBrains Mono* for coordinates, timestamps, and Case IDs.
* **Mobile-First Touch Ergonomics**: Minimum $48\text{px} \times 48\text{px}$ touch targets, single-handed bottom action bar, outdoor high-contrast support.

---

## 2. Screen-by-Screen Layout Specifications

### Screen 1: Site Context Card (Shivneri Fort Prototype)

```
+--------------------------------------------------------------------+
| [ Logo ] HERITAGE PULSE               [ Shivneri Fort (Active) v ] |
+--------------------------------------------------------------------+
|                                                                    |
|  SITE CONTEXT CARD (Layer 1)                                       |
|  +--------------------------------------------------------------+  |
|  |  SHIVNERI FORT (शिवनेरी किला)                                |  |
|  |  Junnar, Pune District, Maharashtra • 17th Century CE         |  |
|  |                                                              |  |
|  |  "Shivneri Fort is a historic hill fort celebrated as the     |  |
|  |  birthplace of Chhatrapati Shivaji Maharaj. It features      |  |
|  |  monumental stone gateways, water cisterns, and defensive    |  |
|  |  fortifications."                                            |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  SOURCE GEOMETRY PROVENANCE                                        |
|  • Layer: ASI / State Survey Geometry (v1.0-pilot)                 |
|  • Capture Date: November 2023 • CRS: EPSG:4326                    |
|  • Notice: Indicative decision support only. Authority            |
|    verification required.                                          |
|                                                                    |
|  [ + Document Visible Heritage Change ]                            |
+--------------------------------------------------------------------+
```

### Screen 2: Field Capture Studio

```
+--------------------------------------------------------------------+
| < Back                          DOCUMENT VISIBLE CHANGE             |
+--------------------------------------------------------------------+
|                                                                    |
|  GPS SENSOR HUD                                                    |
|  [ ● High Precision: Lat 19.1982, Lon 73.8624 (Accuracy ± 4.5m) ]  |
|                                                                    |
|  STEP 1: OBSERVATION CATEGORY                                      |
|  ( ) Possible Construction     ( ) Possible Encroachment           |
|  ( ) Physical Damage           ( ) Dumping or Waste                |
|  ( ) Blocked Access            ( ) Alteration                      |
|  ( ) Visual Obstruction        ( ) Other Visible Change            |
|                                                                    |
|  STEP 2: PHOTOGRAPH EVIDENCE                                       |
|  +--------------------------------------------------------------+  |
|  |  [ 📷 Capture / Upload Photo ]                               |  |
|  |  Stamps: 2026-09-06 14:30:22 IST • SHA-256 Seal Active        |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  STEP 3: FACTUAL DESCRIPTION                                       |
|  +--------------------------------------------------------------+  |
|  | Describe observed physical condition objectively...         |  |
|  | (Do NOT include names of individuals or legal allegations)   |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  [ Submit Observation to Change Ledger ]                           |
+--------------------------------------------------------------------+
```

### Screen 3: Change Ledger & Spatial Verdict View

```
+--------------------------------------------------------------------+
| CASE #HP-MH-2026-0001                                   [ Export ] |
+--------------------------------------------------------------------+
|                                                                    |
|  SPATIAL REASONING RESULT                                          |
|  +--------------------------------------------------------------+  |
|  | STATUS: POTENTIAL ZONE-RELATED CONCERN                       |  |
|  | • Calculated Distance to Boundary: 0.0m (Inside Sourced Zone) |  |
|  | • Device GPS Accuracy: ± 4.5 meters                          |  |
|  | • Explanation: Point appears within the pilot zone layer.    |  |
|  |   This is not a legal finding; authority verification needed.|  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  CHANGE LEDGER TIMELINE (Append-Only)                              |
|  • 14:30 IST - Case Created by Citizen Observer                    |
|  • 14:30 IST - Location & Photo Captured (±4.5m accuracy)          |
|  • 14:30 IST - Spatial Reasoning Calculated (v1.0 Geometry)        |
|  • 14:31 IST - Status: Submitted for Reviewer Triage              |
|                                                                    |
|  [ View Reviewer Packet ]                [ Back to Site Context ]  |
+--------------------------------------------------------------------+
```

### Screen 4: Reviewer Assessment Console

```
+--------------------------------------------------------------------+
| HERITAGE PULSE • REVIEWER CONSOLE                   [ Role: Reviewer ]|
+--------------------------------------------------------------------+
| FILTER: [ All Cases (4) ] [ Pending Review (2) ] [ Actioned (2) ]   |
+--------------------------------------------------------------------+
|                                                                    |
|  CASE HP-MH-2026-0003                 CASE DETAIL & EVIDENCE       |
|  • Category: Physical Damage          +--------------------------+ |
|  • GPS Accuracy: ± 14.5m              | [ Evidence Photograph ]  | |
|  • Spatial: LOCATION UNCERTAIN        +--------------------------+ |
|  • Status: Submitted for Review       Distance to Boundary: 8.2m |
|                                       GPS Accuracy: ±14.5m (Overlap)|
|  REVIEWER ACTION:                     ---------------------------- |
|  [ Select Action ]                    Reasoning: Accuracy circle   |
|  - Request Additional Information     overlaps boundary.           |
|  - Recommend Field Verification                                    |
|  - Refer Manually                     [ 📄 Download Reviewer Packet ]
|  - Close (Insufficient Location)                                   |
+--------------------------------------------------------------------+
```
