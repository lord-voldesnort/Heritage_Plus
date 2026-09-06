# TEAM COLLABORATION & GOVERNANCE GUIDE
## HERITAGE PULSE (हेरिटेज पल्स)
*Team Sinister Six · SIH 2026*

---

## 1. Core Team Roles & Responsibilities

### Vishwajeet — Technical Foundation & Spatial Intelligence Lead
* **Primary Scope**: Data structures, spatial reasoning algorithms, geometry storage, Change Ledger event dispatcher, and automated test harnesses.
* **Review Authority**: Mandatory reviewer for all backend schemas, API payloads, and GIS mathematical logic.

### Ameya — Product, Workflow, Integration, Demo, & PS-Fit Lead
* **Primary Scope**: Product boundaries, user workflows, safe terminology, PS-fit strategy, demo scenario scripting, and final product integration.
* **Single Ownership**: `/docs/PS_FIT.md` and `/docs/JUDGE_QA.md`. Ameya must defend the PS positioning unprompted.
* **Review Authority**: Mandatory reviewer for any changes to product text, status names, disclaimers, or pitch materials.

### Vivek — Frontend, UX, & Visible Product Lead
* **Primary Scope**: Mobile-first app shell, routing, interactive capture forms, MapLibre map canvas, Change Ledger timeline, and Reviewer console.
* **Review Authority**: Mandatory reviewer for UI components, CSS styling, and client-side user experience flows.

### Supporting Contributors
* **Person 4 (UI Support)**: Touch feedback, mobile drawers, form validations (under Vivek).
* **Person 5 (GIS Support)**: GeoJSON boundary digitisation and test point curation (under Vishwajeet).
* **Person 6 (QA & Documentation Support)**: QA checklists, demo presentation support, field test records (under Ameya).

---

## 2. Collaboration Rules

1. **Never Bypass the Geometry Gate**: Do not implement spatial shortcuts or monument-centroid radii. All spatial development must branch after `GATE-01` passes.
2. **Never Commit Accusatory Terms**: All user-facing strings must be checked against `/src/shared/constants/bannedLanguage.ts`.
3. **Small, Atomic Commits**: Keep task branches focused on a single task ID (e.g. `feat/UI-01-mobile-capture`).
