# USER FLOWS & INTERACTION JOURNEYS
## HERITAGE PULSE (हेरिटेज पल्स)
*Owner: Ameya | Reviewer: Vivek*

---

## 1. Flow 1: Field Observation Intake (Mobile Reporter)

```mermaid
sequenceDiagram
    autonumber
    actor Reporter as Field Observer (Student / Visitor)
    participant UI as Mobile PWA App Shell
    participant GPS as Geolocation API / Sensor HUD
    participant Spatial as Spatial Reasoning Engine
    participant Ledger as Change Ledger Store

    Reporter->>UI: Opens Heritage Pulse (/site)
    UI-->>Reporter: Displays Shivneri Fort Context Card & Source Notice
    Reporter->>UI: Clicks "+ Document Change" (/capture)
    UI->>GPS: Requests location & accuracy radius
    GPS-->>UI: Returns Lat 19.1982, Lon 73.8624, Acc ±4.5m (Green HUD)
    Reporter->>UI: Selects category "Possible Construction"
    Reporter->>UI: Uploads photo & enters factual description
    Reporter->>UI: Clicks "Submit Observation"
    UI->>Spatial: Evaluates Point vs. Shivneri GeoJSON Boundary
    Spatial-->>UI: Returns "Potential zone-related concern (Distance: 0m, Acc: ±4.5m)"
    UI->>Ledger: Appends new case (Case ID: HP-MH-2026-0001) & events
    UI-->>Reporter: Renders Spatial Verdict & Case Timeline (/result/HP-MH-2026-0001)
```

---

## 2. Flow 2: Reviewer Triage & Evidence Packet Export (Curator)

```mermaid
sequenceDiagram
    autonumber
    actor Curator as Heritage Curator / Reviewer
    participant Console as Reviewer Console (/reviewer)
    participant Modal as Review Action Modal
    participant Packet as Packet Generator (/packet/:caseId)

    Curator->>Console: Opens Reviewer Console
    Console-->>Curator: Lists pending cases filtered by spatial classification
    Curator->>Console: Selects Case HP-MH-2026-0003 (Location Uncertain Case)
    Console-->>Curator: Displays boundary map, GPS accuracy circle, photo & audit log
    Curator->>Modal: Opens Action Modal
    Curator->>Modal: Selects "Request Additional Information" + enters notes
    Modal->>Console: Appends ReviewEvent to Change Ledger & updates status
    Curator->>Packet: Clicks "Export Reviewer Packet"
    Packet-->>Curator: Renders print-ready evidence dossier with 3-part statement
```
