# APPLICATION FLOW & USER WORKFLOWS
## HERITAGE PULSE (हेरिटेज पल्स)
### Information Architecture, User Stories & State Machines
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Team Sinister Six*

---

## 1. Information Architecture (IA)

```mermaid
graph TD
    Root[Heritage Pulse Web PWA]
    
    Root --> SiteCard[1. Site Context Card - Shivneri Fort]
    Root --> CaptureStudio[2. Field Capture Studio]
    Root --> LedgerView[4. Change Ledger & Case View]
    Root --> ReviewerConsole[5. Reviewer Console]

    SiteCard --> SiteInfo[Site Name, Significance, Image]
    SiteCard --> GeometrySource[Source Layer Metadata & Disclaimer]
    
    CaptureStudio --> CategorySelect[Select Visible Change Category]
    CaptureStudio --> PhotoUpload[Capture Photograph & Hardware Timestamp]
    CaptureStudio --> GPSHud[GPS Location & Accuracy HUD]
    CaptureStudio --> PrivacyGuard[Privacy & Non-Accusation Check]

    CaptureStudio --> SpatialEngine[3. Spatial Reasoning Engine]
    SpatialEngine --> PIPCheck[Point-In-Polygon Test]
    SpatialEngine --> DistCheck[Distance-To-Boundary Test]
    SpatialEngine --> AccuracyCircle[GPS Accuracy Overlap Check]
    
    SpatialEngine --> LedgerView
    LedgerView --> Timeline[Append-Only Change Events Timeline]
    LedgerView --> ExplainableVerdict[3-Statement Truth Verdict]

    ReviewerConsole --> CaseList[Reviewer Case Queue]
    ReviewerConsole --> ActionModal[Record Review Action & Notes]
    ActionModal --> PacketExport[Export Reviewer Evidence Packet]
```

---

## 2. Complete Step-by-Step User Workflow (Steps 1 – 8)

```mermaid
sequenceDiagram
    autonumber
    actor Observer as Field Reporter (Visitor / Student)
    participant App as Mobile PWA UI
    participant GIS as Spatial Reasoning Engine
    participant Ledger as Change Ledger Database
    actor Reviewer as Heritage Curator / NGO Reviewer

    Observer->>App: Step 1: Select Target Site (Shivneri Fort Context Card)
    App-->>Observer: Displays site info, source layer version & disclaimer
    Observer->>App: Step 2: Select Visible Change Category (e.g. "Possible Construction")
    Observer->>App: Step 3: Capture Photo & Factual Description
    App->>App: Step 4: Apply Privacy & Safety Rules (No names/accusations)
    App->>GIS: Step 5: Perform Spatial Reasoning (Lat, Lon, GPS Acc, GeoJSON)
    GIS-->>App: Step 6: Return Explainable Result (e.g. "Location Uncertain" or "Potential Concern")
    App->>Ledger: Step 7: Create Change Ledger Case (Case ID: HP-MH-2026-0001)
    Ledger-->>Observer: Displays Case Summary & Append-Only Timeline
    
    Reviewer->>App: Step 8: Opens Reviewer Assessment Console
    Reviewer->>App: Reviews case evidence, map context & accuracy circle
    Reviewer->>Ledger: Selects Action ("Additional Info Needed" or "Referred Manually")
    Ledger-->>Reviewer: Generates & Exports Reviewer Evidence Packet (PDF/HTML)
```

---

## 3. Change Ledger State Machine

```mermaid
stateDiagram-v2
    [*] --> DraftCreated: User Opens Capture Studio
    DraftCreated --> LocationCaptured: GPS Coordinate & Accuracy Acquired
    LocationCaptured --> SpatialEvaluated: Point-in-Polygon & Buffer Computed
    
    state SpatialEvaluated {
        [*] --> CheckLayerGovernance
        CheckLayerGovernance --> CheckGpsAccuracy
        CheckGpsAccuracy --> EvaluateBoundaryOverlap
    }

    SpatialEvaluated --> CaseLogged: Assigned Case ID (e.g. HP-MH-2026-0001)
    CaseLogged --> SubmittedForReview: Appended to Change Ledger
    
    state ReviewerState {
        SubmittedForReview --> AdditionalInfoRequested: Reviewer Requests Better Location/Photo
        SubmittedForReview --> FieldVerificationRecommended: Reviewer Flags for Ground Visit
        SubmittedForReview --> ReferredManually: Reviewer Forwards to Competent Authority
        SubmittedForReview --> ClosedInsufficientLocation: GPS Error Too Large
        SubmittedForReview --> ClosedReviewed: Case Cataloged & Closed
    }

    ReferredManually --> [*]
    ClosedReviewed --> [*]
    ClosedInsufficientLocation --> [*]
```

---

## 4. End-to-End User Stories

### User Story 1: Field Visitor at Shivneri Fort
A student visiting Shivneri Fort notices newly dumped construction debris near the access pathway. They open Heritage Pulse, tap "Dumping or Waste", capture a photo, write a neutral description ("Debris pile noted 15m from lower pathway"), and allow GPS capture ($\pm 6.5\text{m}$). The app tests the point against the Shivneri source layer, generates Case `#HP-MH-2026-0012`, displays the spatial reasoning output, and adds the event to the Change Ledger.

### User Story 2: Reviewer Assessing an Ambiguous Case
A heritage NGO reviewer opens the Reviewer Console and selects Case `#HP-MH-2026-0014`. The report shows a point 5.0m from the boundary with a $\pm 12.0\text{m}$ GPS accuracy circle. The system displays: `Location uncertain – the GPS accuracy circle overlaps the zone boundary. The application cannot make a dependable zone classification.` The reviewer appends a note asking for a second field observation from a higher-precision device and updates the case status to `Additional Info Needed`.
