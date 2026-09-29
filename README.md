# 🏛️ Heritage Pulse

### हेरिटेज पल्स

<p align="center">
  <strong>A Provenance-Aware, Uncertainty-Driven Change Ledger for Community-Sourced Safeguarding of India's Protected Heritage Sites</strong>
</p>

<p align="center">
  <a href="https://github.com/lord-voldesnort/Heritage_Plus/releases/latest/download/HeritagePulse.apk">
    <img src="https://img.shields.io/badge/⬇%20DOWNLOAD%20APK-ANDROID%20APP-2ea44f?style=for-the-badge&logo=android&logoColor=white" alt="Download Heritage Pulse APK">
  </a>
</p>

<p align="center">
  <a href="https://github.com/lord-voldesnort/Heritage_Plus/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/lord-voldesnort/Heritage_Plus/android-build.yml?branch=main&label=Android%20Build&logo=github" alt="Android Build">
  </a>
  <a href="https://github.com/lord-voldesnort/Heritage_Plus/releases">
    <img src="https://img.shields.io/github/v/release/lord-voldesnort/Heritage_Plus?label=Latest%20Release&logo=github" alt="Latest Release">
  </a>
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?logo=android&logoColor=white" alt="Android">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Maps-MapLibre-396CB2" alt="MapLibre">
  <img src="https://img.shields.io/badge/Capacitor-Android-119EFF?logo=capacitor&logoColor=white" alt="Capacitor">
  <img src="https://img.shields.io/badge/Research-Provenance%20%26%20Uncertainty-6f42c1" alt="Research">
</p>

<p align="center">
  <strong>Smart India Hackathon 2026</strong><br>
  Theme: <strong>Heritage & Culture</strong><br>
  Problem Statement: <strong>PS 26197</strong><br>
  Team: <strong>Sinister Six</strong>
</p>

<p align="center">
  <strong>Prototype Site:</strong> Shivneri Fort, Junnar, Pune District, Maharashtra, India
</p>

---

# 🌍 Overview

**Heritage Pulse** is a provenance-aware, uncertainty-driven heritage intelligence platform designed for community-supported monitoring and safeguarding of protected cultural heritage.

The platform transforms observations, photographs, geospatial information, environmental signals, remote-sensing evidence, and expert review into a structured **Change Ledger**.

Instead of simply storing reports, Heritage Pulse preserves the context surrounding each observation:

- What was observed
- Where it was observed
- When it was observed
- Who submitted it
- What evidence supports it
- What map/source version was used
- What location uncertainty exists
- What processing was performed
- What model/version generated an inference
- What confidence or uncertainty was associated with the inference
- Whether a reviewer verified or rejected the observation
- What changed over time

The objective is to create a transparent evidence chain that can support:

- Heritage conservation
- GIS research
- Archaeological documentation
- Remote-sensing studies
- Citizen science
- Environmental monitoring
- Disaster-risk assessment
- Academic research
- Government and NGO collaboration
- Field surveys
- Heritage policy research

---

# 🎯 Problem Statement

Heritage sites are exposed to multiple forms of degradation and environmental pressure.

Examples include:

- Structural deterioration
- Cracks and wall damage
- Roof deterioration
- Vegetation intrusion
- Water-related damage
- Encroachment
- Waste accumulation
- Erosion
- Environmental change
- Unauthorized modification
- Disaster impacts
- Human pressure
- Climate-related risks

However, heritage observations are often fragmented across:

- Photographs
- Field notebooks
- Social media
- Government records
- GIS layers
- Remote-sensing datasets
- Individual reports
- Surveys
- Research papers

This makes longitudinal analysis difficult.

A photograph without reliable location, timestamp, provenance, uncertainty, or review context provides limited scientific value.

Heritage Pulse addresses this problem by creating a structured, provenance-aware record of heritage observations.

---

# 💡 Core Innovation — Change Ledger

The central innovation of Heritage Pulse is the **Change Ledger**.

Every observation becomes part of a structured historical evidence record.

### Example

Instead of storing:

> "Wall damaged."

Heritage Pulse can preserve:

```text
Observation ID:
HP-SHF-2026-000184

Site:
Shivneri Fort

Observation:
Possible masonry deterioration

Observed:
2026-08-14 10:32 IST

Location:
18.xxxxx, 73.xxxxx

Location uncertainty:
±8 meters

Evidence:
3 photographs

Source:
Community field observation

Map source:
OpenStreetMap

Processing:
Image preprocessing v1.x

AI inference:
Potential masonry damage

Model:
HeritageCV v0.x

Confidence:
0.xx

Status:
Requires expert verification

Reviewer action:
Pending
```

The system therefore preserves not only the result, but also the **evidence and uncertainty surrounding the result**.

---

# 🔬 Why the Change Ledger Matters

A conventional reporting system may answer:

> "What was reported?"

Heritage Pulse aims to additionally answer:

> "What was observed, where, when, using what evidence, under what uncertainty, processed using which methodology, and what happened during review?"

This creates a stronger foundation for longitudinal heritage research.

---

# 🚫 What Heritage Pulse Is NOT

Heritage Pulse is intentionally different from several common application categories.

It is **not primarily**:

- ❌ A tourism application
- ❌ A social-media platform
- ❌ A generic complaint portal
- ❌ A 3D reconstruction platform
- ❌ A digital-twin marketing application
- ❌ An automatic encroachment detector
- ❌ A generic map application
- ❌ A simple image-upload application

Its primary purpose is:

> **Evidence-based, provenance-aware, uncertainty-aware heritage change monitoring.**

---

# 👥 Intended Users

Heritage Pulse can support multiple user groups.

### Public / Visitors

- Submit observations
- Capture photographs
- View heritage information
- Explore verified observations

### Residents

- Report local heritage changes
- Contribute field evidence
- Participate in community monitoring

### Students

- Conduct field studies
- Learn GIS
- Participate in citizen science
- Build research datasets

### Volunteers

- Conduct structured surveys
- Collect observations
- Support monitoring campaigns

### Heritage Researchers

- Analyse temporal changes
- Study environmental relationships
- Export research datasets
- Compare observations

### Heritage Experts

- Review observations
- Validate evidence
- Provide expert assessment

### Reviewers

- Moderate submissions
- Verify evidence
- Track review history

### Administrators

- Manage users
- Configure workflows
- Monitor system health
- Maintain operational infrastructure

---

# 🏰 Initial Prototype — Shivneri Fort

The initial Heritage Pulse prototype focuses on:

**Shivneri Fort, Junnar, Pune District, Maharashtra, India.**

The architecture is designed so that the platform can eventually support additional protected heritage sites without requiring a complete redesign.

The site can serve as an initial research and demonstration environment for:

- Geospatial monitoring
- Heritage observations
- Field surveys
- Environmental analysis
- Remote sensing
- Change detection
- Citizen science
- Heritage-risk analysis

---

# 🗺️ Geospatial Intelligence

Geospatial context is fundamental to Heritage Pulse.

The platform is designed to support:

- GeoJSON
- GeoTIFF
- Cloud Optimized GeoTIFF
- WMS
- WMTS
- XYZ tiles
- Vector tiles
- Point observations
- Lines
- Polygons
- Buffers
- Spatial queries
- Spatial clustering
- Heatmaps
- Temporal layers

Coordinate handling is designed around reproducible geographic workflows, including appropriate EPSG transformations.

The system should distinguish between:

- Observation location
- Site boundary
- Evidence location
- Approximate public location
- Processing geometry
- Analytical geometry

---

# 🛰️ Remote Sensing & Environmental Intelligence

Heritage Pulse can integrate open geospatial and environmental datasets where appropriate.

Potential data sources include:

- Sentinel
- Landsat
- Copernicus
- NASA datasets
- OpenStreetMap
- Digital Elevation Models
- Environmental datasets

Possible analytical indicators include:

- Vegetation indices
- Water-related indicators
- Built-up indicators
- Land-cover information
- Surface change
- Vegetation intrusion
- Environmental pressure
- Temporal change

All derived information should retain:

- Dataset identity
- Acquisition date
- Processing date
- Processing method
- Resolution
- Coordinate reference system
- Processing version
- Relevant uncertainty

---

# 🤖 AI & Computer Vision

Heritage Pulse can support computer-vision-assisted analysis.

Potential categories include:

- Cracks
- Wall deterioration
- Roof damage
- Vegetation intrusion
- Surface deterioration
- Structural anomalies
- Water-related effects
- Other visually observable conditions

AI outputs should never automatically be treated as ground truth.

A model output should be represented using language such as:

- Detected
- Inferred
- Estimated
- Predicted
- Potential
- Confidence
- Uncertainty
- Requires verification

Example:

```text
Model:
HeritageCV v1.2

Observation:
Potential masonry damage

Confidence:
0.84

Status:
Requires expert verification
```

---

# ⚠️ Heritage Risk Intelligence

Heritage Pulse can provide structured risk analysis using configurable methodologies.

Potential factors include:

- Structural condition
- Environmental exposure
- Vegetation pressure
- Water exposure
- Human pressure
- Historical observations
- Remote-sensing indicators
- Disaster exposure
- Site characteristics

A Heritage Risk Index should retain:

- Input variables
- Weight configuration
- Methodology version
- Calculation timestamp
- Data sources
- Uncertainty
- Validation information

The system should avoid presenting an automatically calculated risk score as absolute truth.

Risk outputs are intended as **decision-support information**.

---

# 🏗️ Research-Grade Architecture

The platform is designed around several architectural principles:

```text
Evidence
   ↓
Observation
   ↓
Geospatial Context
   ↓
Processing
   ↓
Inference
   ↓
Review
   ↓
Verified Knowledge
   ↓
Historical Change Ledger
```

Important architectural properties include:

- Provenance
- Reproducibility
- Auditability
- Uncertainty tracking
- Evidence integrity
- Versioning
- Spatial accuracy
- Temporal accuracy
- Security
- Privacy
- Accessibility
- Reliability
- Research validity

---

# 🔐 Evidence & Provenance Model

Each observation should retain provenance information.

Potential provenance fields include:

```text
Observation ID
Site ID
Contributor ID
Timestamp
Location
Location uncertainty
Evidence IDs
Evidence hashes
Source
Dataset version
Processing version
Model version
Confidence
Uncertainty
Review status
Reviewer
Review timestamp
Audit history
```

This allows researchers to understand how a particular conclusion was produced.

---

# 🔍 Explainability

Where AI or analytical models are used, Heritage Pulse should support interpretable outputs.

Potential techniques include:

- Feature importance
- SHAP-style explanations
- Saliency maps
- Evidence highlighting
- Input/output comparison
- Confidence visualization
- Uncertainty visualization

The purpose is to help users understand:

> Why did the system produce this result?

rather than presenting an unexplained classification.

---

# 👨‍🔬 Citizen Science

Heritage Pulse supports structured community participation.

Users can contribute:

- Photographs
- Observations
- Field notes
- Location information
- Environmental observations

Citizen observations can then pass through:

```text
Submission
    ↓
Evidence Validation
    ↓
Automated Checks
    ↓
Moderation
    ↓
Expert Review
    ↓
Verified / Rejected / Needs More Evidence
```

This creates a controlled pathway between public participation and research-grade information.

---

# 🛡️ Moderation & Trust

The system should maintain trust through:

- Evidence validation
- Duplicate detection
- Moderation
- Reviewer workflows
- Audit logs
- Contributor reputation signals
- Review history
- Status transitions
- Provenance preservation

Important statuses may include:

```text
Submitted
Under Review
Needs More Evidence
Verified
Rejected
Archived
```

---

# 🔒 Privacy & Sensitive Heritage Locations

Some heritage sites may be vulnerable to:

- Looting
- Vandalism
- Unauthorized access
- Commercial exploitation
- Illegal excavation

Therefore, sensitive heritage locations may require controlled disclosure.

Potential strategies include:

- Approximate public coordinates
- Restricted coordinates
- Role-based access
- Coordinate generalization
- Sensitive-site flags
- Audit logging

Public map information should not automatically expose sensitive coordinates.

---

# 👤 Role-Based Access Control

Potential roles include:

```text
Public
Contributor
Researcher
Reviewer
Heritage Expert
Administrator
```

Each role should have clearly defined permissions.

Example:

| Role | Submit | View | Review | Research | Admin |
|---|---:|---:|---:|---:|---:|
| Public | Limited | ✓ | — | — | — |
| Contributor | ✓ | ✓ | — | — | — |
| Researcher | ✓ | ✓ | Limited | ✓ | — |
| Reviewer | ✓ | ✓ | ✓ | ✓ | — |
| Heritage Expert | ✓ | ✓ | ✓ | ✓ | — |
| Administrator | ✓ | ✓ | ✓ | ✓ | ✓ |

Permissions should be enforced server-side.

---

# 📱 Field Data Collection

Heritage Pulse is designed to support real-world field workflows.

Potential field capabilities include:

- GPS-assisted observations
- Photographs
- Notes
- Location uncertainty
- Offline-friendly workflows
- Evidence metadata
- Survey forms
- Observation status
- Synchronization

Field data should preserve enough metadata to support later research and verification.

---

# 🧪 Research & Data Pipeline

The platform can support a research pipeline such as:

```text
Raw Observation
      ↓
Validation
      ↓
Normalization
      ↓
Geospatial Processing
      ↓
Remote Sensing
      ↓
Computer Vision
      ↓
Risk Analysis
      ↓
Expert Review
      ↓
Research Dataset
      ↓
Analysis / Publication
```

Research workflows should preserve the relationship between raw evidence and derived outputs.

---

# ⏳ Temporal Change Detection

Heritage Pulse is designed around historical comparison.

Potential comparisons include:

```text
T1 → T2
T2 → T3
T3 → T4
```

This allows researchers to investigate:

- Condition changes
- Vegetation expansion
- Environmental changes
- New observations
- Repeated damage
- Recovery
- Persistent risk

Temporal conclusions should account for:

- Image acquisition differences
- Resolution differences
- Seasonal variation
- Cloud cover
- Sensor differences
- Geolocation uncertainty
- Processing differences

---

# 🧬 Research Dataset Builder

The platform can support research dataset generation.

Potential features include:

- Dataset filtering
- Spatial filtering
- Temporal filtering
- Evidence filtering
- Label management
- Train/validation/test splits
- Dataset versioning
- Metadata generation
- Export

Example:

```text
Dataset:
Shivneri-Fort-Damage-v1

Training:
70%

Validation:
15%

Testing:
15%

Labels:
Wall Damage
Vegetation Intrusion
Roof Damage
No Visible Damage
```

---

# 🌐 FAIR-Oriented Data Principles

Heritage Pulse aims to follow FAIR-oriented research principles.

### Findable

Structured metadata and persistent identifiers.

### Accessible

Controlled access according to sensitivity.

### Interoperable

Standards such as:

- GeoJSON
- GeoTIFF
- CSV
- JSON
- REST APIs

### Reusable

Provenance, metadata, methodology, and licensing information.

---

# 💻 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Modern web technologies

## Mobile

- Capacitor
- Android
- Native Android build pipeline

## Maps

- MapLibre
- GeoJSON
- Geospatial processing
- Turf

## Backend

Designed to support:

- REST APIs
- Authentication
- Authorization
- Geospatial storage
- Background processing
- Research workflows

## Data

Potential components include:

- PostgreSQL
- PostGIS
- Object storage
- Geospatial datasets
- Remote sensing data
- Metadata stores

## AI / ML

Designed to support:

- Computer vision
- Remote sensing
- Classification
- Change detection
- Explainability
- Model versioning

## DevOps

- GitHub Actions
- Automated builds
- Automated testing
- Release automation
- Health checks

---

# 📂 Repository Structure

A simplified structure:

```text
Heritage_Plus/
│
├── .github/
│   └── workflows/
│       └── android-build.yml
│
├── android/
│   └── app/
│
├── src/
│
├── public/
│
├── server/
│
├── data/
│
├── docs/
│
├── package.json
├── capacitor.config.*
├── vite.config.*
├── README.md
│
└── ...
```

The exact repository structure may evolve as the project develops.

---

# 🚀 Local Development

## Requirements

Recommended environment:

```text
Node.js 22+
npm
Java 21
Android SDK
Git
```

Clone the repository:

```bash
git clone https://github.com/lord-voldesnort/Heritage_Plus.git
```

Enter the project:

```bash
cd Heritage_Plus
```

Install dependencies:

```bash
npm ci
```

Run development server:

```bash
npm run dev
```

Build web application:

```bash
npm run build
```

---

# 📱 Automated Android Build & Release

Android builds are automated using GitHub Actions.

Workflow:

```text
Git Push
   ↓
GitHub Actions
   ↓
Install Dependencies
   ↓
Build Web Application
   ↓
Capacitor Sync
   ↓
Gradle Build
   ↓
Generate APK
   ↓
Verify APK
   ↓
Generate SHA256
   ↓
GitHub Release
```

Version tags follow:

```text
v1.0.0
v1.1.0
v1.2.0
```

Push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The release workflow can then publish the APK.

---

# 📦 APK Download

## Latest Android APK

Download the latest public APK:

https://github.com/lord-voldesnort/Heritage_Plus/releases/latest/download/HeritagePulse.apk

> Note: The current prototype/release configuration may use a debug APK for demonstration. A production deployment should use a properly signed release build with secure signing-key management.

---

# 🔐 APK Integrity

Release builds can include a SHA256 checksum.

Example:

```text
HeritagePulse.apk.sha256
```

### Windows

```powershell
Get-FileHash HeritagePulse.apk -Algorithm SHA256
```

### Linux / macOS

```bash
sha256sum HeritagePulse.apk
```

The calculated hash can be compared against the published checksum.

---

# 🩺 Health & Operational Readiness

A production-oriented deployment should expose operational endpoints such as:

```text
/health
/ready
```

### `/health`

Indicates whether the service is running.

### `/ready`

Indicates whether required dependencies are available.

Potential monitored components:

- Database
- Object storage
- API
- Background workers
- External data providers
- AI services

---

# 🔌 API Architecture

The API is designed around versioned endpoints.

Example:

```text
/api/v1/sites
/api/v1/observations
/api/v1/evidence
/api/v1/reviews
/api/v1/users
/api/v1/datasets
/api/v1/analytics
/api/v1/risks
/api/v1/exports
```

Versioning allows future API evolution without immediately breaking existing clients.

---

# 📤 Export & Interoperability

Heritage Pulse can support research and interoperability exports.

Potential formats include:

- JSON
- CSV
- GeoJSON
- GeoTIFF
- PDF
- Research reports

Exports should preserve relevant metadata whenever possible.

Example GeoJSON properties:

```json
{
  "observation_id": "HP-SHF-2026-000184",
  "site_id": "SHIVNERI",
  "status": "requires_verification",
  "observed_at": "2026-08-14T10:32:00+05:30",
  "location_uncertainty_m": 8
}
```

---

# 📚 Project Documentation

Important project documentation includes:

```text
HERITAGE_PULSE.md
PRD.md
TRD.md
APP_FLOW.md
UI_UX_DESIGN.md
IMPLEMENTATION_PLAN.md
BACKEND_SCHEMA.sql
BUILD_APK.md
QUICKSTART.md
DEMO_RUNBOOK.md
CHANGELOG.md
CONTRIBUTING.md
```

These documents provide additional information about:

- Product requirements
- Technical architecture
- User flows
- UI/UX
- Implementation
- Database schema
- Build procedures
- Demonstration workflow
- Contribution guidelines

---

# 🧪 Quality & Validation

Research-grade development requires more than successful compilation.

Important validation areas include:

### Software

- Unit testing
- Integration testing
- API testing
- End-to-end testing
- Regression testing

### Geospatial

- Coordinate validation
- CRS validation
- Geometry validation
- Spatial accuracy

### AI/ML

- Model validation
- Dataset quality
- Train/test separation
- Error analysis
- Confidence calibration

### Data

- Provenance
- Completeness
- Consistency
- Duplicate detection
- Metadata validation

### Security

- Authentication
- Authorization
- Input validation
- Rate limiting
- Secret management
- Audit logging

---

# 🔬 Scientific & Ethical Principles

Heritage Pulse follows several important research principles.

## Do not overclaim

The platform should distinguish:

```text
Observed
Detected
Inferred
Predicted
Estimated
Potential
Confidence
Uncertainty
Requires Verification
```

These terms should not be treated as interchangeable.

## Evidence before conclusion

Whenever possible:

```text
Evidence
   ↓
Observation
   ↓
Analysis
   ↓
Inference
   ↓
Review
```

rather than:

```text
Algorithm
   ↓
Automatic Truth
```

## Reproducibility

Research outputs should ideally preserve:

- Dataset version
- Model version
- Processing version
- Parameters
- Timestamp
- Input data
- Methodology

---

# 🌱 Sustainability & Scalability

Heritage Pulse is designed so that the architecture can expand beyond a single heritage site.

Potential future coverage includes:

- Forts
- Temples
- Archaeological sites
- Historic buildings
- Caves
- Cultural landscapes
- Protected monuments
- Archaeological zones

The system can eventually support multiple geographical regions and heritage authorities.

---

# 🛣️ Roadmap

## Phase 1 — Prototype

- Shivneri Fort
- Core Change Ledger
- Mobile application
- Geospatial visualization
- Observation workflow
- Evidence management

## Phase 2 — Research Platform

- Remote sensing
- Computer vision
- Temporal analysis
- Risk modelling
- Dataset builder
- Research exports

## Phase 3 — Multi-Site Platform

- Multiple heritage sites
- Expanded datasets
- Expert networks
- Advanced analytics
- Research collaboration

## Phase 4 — Institutional Deployment

Potential integrations with:

- Heritage authorities
- Universities
- NGOs
- Research institutions
- Government agencies
- Conservation organizations

---

# 🌐 Language Readiness

The platform architecture is intended to support multilingual interfaces.

Potential languages include:

- English
- Marathi
- Hindi

Localization should cover:

- User interface
- Forms
- Error messages
- Observation categories
- Guidance
- Accessibility content

---

# 🔐 Security Principles

Security should be treated as a core architectural requirement.

Important principles include:

- Secure authentication
- Role-based authorization
- Server-side permission checks
- Input validation
- Secure file uploads
- Malware scanning where appropriate
- Rate limiting
- API protection
- Secret management
- Audit logging
- Data encryption
- Sensitive coordinate protection

Secrets should never be committed to GitHub.

Use environment variables or secure secret management.

---

# 🤝 Contribution

Contributions are welcome.

Recommended workflow:

```bash
git checkout -b feature/my-feature
```

Make changes and test them.

Then:

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

Open a Pull Request.

---

# 🎓 Research & Academic Use

Heritage Pulse can provide a foundation for research in:

- Heritage conservation
- Archaeology
- GIS
- Remote sensing
- Computer vision
- Environmental monitoring
- Disaster risk
- Citizen science
- Geospatial AI
- Digital humanities
- Cultural heritage informatics

Potential research questions include:

- How can community observations complement remote sensing?
- How can uncertainty be represented in heritage monitoring?
- How can temporal evidence support conservation planning?
- How can computer vision assist heritage condition assessment?
- How can provenance improve reproducibility?
- How can citizen science contribute to heritage documentation?

---

# 🏆 Smart India Hackathon 2026

## Project

**Heritage Pulse**

## Theme

**Heritage & Culture**

## Problem Statement

**PS 26197**

## Team

**Sinister Six**

## Prototype Location

**Shivneri Fort, Junnar, Pune District, Maharashtra**

### Core Concept

> A provenance-aware, uncertainty-driven Change Ledger for community-sourced safeguarding of India's protected heritage sites.

---

# ⭐ Why Heritage Pulse?

Heritage Pulse focuses on a fundamental problem:

> **Preserving evidence about change, not simply reporting change.**

The platform connects:

```text
Community
    +
Field Evidence
    +
Geospatial Context
    +
Remote Sensing
    +
AI
    +
Expert Review
    +
Provenance
    +
Uncertainty
    +
Historical Records
```

into a unified research-oriented system.

---

# 🧭 Project Philosophy

Heritage Pulse follows a simple philosophy:

### Observe

Record what is actually observed.

### Preserve

Preserve evidence and provenance.

### Understand

Use GIS, remote sensing, AI and research methods to analyse change.

### Verify

Allow appropriate human review.

### Learn

Build longitudinal datasets that improve future research.

---

# 🧩 Key Principles

```text
Evidence First
Provenance Aware
Uncertainty Aware
Geospatially Accurate
Temporally Traceable
Research Reproducible
Human Review Supported
Privacy Preserving
Security Conscious
Open to Interoperability
```

---

# 🔗 Project Links

### GitHub Repository

https://github.com/lord-voldesnort/Heritage_Plus

### Latest APK

https://github.com/lord-voldesnort/Heritage_Plus/releases/latest/download/HeritagePulse.apk

### Releases

https://github.com/lord-voldesnort/Heritage_Plus/releases

### GitHub Actions

https://github.com/lord-voldesnort/Heritage_Plus/actions

---

# 📱 Quick Start

### 1. Clone

```bash
git clone https://github.com/lord-voldesnort/Heritage_Plus.git
```

### 2. Enter directory

```bash
cd Heritage_Plus
```

### 3. Install dependencies

```bash
npm ci
```

### 4. Start development

```bash
npm run dev
```

### 5. Build

```bash
npm run build
```

---

# 📊 High-Level Architecture

```text
                    HERITAGE PULSE
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
     Community         Researchers       Experts
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    Observations
                          │
                    Evidence Layer
                          │
                 Geospatial Context
                          │
             ┌────────────┴────────────┐
             │                         │
       Remote Sensing             Computer Vision
             │                         │
             └────────────┬────────────┘
                          │
                    Risk Analysis
                          │
                    Change Ledger
                          │
                    Expert Review
                          │
                 Verified Knowledge
                          │
              Research / Conservation
```

---

# 🔎 Change Ledger Lifecycle

```text
1. Observe
      ↓
2. Capture Evidence
      ↓
3. Attach Location
      ↓
4. Record Timestamp
      ↓
5. Validate
      ↓
6. Analyse
      ↓
7. Generate Inference
      ↓
8. Record Uncertainty
      ↓
9. Human Review
      ↓
10. Preserve in Change Ledger
```

---

# 🏛️ Heritage Pulse in One Sentence

> **Heritage Pulse turns community observations, geospatial evidence, remote sensing, AI-assisted analysis and expert review into a provenance-aware historical record of heritage change.**

---

<p align="center">
  <strong>Observe • Preserve • Verify • Understand</strong>
</p>

<p align="center">
  Made for heritage conservation, research, and responsible community participation.
</p>
