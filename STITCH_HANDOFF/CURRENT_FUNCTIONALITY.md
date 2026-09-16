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
     - **Core Protected Zone** (0–100m strict non-development).
     - **Regulated Buffer Zone** (100–300m regulated construction).
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
