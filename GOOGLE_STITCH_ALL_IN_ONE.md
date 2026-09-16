# Heritage Plus - Google Stitch UI/UX Handoff Package

Welcome to the **Google Stitch UI/UX Handoff Package** for Heritage Plus.

This package contains complete, rigorous specifications, design tokens, component hierarchies, and ready-to-use Google Stitch AI prompts so that you or Google Stitch can redesign or elevate the UI/UX while preserving 100% of the underlying business logic, spatial engine calculations, and statutory guardrails.

---

## ðŸ“‚ Package Directory Structure

```
STITCH_HANDOFF/
â”œâ”€â”€ README.md                     <- You are here: Package index & workflow guide
â”œâ”€â”€ CURRENT_FUNCTIONALITY.md      <- Full audit of pages, components, roles & domain logic
â”œâ”€â”€ STITCH_UI_UX_SPEC.md          <- Screen-by-screen layout, state & interaction specs
â”œâ”€â”€ STITCH_DESIGN_GUIDE.md        <- Color tokens, typography, component styling & Stitch AI Prompts
â”œâ”€â”€ screenshots/                  <- Reference UI screenshots & wireframe captures
â””â”€â”€ assets/                       <- Design assets (icons, logo, branding)
    â”œâ”€â”€ icons/
    â”œâ”€â”€ logo/
    â””â”€â”€ fonts/
```

---

## ðŸš€ How to Use this Package with Google Stitch

1. **Review Domain & Functionality First:**
   - Open [`CURRENT_FUNCTIONALITY.md`](./CURRENT_FUNCTIONALITY.md) to understand the dual-persona workflows (Field Ranger vs. Conservation Curator) and spatial calculations (100m Core Zone, 300m Regulated Buffer).

2. **Generate Screens with Google Stitch:**
   - Open [`STITCH_DESIGN_GUIDE.md`](./STITCH_DESIGN_GUIDE.md) and navigate to **Section 5: Google Stitch AI Prompt Library**.
   - Copy the tailored prompt for each screen:
     - **Prompt 1:** Site Context & Map Command Center (`/site`)
     - **Prompt 2:** Mobile-First Field Capture Form (`/capture`)
     - **Prompt 3:** Conservation Reviewer Console (`/reviewer/console`)
     - **Prompt 4:** Printable Reviewer Audit Dossier (`/packet/:caseId`)
   - Paste the prompts directly into Google Stitch.

3. **Verify Component & Interaction States:**
   - Cross-reference with [`STITCH_UI_UX_SPEC.md`](./STITCH_UI_UX_SPEC.md) to ensure all empty states, loading skeletons, banned language linter alerts, and responsive breakpoints are preserved.

4. **Preserve Regulatory Invariants:**
   - Never remove the statutory advisory disclaimer (`src/shared/lib/disclaimer.ts`).
   - Retain the Banned Terminology Linter (`src/shared/lib/bannedLanguage.ts`).
   - Preserve geodesic measurement display in meters (`src/shared/lib/spatialEngine.ts`).
# Heritage Plus - Current Application Functionality & Architecture Audit

## 1. Executive Summary
**Heritage Plus** is an institutional-grade heritage site monitoring, field observation capture, and regulatory change-triage web application. It bridges the gap between field rangers/inspectors conducting ground inspections and institutional conservation reviewers/curators who triage, verify, and document site modifications within legally protected heritage monument buffer zones.

---

## 2. Core Personas & User Journeys

### Persona A: Field Ranger / Field Inspector ("On-Site Capture")
- **Goal:** Rapidly report observed activity, structural degradation, or unauthorized construction near a monument.
- **Workflow:**
  1. Inspect monument and boundary buffer zones on the **Site Context Page** (`/site`).
  2. Navigate to **Field Capture Page** (`/capture`).
  3. Verify GPS lock and accuracy status via the **GPS Accuracy HUD** (<5m high precision, 5-15m medium, >15m caution).
  4. Select or confirm monument site and observation category (Unauthorized Construction, Encroachment, Structural Damage, Natural Degradation, Vegetation Overgrowth, Tourism Footprint).
  5. Enter exact GPS coordinates (manual override or single-click current location).
  6. Upload geotagged photographic evidence with optional metadata extraction.
  7. Provide detailed field notes and urgency rating (Low, Routine, Urgent, Emergency).
  8. Submit case -> Generates unique Case ID (`CASE-XXXX`), persists to `ledgerStore`, and transitions to Spatial Result.

### Persona B: Conservation Reviewer / Heritage Curator ("Institutional Triage")
- **Goal:** Verify field reports against statutory spatial boundaries, determine buffer zone infringement, append regulatory findings, and issue an official audit packet.
- **Workflow:**
  1. Authenticate via simulated role gate (`/reviewer`).
  2. Access **Reviewer Queue** (`/reviewer/queue`) with real-time status badges, urgency flags, and zone tags.
  3. Filter/search cases by status (Submitted, Under Review, Approved, Flagged, Escalated, Rejected), urgency, or zone.
  4. Open **Reviewer Console** (`/reviewer/:caseId` or `/reviewer/console`).
  5. Examine interactive MapLibre map with monument boundaries:
     - **Core Protected Zone** (0â€“100m strict non-development).
     - **Regulated Buffer Zone** (100â€“300m regulated construction).
     - **Survey / Observation Zone** (>300m baseline).
  6. Verify algorithmic spatial calculation (Euclidean & Geodesic Turf.js distance from monument epicenter, buffer violation status).
  7. Formulate verdict using **Reviewer Action Card**:
     - Action selection (Approve, Request Additional Evidence, Flag for On-Site Escalation, Reject).
     - Enter mandatory curator justification notes.
     - Regulatory compliance checkbox confirmation.
  8. Submit verdict -> Automatically appends immutable transition log to `ledgerStore`.
  9. Export/preview official compliance documentation via **Reviewer Packet Preview** (`/packet/:caseId`), including print-ready A4 formatting.

### Persona C: Heritage Administrator / Hackathon Evaluator
- **Goal:** Inspect system transparency, auditability, problem-statement fit, and team execution metrics.
- **Workflow:**
  - Audit historical cases on **Change Ledger** (`/ledger`).
  - View individual case timelines on **Case Detail Page** (`/case/:caseId`).
  - Access **Team Status** (`/team-status`), **Problem Statement Fit** (`/ps-fit`), and **Judge Q&A** (`/judge-qa`).
  - Rapidly switch personas and test-data scenarios via the persistent floating **Demo Quickbar**.

---

## 3. Route & Page Inventory

| Route | Page Component | Role / Purpose | Key UI Components |
|---|---|---|---|
| `/` | Redirects to `/site` | Default landing redirect | - |
| `/site` | `SiteContextPage` | Overview of heritage site, active monuments, buffer radii, and quick metrics | `SiteContextCard`, `MapLibreView`, monument selector, active zone indicators |
| `/capture` | `FieldCapturePage` | Field observation and evidence reporting form | `GpsAccuracyHud`, `PhotoDropzone`, `CategorySelector`, coordinates input, urgency select |
| `/result` & `/result/:caseId` | `SpatialResultPage` | Spatial analysis and geodesic buffer evaluation | `MapLibreView`, zone badge, distance meter, case metadata card |
| `/ledger` | `ChangeLedgerPage` | Global immutable case audit trail & chronological timeline | Filter bar, status chips, search input, case cards, `EmptyState` |
| `/case/:caseId` | `CaseDetailPage` | Deep-dive case audit view with full history and photo proof | `LedgerTimeline`, photo viewer, coordinates summary, reviewer findings |
| `/reviewer` | `ReviewerRoleGate` -> `ReviewerQueuePage` | Triage queue for institutional curators | Role-gate modal, queue table/cards, priority badges, action triggers |
| `/reviewer/queue` | `ReviewerQueuePage` | Triage queue with multi-filter and sort | Case list, status filters, urgency markers, quick-action buttons |
| `/reviewer/console` & `/reviewer/:caseId` | `ReviewerConsolePage` | Primary triage workspace for curator decision-making | Split map/data view, `ReviewerActionCard`, compliance checklist |
| `/packet/:caseId` | `ReviewerPacketPreview` | Formal institutional audit dossier / PDF preview | Printable A4 layout, official stamp, legal disclaimer, signature block |
| `/team-status` | `TeamStatusPage` | Project delivery, architectural health, and sprint completion | Progress meters, milestone breakdown, architecture matrix |
| `/ps-fit` | `PsFitPage` | Alignment with national heritage preservation criteria | Compliance grid, impact metrics, requirement traceability |
| `/judge-qa` | `JudgeQaPage` | Evaluator FAQs, technical architecture, and spatial engine notes | Collapsible accordion FAQ, architecture callouts, system benchmarks |

---

## 4. Shared Components Architecture

1. **`Navbar` (`src/shared/components/Navbar.tsx`)**:
   - Header with brand insignia, navigation pills (`Site Context`, `Capture`, `Ledger`, `Reviewer Queue`), simulated role switcher, and mobile hamburger drawer.
2. **`Footer` (`src/shared/components/Footer.tsx`)**:
   - Statutory compliance disclaimers, system version, copyright, and quick route directory.
3. **`DemoQuickbar` (`src/shared/components/DemoQuickbar.tsx`)**:
   - Persistent bottom dock providing instantaneous navigation, mock data seeding, preset scenario switching (e.g. "Taj Buffer Encroachment", "Hampi Stone Damage"), and reviewer role toggle.
4. **`MapLibreView` (`src/shared/components/MapLibreView.tsx`)**:
   - High-performance vector map renderer with dynamic monument markers, multi-ring buffer zones (100m core in red, 300m regulated in amber), case pinpoints, and interactive layer controls.
5. **`PhotoDropzone` (`src/shared/components/PhotoDropzone.tsx`)**:
   - Drag-and-drop evidence uploader with image preview, EXIF GPS coordinate extraction simulation, and file validation.
6. **`GpsAccuracyHud` (`src/features/field-capture/GpsAccuracyHud.tsx`)**:
   - Real-time geolocation telemetry monitor showing horizontal accuracy in meters, satellite lock status, and color-coded reliability bars.
7. **`LedgerTimeline` (`src/shared/components/LedgerTimeline.tsx`)**:
   - Vertical chronological timeline with timestamped event nodes (Submission, Triage, Zone Verification, Final Disposition) with cryptographic hash markers.
8. **`EmptyState` (`src/shared/components/EmptyState.tsx`)**:
   - Clean state fallback with icon, descriptive copy, and contextual call-to-action button.
9. **`NoticeBanner` (`src/shared/components/NoticeBanner.tsx`)**:
   - Contextual alerts for compliance mandates, demo limitations, and high-urgency notifications.

---

## 5. Domain Logic & Regulatory Guardrails

1. **Banned Terminology Enforcer (`src/shared/lib/bannedLanguage.ts`)**:
   - Prevents use of unverified, legally hazardous language (e.g. labeling an observation "Illegal Demolition" before judicial review; forces "Alleged Unauthorized Activity").
2. **Statutory Legal Disclaimer (`src/shared/lib/disclaimer.ts`)**:
   - Ensures all generated reports and preview packets bear the official disclaimer: *Observations and spatial determinations are advisory triage assessments for heritage preservation authorities and do not constitute a judicial ruling.*
3. **Spatial Buffer Calculation Engine (`src/shared/lib/spatialEngine.ts`)**:
   - Uses `@turf/turf` to compute geodesic distance from monument center to observation coordinates.
   - Categorizes point:
     - `CORE_PROTECTED` (< 100 meters)
     - `REGULATED_BUFFER` (100 to 300 meters)
     - `OUTSIDE_BUFFER` (> 300 meters)
4. **Case State Machine**:
   - `SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED` | `FLAGGED_ESCALATED` | `REJECTED`
# Google Stitch UI/UX Screen Specification

## Overview & Stitch Instructions
This specification provides exhaustive screen-by-screen architectural directives for **Google Stitch** to redesign the Heritage Plus application. All designs must adhere to an institutional, high-precision dark aesthetic with clear information hierarchy, high contrast, and tactile feedback.

---

## Screen 1: Site Context & Monument Overview (`/site`)

### 1.1 Purpose
The command center dashboard where rangers and curators select an active monument, view statutory protection zones, and monitor live observation tallies.

### 1.2 Layout & Grid Hierarchy
- **Header Section:**
  - Page title: "Heritage Site & Monument Context" with subtitle and live telemetry timestamp.
  - Monument Selector Dropdown (e.g. Taj Mahal Complex, Red Fort, Hampi Virupaksha Temple, Sun Temple Konark).
  - Stat counters row (4 cards): Total Observations, Active Violations in Core Zone, Pending Triage, Protected Radius (300m).
- **Primary Content Grid (2 Columns on Desktop, 1 Column on Mobile):**
  - **Left / Main Column (60% width):** Interactive `MapLibreView` displaying:
    - Monument epicenter pin with glowing radar beacon.
    - 100m Core Protected Zone circle (red stroke `#f43f5e`, fill opacity 15%).
    - 300m Regulated Buffer Zone circle (amber stroke `#f59e0b`, fill opacity 10%).
    - Interactive layer toggles (Satellite, Terrain, High-Contrast Grayscale, Observation Pins).
  - **Right Column (40% width):** `SiteContextCard`:
    - Monument official designation metadata (UNESCO ID, State, Archeological Survey Circle).
    - Statutory zoning breakdown card.
    - Recent incident micro-feed with quick navigation links.

### 1.3 Interactive Elements
- Monument switch dropdown -> Dynamically pans/zooms map and refreshes stats.
- Map layer switch buttons (Satellite vs Vector Dark).
- "Log New Observation" primary action button (navigates to `/capture` with pre-filled monument ID).

### 1.4 States
- **Loading:** Shimmer skeleton for map and metric cards (`LoadingSkeleton`).
- **Empty:** If monument has no logged cases, show subtle placeholder: "No active incidents recorded within the statutory buffer."

---

## Screen 2: Field Capture & Evidence Intake (`/capture`)

### 2.1 Purpose
Mobile-first field reporting form utilized by rangers on ground patrol to record observations, capture photographic evidence, and verify GPS lock.

### 2.2 Layout & Grid Hierarchy
- **Top Bar / Sticky Telemetry:**
  - `GpsAccuracyHud`: Real-time satellite status pill (`Locked - 3.2m accuracy`, color: emerald). If accuracy is poor (>15m), amber warning banner appears with instructions to move to open sky.
- **Form Container (Single Column, Max-width 768px centered):**
  - **Section 1: Site & Category Selection:**
    - Monument select dropdown.
    - Observation category grid (`CategorySelector`): 6 visual tile buttons with icons (Unauthorized Construction, Encroachment, Structural Damage, Natural Degradation, Vegetation Overgrowth, Tourism Footprint).
  - **Section 2: Geolocation Coordinates:**
    - Latitude & Longitude inputs (read-only by default when auto-locked, toggleable "Manual Override" switch).
    - "Fetch Current GPS Location" button with pulsating pulse animation during acquisition.
    - Geodesic calculated zone preview pill (`Calculating...` -> `Within Regulated Buffer (184m from epicenter)`).
  - **Section 3: Photographic Evidence:**
    - `PhotoDropzone`: Drag & drop area with camera icon. Supports direct file select or camera capture on mobile.
    - Thumbnail preview list with file size, remove button, and simulated EXIF location badge.
  - **Section 4: Field Observation Narrative:**
    - Textarea for detailed description.
    - Real-time **Banned Terminology Linting Alert** if user types legally non-permitted terms (e.g. "criminal", "illegal encroacher" -> prompts "alleged unauthorized structure").
    - Urgency selector (Radio pills: Routine, Priority, Urgent Emergency).
  - **Section 5: Submission Actions:**
    - Sticky bottom action bar: "Clear Form" secondary button + "Submit Observation & Verify Spatial Buffer" primary button.

### 2.3 Interactive Elements & Micro-animations
- Dynamic zone calculation indicator appears as soon as coordinates are populated.
- Image upload shows progressive progress bar and generates miniature preview with delete hover icon.
- Form validation blocks submission until category, valid coordinates, and description (>20 chars) are present.

---

## Screen 3: Spatial Result & Buffer Determination (`/result` & `/result/:caseId`)

### 3.1 Purpose
Post-submission immediate assessment view displaying algorithmic spatial analysis, proximity measurements, and legal buffer classification.

### 3.2 Layout & Grid Hierarchy
- **Top Summary Banner:**
  - Case ID badge (`CASE-2026-0841`), timestamp, and determination banner:
    - Red Banner: `CRITICAL: Observation located within Core Protected Zone (64m from monument)`.
    - Amber Banner: `WARNING: Observation located within Regulated Buffer Zone (210m from monument)`.
    - Emerald Banner: `NOTICE: Observation outside regulated statutory perimeter (380m)`.
- **Main Layout (Split-Screen / 2 Column):**
  - **Left Column:** High-detail vector map showing:
    - Direct geodesic measurement vector line (dashed connecting monument center to incident coordinates with distance label in meters).
    - Buffer zones overlay.
  - **Right Column:** Case Assessment Card:
    - Observation metadata table (Reporter ID, Timestamp, Category, Coordinates).
    - Photo evidence preview modal trigger.
    - Actions row: "Submit to Reviewer Queue", "Print Immediate Field Slip", "Return to Field Capture".

---

## Screen 4: Change Ledger & Case Audit Trail (`/ledger`)

### 4.1 Purpose
Global, tamper-evident audit repository of all submitted heritage incident cases, chronological transitions, and curator dispositions.

### 4.2 Layout & Grid Hierarchy
- **Header & Metrics:**
  - Header: "Heritage Protection Change Ledger" + total case count.
  - Filter & Search Toolbar:
    - Text search input (search by Case ID, Monument, Reporter, Keyword).
    - Status Filter Pills: All, Submitted, Under Review, Approved, Flagged, Escalated, Rejected.
    - Urgency Filter Dropdown: All, Routine, Urgent, Emergency.
    - Zone Filter: All, Core Protected, Regulated Buffer, External.
    - Sort Dropdown: Newest First, Oldest First, Proximity to Epicenter.
- **Case Listing Table / Card Feed:**
  - Responsive table on desktop; cards on mobile:
    - Columns: Case ID, Monument Site, Category, Distance & Zone Badge, Urgency, Status Pill, Submission Date, Actions ("View Details").
- **Pagination / Infinite Scroll Footer.**

### 4.3 Empty & Error States
- `EmptyState`: Shown when filters return 0 results. Icon: `ShieldAlert`, Message: "No cases match your active filter criteria", CTA: "Reset Filters".

---

## Screen 5: Case Detail & Audit History (`/case/:caseId`)

### 5.1 Purpose
Deep-dive view into an individual case, showcasing full evidence, reviewer notes, and immutable timeline history.

### 5.2 Layout & Grid Hierarchy
- **Header:** Back link to Ledger, Case ID, Monument Name, Current Status Badge.
- **2-Column Layout:**
  - **Left Column (Case Evidence & Attributes):**
    - High-res photo gallery with zoom modal.
    - GPS coordinate map snippet with geodesic distance.
    - Field notes & reporter credentials.
    - Statutory legal disclaimer box.
  - **Right Column (Audit Timeline):**
    - `LedgerTimeline`: Vertical sequence of chronological events:
      1. Case logged by field ranger (timestamp + signature hash).
      2. Automated spatial engine determination.
      3. Curator assignment & review initiation.
      4. Reviewer verdict & justification notes.

---

## Screen 6: Reviewer Queue & Triage Gate (`/reviewer` & `/reviewer/queue`)

### 6.1 Purpose
Work queue for institutional conservation reviewers to evaluate pending field observations in order of urgency and buffer severity.

### 6.2 Layout & Components
- **Role Gate (if unauthenticated):**
  - Modal card with `ShieldCheck` icon: "Reviewer Queue Access Gate".
  - One-click "Enter as: Simulated Reviewer" button.
- **Queue Interface:**
  - Queue Header with pending triage count badge.
  - Priority triage tabs: `All Cases`, `Core Violations (Urgent)`, `Regulated Buffer`, `Resolved`.
  - Queue cards displaying: Case ID, Monument, Time elapsed (e.g. `2 hours ago`), Distance to monument, Category icon, Urgency indicator, and "Open Reviewer Console" primary button.

---

## Screen 7: Reviewer Console & Verdict Form (`/reviewer/console` & `/reviewer/:caseId`)

### 7.1 Purpose
The primary working console where a curator makes formal regulatory decisions on a case.

### 7.2 Layout & Components
- **Top Split:**
  - Left: Interactive spatial map with measurement tool and buffer rings.
  - Right: Case evidence details, photo viewer, reporter notes.
- **Bottom / Right Action Deck (`ReviewerActionCard`):**
  - Decision Radio Group:
    - `Approve Case & Issue Citation Notice`
    - `Flag for On-Site Ranger Re-Inspection`
    - `Escalate to Archeological Enforcement Directorate`
    - `Dismiss / Inconclusive Evidence`
  - Curator Justification Textarea (Mandatory, minimum 30 characters).
  - Legal Acknowledgement Checkbox: "I confirm that this determination aligns with the Ancient Monuments and Archaeological Sites and Remains Act statutory guidelines."
  - Action Buttons: "Save Draft" & "Finalize & Sign Verdict".

---

## Screen 8: Official Reviewer Packet Dossier (`/packet/:caseId`)

### 8.1 Purpose
Official institutional audit dossier generated for enforcement officers, court submissions, or archival records. Print-optimized for A4 paper.

### 8.2 Layout & Print Architecture
- **Header:** Institutional emblem, document reference number, date of generation, classification marker ("OFFICIAL HERITAGE AUDIT REPORT").
- **Section 1: Monument Identification & Geographic Registry:** Coordinates, Circle, Buffer status.
- **Section 2: Incident Summary & Categorization.**
- **Section 3: Photographic Evidence & EXIF Registry.**
- **Section 4: Spatial Distance Verification Data.**
- **Section 5: Curator Finding & Regulatory Verdict:** Full curator notes, reviewer digital signature block, timestamp.
- **Section 6: Statutory Disclaimer:** Full legal advisory notice.
- **Actions:** "Download PDF", "Print Document", "Return to Console". Uses `@media print` CSS rules to strip navigation bars and format cleanly on standard paper.

---

## Screen 9: Team Status & Sprint Delivery (`/team-status`)
- Visual dashboard showcasing delivery progress, feature completion percentages, architecture components, and milestone tracking for evaluators.

---

## Screen 10: Problem Statement Fit (`/ps-fit`)
- Matrix mapping the application's capabilities directly to national heritage preservation challenges, technical innovation, and civic impact metrics.

---

## Screen 11: Judge & Evaluator Q&A Guide (`/judge-qa`)
- Comprehensive interactive FAQ accordion addressing spatial accuracy, offline tolerance, data sovereignty, tamper resistance, and scale.
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
  - H1 Page Title: 28pxâ€“32px, bold, tracking tight.
  - H2 Section Title: 20pxâ€“24px, semibold.
  - H3 Card Title: 16pxâ€“18px, semibold.
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
- Geolocation Coordinates card: Displays Latitude (27.1751Â° N) and Longitude (78.0421Â° E), "Fetch Current Location" GPS button with radar icon, and dynamic calculated pill "Status: Within 300m Regulated Buffer (182m from monument)".
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
