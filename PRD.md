# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## HERITAGE GUARD (हेरिटेज गार्ड)
### A Living Heritage Intelligence & Safeguarding Atlas for India
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Team Sinister Six*

---

## 1. Executive Summary & Problem Context
India possesses one of the richest cultural ecosystems in the world, encompassing over 3,690 Centrally Protected Monuments under the Archaeological Survey of India (ASI), tens of thousands of state-protected structures, and millions of unlisted community sacred spaces, stepwells, and historic precincts. 

However, existing digital initiatives suffer from two structural shortcomings:
1. **The Tourism-Only Trap**: Most applications focus solely on visitor discovery (ticket booking, itineraries, 360-degree virtual photos). They omit the *intangible living practice* (craft communities, oral lore, ritual calendars) that sustains the physical monument.
2. **The Fragmented Complaint Trap**: When unauthorized construction, masonry displacement, or environmental dumping occurs within statutory buffer zones (e.g., 100m Prohibited Zone under the AMASR Act), citizen reports remain scattered across Twitter/X, local grievance portals, or police complaints. These reports lack exact coordinate accuracy, tamper-evident media provenance, and boundary context—rendering them legally and administratively unusable.

### 1.1 The Heritage Guard Vision
**Heritage Guard** transforms cultural sites into **provenance-aware digital twins**. It bridges the gap between public appreciation and institutional safeguarding by:
* Making living culture, oral history, and indigenous craft practices the **structural primary view**, not an afterthought.
* Providing a **neutral, non-accusatory field observation studio** with offline resilience and real-time GPS accuracy measurement.
* Computing boundary proximity through **provenance-aware spatial reasoning**, openly acknowledging uncertainty rather than making dangerous, slanderous accusations.
* Maintaining an **immutable temporal change ledger** that records condition continuity over time.
* Generating **institutional-grade safeguarding dossiers** for curators and conservation authorities (ASI, State Archaeology, District Administrations).

---

## 2. Competitive & Strategic Differentiation

| Dimension | Conventional Tourism / Map Apps | Government Grievance Portals | Generic AI Heritage Apps | **HERITAGE GUARD** |
|---|---|---|---|---|
| **Core Objective** | Ticket sales & itineraries | Filing complaints against violations | Auto-generating descriptive labels | **Continuity between living culture & spatial safeguarding** |
| **Living Culture** | Incidental background text | Completely absent | Synthesized / Unconsented | **Consented Living Practice cards with custodian provenance** |
| **Spatial Boundary** | Single pin on Google Maps | Text address / pin drop | None or circular radius | **Sourced MultiPolygon boundaries (100m Prohibited / 200m Regulated)** |
| **GPS Uncertainty** | Hidden or ignored | Ignored (leads to false disputes) | Ignored | **Explicitly computed: Disk intersection with boundary margin** |
| **Field Capture** | Requires live high-speed 4G/5G | Fails offline in rural heritage sites | Online LLM inference | **Offline-first PWA with IndexedDB sync queue & SHA-256 seals** |
| **Institutional Output** | None | Raw unstructured ticket number | Generic AI summary | **Standardized, audit-ready PDF/JSON-LD Safeguarding Dossier** |

---

## 3. Target User Personas

### Persona A: Heritage Explorer & Youth Citizen ("Aarav")
* **Profile**: University student, amateur photographer, cultural traveler.
* **Needs**: Discover authentic cultural backstories, local vernacular names, and seasonal rituals not found in generic travel blogs.
* **Key Flow**: Explores the Heritage Twin showcase, listens to oral history clips, views interactive boundary maps.

### Persona B: Local Community Bearer / Artisan ("Lakshmi Bai")
* **Profile**: Traditional textile weaver or temple community elder living near a heritage cluster.
* **Needs**: Ensure their traditional practices and sacred traditions are respected, documented accurately, and not exploited without consent.
* **Key Flow**: Reviews living practice documentation, exercises visibility consent (`public`, `community-only`, `withheld`).

### Persona C: Field Documenter / Conservation Volunteer ("Tariq")
* **Profile**: Architecture student or heritage NGO volunteer conducting field surveys.
* **Needs**: Document physical distress (e.g., masonry displacement, moisture seepage) in remote or low-connectivity zones without being accused of vigilantism.
* **Key Flow**: Opens mobile PWA offline, records neutral physical observation, verifies GPS accuracy circle, syncs upon returning to cell network.

### Persona D: Conservation Officer / Institutional Curator ("Dr. Sharma")
* **Profile**: Superintending Archaeologist or District Heritage Committee curator.
* **Needs**: High-fidelity, verifiable evidence packs with clear provenance to evaluate whether ground inspections are warranted.
* **Key Flow**: Inspects triage inbox in Curator Console, reviews photo EXIF and SHA-256 integrity, reviews distance-to-boundary calculations, issues official referral dossiers.

---

## 4. Product Principles & Ethical Guardrails

### Principle 1: Showcasing is Structural, Not Decorative
Preservation begins with appreciation. A site cannot be protected if its community meaning is erased. The digital twin must celebrate local names, oral histories, and living practices before presenting monitoring workflows.

### Principle 2: Restraint and Non-Accusation
Heritage Guard is an evidence continuity platform, not an accusation portal.
* **Forbidden Fields**: No fields for "Accused Name", "Contractor", "Suspected Offender", or "Is this illegal?".
* **Forbidden Output Badges**: The system never issues badges like "Illegal Encroacher" or "Guilty".
* **The 3-Statement Separation**:
  1. *What the citizen documented*: "Granite blocks stacked 5 meters from south pavilion."
  2. *What the GIS spatial engine calculated*: "Point falls within the 100m Prohibited Buffer (+/- 6.4m GPS uncertainty)."
  3. *What authority remains required*: "Statutory determination rests exclusively with the designated competent authority."

### Principle 3: Cultural Consent & Indigenous Data Sovereignty
In alignment with the **UNESCO 2003 Convention for the Safeguarding of the Intangible Cultural Heritage (Article 15)**:
* Community knowledge is never extracted without attribution.
* Communities can mark practices as `public`, `community-only`, or `withheld` (to prevent commercial exploitation or desecration of sacred rituals).

### Principle 4: Data Protection & DPDP Act 2023 Compliance
* Observers can contribute anonymously using cryptographic device-nonce tokens.
* Automated client-side face and license-plate blurring ensures no PII is inadvertently ingested into conservation dossiers.

---

## 5. Functional Requirements Matrix

### Epic 1: The 5-Layer Heritage Twin
* **FR-1.1**: Display official monument name alongside regional vernacular designations (Hindi, Tamil, Marathi, etc.).
* **FR-1.2**: Provide structured tabs: *Overview & Identity*, *Living Practices*, *Spatial Truth Map*, *Change Ledger*.
* **FR-1.3**: Support playable audio clips of oral histories narrated by local elders or custodians.
* **FR-1.4**: Render living practice cards indicating seasonal calendar, associated artisan castes/guilds, and cultural consent badges.

### Epic 2: Provenance-Aware Geospatial Mapping
* **FR-2.1**: Render statutory boundaries: Monument Core Footprint, 100m Prohibited Buffer, 200m Regulated Buffer.
* **FR-2.2**: Display provenance metadata: Sourcing Agency (e.g., ASI/NRSC Bhuvan), Gazette notification number, publication date, and known survey limitations.
* **FR-2.3**: Interactive test buttons allowing jury/users to simulate test coordinates (Definitive Inside, Boundary Intersection, Outside, Degraded GPS).

### Epic 3: Neutral Field Capture & Offline Engine
* **FR-3.1**: Single-screen mobile capture form: Category selection, camera snapshot, objective notes, auto-geocoding.
* **FR-3.2**: Live GPS Accuracy Meter ($r_{gps}$) with dynamic threshold feedback (Green $\le 10\text{m}$, Amber $\le 35\text{m}$, Red $> 35\text{m}$).
* **FR-3.3**: Offline caching via IndexedDB (Dexie.js). When offline, submissions are saved locally as `PENDING_SYNC` and auto-dispatched upon network reconnection.
* **FR-3.4**: Client-side WebCrypto generation of SHA-256 hashes for raw image blobs and metadata payloads.

### Epic 4: Spatial Reasoning Engine
* **FR-4.1**: Server-side and client-side point-in-polygon (PIP) and minimum Euclidean distance-to-boundary calculations.
* **FR-4.2**: Evaluation of boundary intersection against GPS uncertainty radius: if $\delta \le (r_{gps} + 5\text{m})$, classify as `BOUNDARY_UNCERTAIN`.
* **FR-4.3**: Transparent three-statement verdict breakdown displayed to the submitter upon submission.

### Epic 5: Temporal Change Ledger
* **FR-5.1**: Chronological feed of validated observations, historical conservation works, and seasonal community rituals.
* **FR-5.2**: Before-and-after photographic comparison slider for documented structural points over time.

### Epic 6: Curator Safeguarding Console & Dossier Generator
* **FR-6.1**: Role-based access for verified conservation personnel and district curators.
* **FR-6.2**: Observation inbox with spatial classification filters, category filters, and date range pickers.
* **FR-6.3**: Interactive Dossier Inspector displaying satellite overlay, GPS uncertainty ring, EXIF verification, and audit trail.
* **FR-6.4**: Single-click PDF and JSON-LD Safeguarding Dossier export featuring cryptographic checksums and verification QR code.

---

## 6. Non-Functional Requirements (NFR)

* **Performance**: First Contentful Paint (FCP) $\le 1.2\text{s}$ on 3G networks; map vector tile rendering $\le 800\text{ms}$.
* **Reliability & Offline Capability**: 100% data retention of offline drafts during complete network blackout; zero draft loss upon browser close.
* **Security & Integrity**: All API transactions over TLS 1.3; tamper-evident SHA-256 media validation; automated PII redaction.
* **Accessibility**: WCAG 2.1 AA compliant; bilingual interface (English + Hindi initially; scalable to 22 scheduled languages).
* **Portability**: Progressive Web App (PWA) compatible with Android Chrome, iOS Safari, and desktop Chromium browsers.

---

## 7. SIH Success Criteria & Evaluation Rubric

1. **Thesis Defensibility**: Clear distinction between tourism discovery and evidence continuity; zero feature creep into legal accusation.
2. **Technical Depth**: Demonstration of non-trivial GIS boundary math and uncertainty buffer handling rather than simple radius circles.
3. **Institutional Viability**: Evaluators can verify that generated dossiers conform to the administrative evidentiary needs of ASI/State custodians.
4. **Field Usability**: A complete observation can be logged offline in $< 90$ seconds with full provenance preservation.
