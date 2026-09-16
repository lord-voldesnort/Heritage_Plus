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
