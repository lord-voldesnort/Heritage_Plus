# DEVELOPER ONBOARDING GUIDE
## HERITAGE PULSE (हेरिटेज पल्स)
*Quickstart & Workflow Protocols for Team Sinister Six*

---

## 1. Quickstart Commands

```bash
# 1. Install dependencies
npm install

# 2. Check Geometry Gate status
npm run gate:check

# 3. Check your team task status (or specific member)
npm run team:status
npm run team:status -- --member=vishwajeet
npm run team:status -- --member=ameya
npm run team:status -- --member=vivek

# 4. Validate task board consistency
npm run team:validate

# 5. Run test suite & contract scanner
npm run test
npm run contract:validate

# 6. Start local mobile-first development server
npm run dev
```

---

## 2. Developer Workflow

### Step 1: Check your Active Task
Run `npm run team:status -- --member=<your_id>` to view your current active task, dependencies, and any blockers.

### Step 2: Create a Dedicated Feature Branch
Branch from `main` using standard naming conventions:
* `foundation/<feature-name>` (e.g., `foundation/site-schema`)
* `spatial/<feature-name>` (e.g., `spatial/point-in-polygon`)
* `ui/<feature-name>` (e.g., `ui/mobile-capture`, `ui/case-view`)
* `reviewer/<feature-name>` (e.g., `reviewer/status-flow`)
* `content/<feature-name>` (e.g., `content/demo-scenarios`, `content/ps-fit`)

### Step 3: Verify Definition of Done
Before requesting a pull request review, inspect the Definition of Done in `project/TASK_STATUS.json` and `/docs/DEFINITIONS_OF_DONE.md`.

### Step 4: Request Lead Sign-Off
* **Schema/API/GIS changes**: Must be approved by **Vishwajeet**.
* **Product/Contract/PS-Fit changes**: Must be approved by **Ameya**.
* **UI/Component changes**: Must be approved by **Vivek**.

---

## 3. Reporting a Blocker
If you are blocked (e.g. by `GATE-01` or missing APIs):
1. Update `blockers` in `project/TASK_STATUS.json`.
2. Notify the task owner in team standup.
3. Run `npm run team:validate` to ensure JSON integrity.
