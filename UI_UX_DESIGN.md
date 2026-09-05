# UI/UX DESIGN SPECIFICATION & DESIGN SYSTEM
## HERITAGE GUARD (हेरिटेज गार्ड)
### A Living Heritage Intelligence & Safeguarding Interface
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Team Sinister Six*

---

## 1. Design Philosophy: Heritage Dignity Meets Scientific Rigor

Most civic or government applications look utilitarian, bureaucratic, and dated, while modern commercial travel apps look generic, prioritizing flashy animations over cultural solemnity. 

**Heritage Guard** strikes a curated balance:
* **The Cultural Warmth**: Rich Indian architectural textures, warm sandstone hues, stone inscriptions, and vernacular typography.
* **The Scientific Precision**: Crisp geospatial telemetry, clean coordinate pills, SVG boundary overlays, and cryptographic verification badges.

```
+----------------------------------------------------------------------------------------------------+
|                                    COLOR TOKEN ARCHITECTURE                                        |
+----------------------+-----------+-------------------------+---------------------------------------+
| Token Name           | Hex       | Tailwind Equivalent     | Interface Application                 |
+----------------------+-----------+-------------------------+---------------------------------------+
| `--stone-950` (Dark) | `#0B0F19` | `bg-slate-950`          | Primary Canvas / Immersive Background |
| `--stone-900` (Card) | `#131B2E` | `bg-slate-900/90`       | Glassmorphic card surfaces            |
| `--ochre-500`        | `#D97706` | `text-amber-600`        | Cultural accents, monument core lines |
| `--terracotta-600`   | `#DC2626` | `text-red-600`          | 100m Prohibited Zone, urgent notices  |
| `--brass-500`        | `#F59E0B` | `text-amber-500`        | 200m Regulated Zone, uncertainty pills|
| `--temple-500`       | `#059669` | `text-emerald-600`      | Consented Living Practices, verified  |
| `--parchment-100`    | `#F8FAFC` | `text-slate-100`        | Primary typography, dossier paper     |
| `--parchment-400`    | `#94A3B8` | `text-slate-400`        | Secondary labels, coordinates, dates  |
+----------------------+-----------+-------------------------+---------------------------------------+
```

### Typography System:
1. **Brand & Monument Titles**: *Cinzel Decorative* / *Rozha One*
   * Evokes stone-cut temple inscriptions and national heritage weight.
2. **UI Labels, Navigation & Buttons**: *Plus Jakarta Sans* / *Outfit*
   * Ultra-legible geometric sans-serif optimized for mobile touch targets.
3. **Telemetry, Lat/Lon & Checksums**: *JetBrains Mono* / *Fira Code*
   * Monospace numerals preventing layout jitter during real-time GPS updates.

---

## 2. Micro-Interactions & Core Component Specs

### 2.1 The Dynamic GPS Accuracy Meter (`GpsAccuracyMeter.jsx`)
Appears at the top of the Field Observation screen. Communicates real-world sensor precision without confusing jargon:
* **State A ($\le 10\text{m}$)**: Emerald border with pulsing green dot. Label: `High Precision (±4.2m) • Validated for SMR Survey`.
* **State B ($10.1\text{m} - 35\text{m}$)**: Amber border. Label: `Moderate Precision (±18.5m) • Proximity will compute with buffer`.
* **State C ($> 35\text{m}$)**: Rose border with warning icon. Label: `Low Precision (±48.0m) • Move away from tall walls for sky view`.

### 2.2 The Three-Tier Truth Verdict Modal
Renders when an observation is submitted, reinforcing the ethical separation between crowdsourced reporting, geospatial math, and official legal authority:

```
+--------------------------------------------------------------------+
|                      SPATIAL VERDICT SUMMARY                       |
|   Case Tracking ID: HG-RAJ-2026-0042 • Timestamp: 14:32 IST         |
+--------------------------------------------------------------------+
|                                                                    |
|  [1] WHAT WAS OBSERVED (Citizen Documentation)                     |
|  "Displaced sandstone lintel with deep horizontal fracture."       |
|                                                                    |
|  [2] WHAT SPATIAL ENGINE COMPUTED (Sourced Geospatial Polygon)     |
|  Status: POTENTIAL PROHIBITED ZONE CONCERN (100m Buffer)          |
|  • Distance from Monument Edge: 42.4 meters                        |
|  • Device Accuracy Tolerance: ± 6.2 meters                         |
|  • Sourced Boundary: ASI Bhuvan Registry SO 1928 (Nov 2022)       |
|                                                                    |
|  [3] ADMINISTRATIVE NOTICE (Institutional Safeguard)               |
|  Heritage Guard provides evidence continuity, not legal verdicts.  |
|  This record is queued for competent authority conservation review.|
|                                                                    |
+--------------------------------------------------------------------+
|       [ Done / View in Ledger ]         [ Share Evidence Card ]    |
+--------------------------------------------------------------------+
```

### 2.3 The Offline Queue Sync Pill (`OfflineSyncPill.jsx`)
A floating pill in the application navbar:
* **Online**: Solid green indicator `● All Systems Synced`.
* **Offline with Drafts**: Amber pill `▲ Offline • 2 observations stored in device secure vault`.
* **Syncing**: Rotating icon `◌ Syncing evidence packets to national registry...`.

---

## 3. Screen-by-Screen UX Wireframes & Specifications

### Screen 1: The Living Heritage Twin Showcase (Hero View)

```
+--------------------------------------------------------------------+
| [ Logo ] HERITAGE GUARD      [ Living View | Continuity View ] (⚙) |
+--------------------------------------------------------------------+
|                                                                    |
|  चाँद बावड़ी • CHAND BAORI STEPWELL                                |
|  Abhaneri, Dausa District, Rajasthan • 8th–9th Century CE          |
|  [ ASI Centrally Protected ] [ National Monument Code: RJ-042 ]   |
|                                                                    |
|  +--------------------------------------------------------------+  |
|  | [ HERO MEDIA: High-res architectural photography / 3D model] |  |
|  | "One of the oldest and deepest stepwells in the world, with   |  |
|  | 3,500 narrow steps over 13 stories, engineered for water    |  |
|  | harvesting and community congregation."                       |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  LIVING CULTURAL PRACTICES (Intangible Layer 2)                   |
|  +---------------------------+  +-------------------------------+  |
|  | Harshat Mata Jal Vandana  |  | Abhaneri Terracotta Craft     |  |
|  | Ritual • Monsoon Season   |  | Craft Guild • Consented       |  |
|  | Local community prayers   |  | Traditional water vessel      |  |
|  | for groundwater renewal.  |  | pottery lineage.              |  |
|  | [▶ Listen: Elder Narr.]   |  | [View Community Context]      |  |
|  +---------------------------+  +-------------------------------+  |
|                                                                    |
|  [ + Document Field Condition ]      [ Explore Spatial Boundaries ]|
+--------------------------------------------------------------------+
```

### Screen 2: Spatial Truth & Boundary Explorer (GIS View)

```
+--------------------------------------------------------------------+
| < Back to Showcase          SPATIAL TRUTH EXPLORER       [ Layers ≡ ]
+--------------------------------------------------------------------+
|                                                                    |
|  MAP CANVAS (Leaflet / MapLibre GL)                                |
|  +--------------------------------------------------------------+  |
|  |                                                              |  |
|  |                 /=========\ (200m Regulated Zone)           |  |
|  |               /   /-----\   \                               |  |
|  |              |   | [CORE]|   | (100m Prohibited Zone)        |  |
|  |               \   \-----/   /                               |  |
|  |                 \=========/                                 |  |
|  |                         * Observation Point [±6.5m error]   |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  PROVENANCE & BOUNDARY METADATA                                    |
|  • Source: ASI Bhuvan NRSC Spatial Layer (Notification SO 1928)    |
|  • Publication Date: 14 November 2022 • Confidence: 94%            |
|  • Limitation Note: Eastern boundary subject to canal realignment.  |
|                                                                    |
|  TEST BENCH SCENARIOS (For Evaluator Demonstration):               |
|  [ Inside 100m ]   [ Boundary Edge Case ]   [ Outside Buffer ]     |
+--------------------------------------------------------------------+
```

### Screen 3: Field Observation Studio (Neutral Capture)

```
+--------------------------------------------------------------------+
| Cancel                 DOCUMENT FIELD CONDITION         Save Draft |
+--------------------------------------------------------------------+
|                                                                    |
|  [ GPS HUD: High Precision • Lat: 27.0093, Lon: 76.6062 (± 4.2m) ] |
|                                                                    |
|  STEP 1: SELECT CONCERN CATEGORY                                   |
|  [ Masonry Displacement ]  [ Moisture Infiltration ]  [ Debris ]   |
|  [ Vegetation Overgrowth ] [ Structural Cracking ]   [ Access ]   |
|                                                                    |
|  STEP 2: PHOTOGRAPHIC EVIDENCE                                     |
|  +--------------------------------------------------------------+  |
|  |                                                              |  |
|  |    [ 📷 Tap to Capture Photo ]                                |  |
|  |    EXIF hardware timestamp & GPS automatically stamped.       |  |
|  |    Client-side SHA-256 seal generated on device.              |  |
|  |                                                              |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  STEP 3: NEUTRAL OBSERVATION NOTES                                 |
|  +--------------------------------------------------------------+  |
|  | Describe observed physical condition objectively...         |  |
|  | (Avoid names of individuals or accusations of guilt)         |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
|  [ Submit for Spatial Verification ]                               |
+--------------------------------------------------------------------+
```

### Screen 4: Curator Safeguarding Console & Dossier Inspector

```
+--------------------------------------------------------------------+
| HERITAGE GUARD • CONSERVATION CURATOR CONSOLE         [ Dr. V. Sundaram ]
+--------------------------------------------------------------------+
| INBOX (4 Pending) | VERIFIED LEDGER (38) | REFERRED TO ASI (12)    |
+--------------------------------------------------------------------+
|                                                                    |
|  CASE HG-RAJ-2026-0042                EVIDENCE DOSSIER PREVIEW     |
|  • Cluster: Chand Baori Stepwell      +--------------------------+ |
|  • Category: Masonry Displacement     | [ High-Res Evidence Pic ]| |
|  • Distance: 42.4m from core wall     | SHA-256: 4b6118d09880... | |
|  • Status: Potential 100m Prohibited  | EXIF: Nikon Z6 / 14:32   | |
|                                       +--------------------------+ |
|  AUDIT TRAIL:                         SPATIAL MAP CONFIRMATION:    |
|  14:32 - Captured by Citizen (±6m)    • 100m Buffer: OVERLAPPING   |
|  14:33 - Sourced Layer v2022 verified • Prohibited Distance: 42m   |
|                                                                    |
|  CURATOR ACTION:                                                   |
|  [ Request More Info ]  [ Mark Cataloged ]  [ Refer to ASI / DM ]  |
|                                                                    |
|  [ 📄 Download Official Signed Safeguarding Dossier (PDF/JSON-LD) ]|
+--------------------------------------------------------------------+
```

---

## 4. Mobile Responsiveness & Touch Ergonomics

* **Bottom Navigation Sheet**: On mobile viewports ($< 768\text{px}$), maps occupy 100% of the screen with a collapsible swipeable bottom drawer for metadata.
* **Touch Targets**: All interactive buttons, category chips, and map toggles feature minimum hit areas of $48\text{px} \times 48\text{px}$.
* **Low-Vision High-Contrast Mode**: Built-in toggle supporting high-contrast ambient sunlight conditions in outdoor field archaeology.
