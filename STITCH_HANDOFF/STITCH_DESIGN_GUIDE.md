# Google Stitch Design System & Prompting Guide

## 1. Visual Theme & Philosophy
- **Identity:** High-precision institutional heritage conservation workspace.
- **Aesthetic:** Modern tactical dark mode, subtle glassmorphic elevation, crisp border geometry, and high-visibility status indicators.
- **Key Feeling:** Authoritative, tamper-evident, scientific, and streamlined for rapid on-site inspection as well as high-density desktop triage.

---

## 2. Color Palette & Design Tokens

### 2.1 Base Neutrals (Dark Canvas)
| Token | Hex Value | Usage |
|---|---|---|
| `--bg-canvas` | `#020617` (Slate 950) | Main application body background |
| `--bg-surface-1` | `#0f172a` (Slate 900) | Primary cards, panels, containers |
| `--bg-surface-2` | `#1e293b` (Slate 800) | Inner card wells, inputs, hovered states |
| `--border-subtle` | `#1e293b` (Slate 800) | Standard divider borders |
| `--border-focus` | `#334155` (Slate 700) | Interactive borders, card borders |
| `--text-primary` | `#f8fafc` (Slate 50) | Headers, high-emphasis text |
| `--text-secondary` | `#94a3b8` (Slate 400) | Secondary labels, descriptions |
| `--text-muted` | `#64748b` (Slate 500) | Timestamps, inactive indicators |

### 2.2 Functional Accents & Regulatory Zones
| Token | Hex Value | Meaning / Usage |
|---|---|---|
| `--zone-core` | `#f43f5e` (Rose 500) | **Core Protected Zone (0-100m)**, Critical alerts, Emergency urgency, Rejected cases |
| `--zone-regulated` | `#f59e0b` (Amber 500) | **Regulated Buffer Zone (100-300m)**, Priority triage, Flagged cases, Curator role accent |
| `--zone-survey` | `#10b981` (Emerald 500) | **Observation / Compliant Zone (>300m)**, Approved cases, High GPS lock accuracy |
| `--brand-primary` | `#d97706` (Amber 600) | Primary CTA buttons, active tab highlights |
| `--brand-accent` | `#38bdf8` (Sky 400) | Spatial vectors, distance measurement lines, map pins |

---

## 3. Typography Hierarchy
- **Display & Headings:** `Outfit`, sans-serif (Weights: 600, 700, 800)
  - H1 Page Title: 28px–32px, bold, tracking tight.
  - H2 Section Title: 20px–24px, semibold.
  - H3 Card Title: 16px–18px, semibold.
- **Body & Data:** `Inter` or system sans-serif (Weights: 400, 500)
  - Body Regular: 14px / 1.5 line height.
  - Body Small / Captions: 12px.
- **Monospace (Coordinates, Case IDs, Hashes):** `JetBrains Mono` or `ui-monospace` (Weight: 500, 13px).

---

## 4. Component Anatomy & UI Patterns

### 4.1 Buttons
- **Primary:** Background `bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-amber-900/20 px-5 py-2.5 transition-all`.
- **Secondary / Outline:** Border `border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl px-5 py-2.5`.
- **Danger:** Background `bg-rose-600 hover:bg-rose-500 text-white rounded-xl`.
- **Icon Buttons:** Square 40x40px, rounded-xl, centered icon, subtle slate background.

### 4.2 Status & Zone Badges
- **Pill Shape:** Rounded full or rounded-md with `px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider`.
- **Core Zone Badge:** Red bg tint (`bg-rose-500/10 border border-rose-500/30 text-rose-400`).
- **Regulated Zone Badge:** Amber bg tint (`bg-amber-500/10 border border-amber-500/30 text-amber-400`).
- **Compliant Zone Badge:** Green bg tint (`bg-emerald-500/10 border border-emerald-500/30 text-emerald-400`).

### 4.3 Form Inputs & Dropzones
- **Inputs:** Dark slate background (`bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30`).
- **Photo Dropzone:** Dashed border `border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-900/40 rounded-2xl p-8 text-center cursor-pointer transition-colors`.

### 4.4 Spatial Map Integration
- Vector map style must use dark basemap tokens (`#0f172a` water, `#1e293b` land/roads).
- Center monument marked with distinct monumental icon pin with pulse animation.
- Geodesic radial buffer rings clearly labeled with distance tag (`100m Core Zone`, `300m Regulated Zone`).

---

## 5. Google Stitch AI Prompt Library

Copy and paste these exact prompts into **Google Stitch** to generate or refine specific interface screens:

### Prompt 1: Site Context & Map Command Center
```text
Design a responsive web dashboard screen for "Heritage Plus", an institutional heritage site monitoring platform.
Visual theme: Sleek tactical dark mode (slate-950 background #020617, slate-900 cards #0f172a, subtle slate-800 borders).
Typography: Outfit for headings, Inter for body, JetBrains Mono for coordinates.
Accent colors: Amber (#f59e0b) for active controls, Rose (#f43f5e) for core alerts, Sky (#38bdf8) for spatial vectors.

Top section:
- App navigation bar with logo "Heritage Plus", links [Site Context, Field Capture, Change Ledger, Reviewer Queue], and simulated Curator role badge.
- Page title "Monument Protection & Spatial Context" with monument switcher dropdown (selected: "Taj Mahal Complex, Agra").
- Metrics row with 4 glassmorphic cards: Total Observations (42), Core Zone Violations (3), Pending Curator Triage (7), Statutory Radius (300m).

Main grid (2 columns on desktop):
- Left column (60%): Interactive dark vector map centered on the monument. Display concentric glowing buffer circles: 100m Core Zone (red outline), 300m Regulated Zone (amber outline). Incident pins plotted with category icons. Map controls in top-right corner.
- Right column (40%): Site metadata card showing UNESCO ID, Archeological Circle, Active Protection Mandates, and a scrollable recent observations feed with urgency tags and "Log New Observation" primary amber button.
```

### Prompt 2: Mobile-First Field Capture & Geotagged Intake
```text
Design a mobile-first responsive field capture reporting screen for heritage site rangers.
Theme: High-contrast tactical dark UI (slate-950 #020617, slate-900 #0f172a).
Header:
- Sticky GPS Accuracy Telemetry HUD showing "GPS LOCK: HIGH PRECISION (3.2m accuracy)", with a 4-bar green signal indicator.
Form content (max width 768px centered):
- Monument selector dropdown.
- Observation Category grid: 6 selectable visual tile cards with icons (Unauthorized Construction, Encroachment, Structural Damage, Natural Degradation, Vegetation, Tourism Impact).
- Geolocation Coordinates card: Displays Latitude (27.1751° N) and Longitude (78.0421° E), "Fetch Current Location" GPS button with radar icon, and dynamic calculated pill "Status: Within 300m Regulated Buffer (182m from monument)".
- Drag-and-drop Photo Evidence Dropzone with camera icon, "Tap to capture or upload photos", and mini thumbnail gallery showing uploaded image with simulated EXIF geotag badge.
- Field observation notes textarea with a subtle real-time advisory banner below it checking for statutory terminology.
- Urgency radio selection (Routine, Priority, Critical Emergency).
- Bottom sticky bar: "Clear Form" secondary button and "Submit Observation & Verify Spatial Buffer" prominent amber primary action button.
```

### Prompt 3: Conservation Reviewer Console & Regulatory Triage
```text
Design an institutional desktop triage workspace for heritage conservation curators and reviewers.
Theme: Authoritative dark mode with amber and rose highlights.
Layout: 2-column split console.
Left panel (55%):
- Detailed vector satellite map showing incident pin #CASE-2026-0841 located 72 meters from the monument epicenter.
- Red geodesic measurement vector line drawn from monument to incident pin labeled "72m (Within Statutory 100m Core Protected Zone)".
- High-resolution photographic evidence gallery with zoom magnifier tool and EXIF metadata summary (Timestamp, Device, Raw GPS).
Right panel (45%):
- Case metadata summary header with Case ID, Reporter Name, Submission Time.
- Reviewer Decision Card ("Curator Disposition"):
  - Action selector tabs or radio group: [Approve Notice of Violation, Request Field Re-Inspection, Escalate to Enforcement, Dismiss Case].
  - Curator Justification textarea with placeholder "Enter detailed statutory justification and recommended enforcement protocol...".
  - Regulatory compliance checkbox: "I attest that this spatial verification conforms to the National Monuments Protection statutory boundaries."
  - Action buttons: "Save Draft" and "Finalize Verdict & Issue Audit Dossier" (solid amber button).
```

### Prompt 4: Official Audit Dossier / Printable Reviewer Packet
```text
Design an official heritage protection compliance audit dossier view, optimized for print and PDF generation (A4 aspect ratio preview).
Aesthetic: Official, formal, high-legibility document styling with clean borders, institutional seal emblem, reference numbers, and cryptographic verification hash.
Sections:
1. Header: Official Heritage Protection Directorate title, dossier reference number, date, and "CONFIDENTIAL / STATUTORY COMPLIANCE REPORT" badge.
2. Geographic & Monument Summary: Monument Name, Archeological Circle, Coordinates, Statutory Buffer Classification.
3. Incident Evidence: Field ranger observation description, categorized impact level, and embedded high-contrast photo proof with timestamp watermark.
4. Spatial Verification Report: Exact distance calculation (72.4 meters from epicenter), buffer violation determination table, and coordinate cross-check.
5. Curator Finding: Formal reviewer verdict, curator reasoning notes, digital signature block with curator name and credential ID.
6. Statutory Legal Advisory Notice: Mandatory standard compliance disclaimer at the bottom.
Top toolbar: "Print Document", "Export PDF", and "Back to Queue" buttons.
```
