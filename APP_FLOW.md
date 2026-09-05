# APPLICATION FLOW & USER JOURNEYS
## HERITAGE GUARD (हेरिटेज गार्ड)
### Information Architecture, State Machines & End-to-End Workflows
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Team Sinister Six*

---

## 1. Global Information Architecture (IA)

```mermaid
graph TD
    Root[Heritage Guard Root PWA]
    
    Root --> Hub[Heritage Twin Cluster Hub]
    Root --> CuratorAuth[Curator Portal Login]
    Root --> OfflineVault[Offline Cache Vault]

    Hub --> Layer1[Layer 1: Cultural Identity]
    Hub --> Layer2[Layer 2: Living Practices]
    Hub --> Layer3[Layer 3: Spatial Truth GIS]
    Hub --> Layer4[Layer 4: Field Observation Studio]
    Hub --> Layer4_Ledger[Layer 4: Temporal Change Ledger]

    Layer1 --> Vernacular[Vernacular Aliases & Sourced History]
    Layer1 --> OralAudio[Oral History Narrative Player]

    Layer2 --> CraftCards[Artisan Guild Cards]
    Layer2 --> RitualCal[Seasonal Ritual Timelines]
    Layer2 --> ConsentModal[Community Consent Badge & Attribution]

    Layer3 --> BoundaryOverlay[Monument + 100m Prohibited + 200m Regulated MultiPolygons]
    Layer3 --> SourceProvenance[Sourcing Agency, Date & Limitations]
    Layer3 --> TestScenarios[Jury Test Bench: 4 Pre-Seeded Scenarios]

    Layer4 --> NeutralForm[Neutral Observation Intake]
    Layer4 --> GpsTelemetry[Live GPS Sensor Accuracy HUD]
    Layer4 --> SHASealer[Client-side SHA-256 Checksum Engine]
    Layer4 --> SpatialVerdict[3-Statement Truth Modal]

    Layer4_Ledger --> TimelineFeed[Chronological Condition Log]
    Layer4_Ledger --> DiffSlider[Before/After Photo Comparison]

    CuratorAuth --> TriageInbox[Observation Triage Queue]
    TriageInbox --> DossierInspector[Evidence Dossier Inspector]
    DossierInspector --> ActionDispatch[Clarify / Catalog / Refer]
    ActionDispatch --> PdfGen[Standardized Institutional Safeguarding PDF]
```

---

## 2. End-to-End User Flow 1: The Cultural Explorer

```mermaid
sequenceDiagram
    autonumber
    actor Explorer as Cultural Explorer (Ananya)
    participant UI as Heritage Twin Interface
    participant Audio as Vernacular Audio Service
    participant Map as Leaflet Spatial Engine

    Explorer->>UI: Navigates to Heritage Guard
    UI->>Explorer: Presents Chand Baori Twin Showcase (Hindi + English)
    Explorer->>UI: Taps on "Living Practices" Tab
    UI->>Explorer: Renders Harshat Mata Jal Vandana Ritual card + Community Consent Tag
    Explorer->>Audio: Taps "Listen to Elder Oral Lore"
    Audio-->>Explorer: Streams 45-second high-fidelity vernacular narrative
    Explorer->>UI: Toggles to "Spatial Truth View"
    UI->>Map: Loads verified GeoJSON boundaries (ASI Bhuvan 2022)
    Map-->>Explorer: Renders monument core (Gold) and 100m/200m legal buffers (Red/Amber)
    Explorer->>UI: Gains unified understanding of architectural form and community practice
```

---

## 3. End-to-End User Flow 2: Offline Field Observation & Spatial Reasoning

```mermaid
sequenceDiagram
    autonumber
    actor Documenter as Citizen Documenter (Rajesh)
    participant PWA as Mobile PWA Form
    participant GPS as Hardware Geolocation API
    participant Store as IndexedDB Local Vault
    participant Cloud as Backend Spatial Engine
    participant PostGIS as PostgreSQL / PostGIS

    Documenter->>PWA: Taps "+ Document Field Condition"
    PWA->>GPS: Requests navigator.geolocation.watchPosition()
    GPS-->>PWA: Returns Lat, Lon, Accuracy (±4.5m)
    PWA-->>Documenter: Displays Green HUD: "High Precision (±4.5m)"
    Documenter->>PWA: Selects Category: "Masonry Displacement"
    Documenter->>PWA: Captures Photo of damaged plinth
    Documenter->>PWA: Enters neutral description ("Displaced stone blocks near north steps")
    
    alt Device is Offline (Rural blackspot)
        PWA->>Store: Saves draft with SHA-256 digest (status: 'PENDING_SYNC')
        PWA-->>Documenter: Shows notification: "Stored securely in device vault. Auto-sync active."
        Note over Documenter,Store: Documenter walks to village with network connection
        Store->>PWA: 'online' event triggered
    end

    PWA->>Cloud: POST /api/v1/observations (Payload + Image Blob)
    Cloud->>PostGIS: Evaluates Point-in-Polygon & Distance to Boundary
    PostGIS-->>Cloud: Distance = 34.2m (Strictly Inside 100m Prohibited Buffer)
    Cloud->>PostGIS: Writes record to field_observations & change_ledger
    Cloud-->>PWA: Returns Case ID: HG-RAJ-2026-0042 + 3-Statement Verdict
    PWA-->>Documenter: Displays 3-Tier Truth Modal (User Note + Sourced GIS + Disclaimer)
```

---

## 4. End-to-End User Flow 3: Curator Triage & Dossier Generation

```mermaid
sequenceDiagram
    autonumber
    actor Curator as ASI / State Curator (Dr. Sundaram)
    participant Console as Curator Web Console
    participant API as Backend Service
    participant PDF as Dossier Compiler
    actor Authority as District Magistrate / ASI Superintending Archaeologist

    Curator->>Console: Logs in with official institutional credentials
    Console->>API: GET /api/v1/curator/inbox
    API-->>Console: Returns list of pending observations categorized by spatial urgency
    Curator->>Console: Selects Case #HG-RAJ-2026-0042 (Prohibited Buffer Concern)
    Console-->>Curator: Displays high-res photo, EXIF metrics, SHA-256 seal, and cadastral overlay
    Curator->>Console: Verifies that distance (34.2m) is well outside GPS error (±4.5m)
    Curator->>Console: Selects Action: "Refer to ASI Regional Circle for Inspection"
    Curator->>Console: Enters administrative notes and gazette tracking citation
    Console->>API: PATCH /api/v1/curator/reviews/HG-RAJ-2026-0042
    API->>PDF: Triggers generateSafeguardingDossier()
    PDF-->>Console: Streams downloadable, tamper-evident PDF dossier with QR code
    Curator->>Authority: Submits official dossier with verifiable cryptographic hash
```

---

## 5. Offline Sync Engine State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: PWA Initialized
    
    Idle --> Capturing: User Opens Observation Studio
    Capturing --> LocalDrafted: Offline or Save Draft Selected
    
    state LocalDrafted {
        [*] --> StoredInIndexedDB
        StoredInIndexedDB --> AwaitingNetwork: Listening for window.online
        AwaitingNetwork --> SyncTriggered: Network connection re-established
    }

    Capturing --> DirectUpload: Online & User Taps Submit
    DirectUpload --> ProcessingSpatial: Payload received by API
    SyncTriggered --> ProcessingSpatial: Background sync worker dispatches draft

    state ProcessingSpatial {
        [*] --> CheckLayerConfidence
        CheckLayerConfidence --> CheckGpsAccuracy
        CheckGpsAccuracy --> CalculateBoundaryDistance
        CalculateBoundaryDistance --> CheckUncertaintyOverlap
        CheckUncertaintyOverlap --> FinalizeClassification
    }

    ProcessingSpatial --> SealedInLedger: Hash Verified & Written to PostGIS
    SealedInLedger --> CaseActive: Assigned Tracking Code (e.g., HG-RAJ-0042)
    CaseActive --> InTriageQueue: Displayed in Curator Console
    
    InTriageQueue --> NeedsMoreInfo: Curator Requests Field Retake
    InTriageQueue --> Cataloged: Curator Marks Condition Noted
    InTriageQueue --> ReferredToAuthority: Curator Generates Formal Dossier
    
    ReferredToAuthority --> [*]
    Cataloged --> [*]
```
