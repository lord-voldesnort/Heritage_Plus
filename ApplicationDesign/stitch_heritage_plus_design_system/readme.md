# Heritage Plus - Google Stitch UI/UX Handoff Package

Welcome to the **Google Stitch UI/UX Handoff Package** for Heritage Plus.

This package contains complete, rigorous specifications, design tokens, component hierarchies, and ready-to-use Google Stitch AI prompts so that you or Google Stitch can redesign or elevate the UI/UX while preserving 100% of the underlying business logic, spatial engine calculations, and statutory guardrails.

---

## 📂 Package Directory Structure

```
STITCH_HANDOFF/
├── README.md                     <- You are here: Package index & workflow guide
├── CURRENT_FUNCTIONALITY.md      <- Full audit of pages, components, roles & domain logic
├── STITCH_UI_UX_SPEC.md          <- Screen-by-screen layout, state & interaction specs
├── STITCH_DESIGN_GUIDE.md        <- Color tokens, typography, component styling & Stitch AI Prompts
├── screenshots/                  <- Reference UI screenshots & wireframe captures
└── assets/                       <- Design assets (icons, logo, branding)
    ├── icons/
    ├── logo/
    └── fonts/
```

---

## 🚀 How to Use this Package with Google Stitch

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
