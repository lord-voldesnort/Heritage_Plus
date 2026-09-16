# CONTRIBUTING & BRANCHING GUIDELINES
## HERITAGE PULSE (हेरिटेज पल्स)
*Collaboration Rules for Team Sinister Six*

---

## 1. Core Principles

1. **`main` is the Stable Demo Branch**: Code on `main` must always build cleanly (`npm run build`) and pass tests (`npm run test`).
2. **Every Feature Requires a Task ID**: Do not write unassigned code. Every branch and pull request must reference an ID from `project/TASK_STATUS.json` (e.g. `SPATIAL-01`, `UI-01`).
3. **No Unapproved Core Changes**:
   * **Data Model / Schema / Spatial Math**: Requires **Vishwajeet**'s approval.
   * **Product Text / Status Labels / PS-Fit Language**: Requires **Ameya**'s approval.
   * **UI Components & Design System**: Requires **Vivek**'s approval.
4. **Zero Accusatory Strings**: All UI copy must pass `npm run contract:validate`.
5. **No Secrets or PII**: Never commit API keys, personal credentials, or real private citizen data.

---

## 2. Standard Branch Naming

* `foundation/site-schema`
* `spatial/point-in-polygon`
* `spatial/uncertainty-evaluator`
* `ui/mobile-capture`
* `ui/case-view`
* `reviewer/status-flow`
* `content/demo-scenarios`
* `content/ps-fit-and-judge-qa`

---

## 3. Commit Message Format

```text
[TASK-ID] Short summary of change

- What changed: Detailed bullet points
- How tested: Vitest / browser manual verification steps
```

Example:
```text
[SPATIAL-01] Implement point-in-polygon and distance calculations

- What changed: Added Turf.js boundary distance helper in spatialEngine.ts
- How tested: Ran npm run test, verified all 4 benchmark test points pass
```
