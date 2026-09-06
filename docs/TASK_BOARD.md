# TASK BOARD & WORKSTREAM MATRIX
## HERITAGE PULSE (हेरिटेज पल्स)
*Synchronized with /project/TASK_STATUS.json*

---

## 1. Board Columns

### 🟢 Done (Foundation Phase Complete)
* `FOUNDATION-01`: Repository initialized (Owner: Vishwajeet | Reviewer: Ameya)
* `FOUNDATION-02`: Product contract created (Owner: Ameya | Reviewer: Vishwajeet)
* `FOUNDATION-03`: Data model and shared types created (Owner: Vishwajeet | Reviewer: Vivek)
* `FOUNDATION-04`: Architecture & workstreams documented (Owner: Vishwajeet | Reviewer: Ameya)
* `FOUNDATION-05`: Mobile-first route skeleton created (Owner: Vivek | Reviewer: Vishwajeet)
* `FOUNDATION-06`: Mock scenarios & task-status CLI created (Owner: Vishwajeet | Reviewer: Ameya)
* `FOUNDATION-07`: PS_FIT.md & JUDGE_QA.md frozen (Owner: Ameya | Reviewer: Vivek)
* `FOUNDATION-08`: Geometry Gate structure & check script wired (Owner: Vishwajeet | Reviewer: Ameya)

### 🟡 Ready (Unblocked & Ready to Start)
* `GATE-01`: Select Target Site & Sourced Geometry (Owner: Ameya + Vishwajeet | Reviewer: Team)
* `PRODUCT-01`: Finalize Observation Categories & Prompts (Owner: Ameya | Reviewer: Person 6)
* `PRODUCT-02`: Reviewer Status Transitions & Timeline Rules (Owner: Ameya | Reviewer: Vishwajeet)
* `PRODUCT-03`: Reviewer Evidence Packet Schema (Owner: Ameya | Reviewer: Vivek)
* `UI-01`: Mobile Field Capture Studio & GPS HUD (Owner: Vivek | Reviewer: Person 4)
* `UI-03`: Case Detail & Change Ledger Timeline (Owner: Vivek | Reviewer: Ameya)
* `LEDGER-02`: Case ID Generator & Provenance Metadata Store (Owner: Vishwajeet | Reviewer: Ameya)
* `REVIEW-01`: Reviewer Assessment Console & Action Modal (Owner: Vivek | Reviewer: Ameya)
* `PACKET-01`: Exportable Reviewer Evidence Packet Generator (Owner: Vivek | Reviewer: Vishwajeet)

### 🔴 Blocked (Awaiting GATE-01 or Upstream Completion)
* `SPATIAL-01`: Point-in-Polygon & Distance Engine (Owner: Vishwajeet | **Blocked by: GATE-01**)
* `SPATIAL-02`: Accuracy-Circle Overlap & Uncertainty Evaluator (Owner: Vishwajeet | **Blocked by: GATE-01**)
* `SPATIAL-03`: Deterministic Spatial Test Suite (Owner: Vishwajeet | **Blocked by: SPATIAL-02**)
* `UI-02`: MapLibre Vector Map & Boundary Overlay (Owner: Vivek | **Blocked by: GATE-01**)
* `LEDGER-01`: Append-Only Event Dispatcher & Store (Owner: Vishwajeet | **Blocked by: GATE-01**)
* `INTEGRATION-01`: End-to-End 12-Step Integration Test (Owner: Ameya | **Blocked by: SPATIAL-03, UI-02, PACKET-01**)
* `INTEGRATION-02`: Offline Resilience & Airplane Mode Test (Owner: Ameya | **Blocked by: INTEGRATION-01**)
* `DEMO-01`: Record 3-Minute SIH Demo Video (Owner: Ameya | **Blocked by: INTEGRATION-02**)

---

## 2. Review Gatekeeper Matrix

| Task Domain | Required Primary Reviewer | Secondary Reviewer |
|---|---|---|
| Spatial & Database Schema | **Vishwajeet** | Person 5 |
| Product Text, PS-Fit & Disclaimers | **Ameya** | Person 6 |
| UI & Visual Design Components | **Vivek** | Person 4 |
