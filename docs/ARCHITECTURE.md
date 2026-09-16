# ARCHITECTURE & SYSTEM DESIGN
## HERITAGE PULSE (हेरिटेज पल्स)
*Technical Lead: Vishwajeet | Reviewers: Ameya, Vivek*

---

## 1. System Overview

Heritage Pulse is structured as a mobile-first, resilient web application designed for fast field capture in low-bandwidth rural conditions and verifiable geospatial review.

```
+---------------------------------------------------------------------------------------------------+
|                                     CLIENT TIER (Mobile Web PWA)                                  |
|  React 18 + TypeScript + Vite + Tailwind CSS                                                      |
|  ├── MapLibre GL JS (Open-source vector tile renderer with free tile source)                       |
|  ├── Turf.js (Geospatial Point-in-Polygon & geodesic distance calculations)                      |
|  ├── Features: SiteContext, FieldCapture, SpatialResult, ChangeLedger, ReviewerWorkflow, Packet  |
|  └── Local Persistence: IndexedDB / Controlled JSON file store                                   |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                            REST / HTTPS
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                 APPLICATION & SERVICES TIER                                       |
|  Node.js + Express API (or modular client-side service layer in V1 prototype)                     |
|  ├── Spatial Reasoning Service: Evaluates PIP, perimeter distance, and GPS error disk overlap      |
|  ├── Change Ledger Engine: Append-only event store preventing history modification               |
|  ├── Provenance & Governance Validator: Checks layer approval state before computing             |
|  └── Reviewer Packet Generator: Assembles printable HTML / PDF evidence dossiers                  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      PERSISTENCE TIER                                             |
|  • V1 Prototype: Controlled JSON / GeoJSON file store (/src/shared/mock-data)                     |
|    (Marked as a temporary development substitute until PostgreSQL/PostGIS connection is active)  |
|  • Production Target: PostgreSQL 15+ with PostGIS 3.3+ spatial extension                         |
|  • Media Storage: Local filesystem under /uploads (swap point for MinIO / AWS S3 in production)   |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Key Architectural Decisions

1. **Client-Side Spatial Verification (Turf.js)**:
   Geospatial reasoning executes client-side as well as server-side, enabling instantaneous feedback even in intermittent field connectivity.
2. **No Centroid Radius Calculations**:
   All boundary evaluations calculate true minimum geodesic distances to MultiPolygon perimeter line strings (`turf.polygonToLine`). Circular center radii are strictly prohibited.
3. **Controlled V1 File Store vs. Production PostGIS**:
   For rapid prototype validation, a deterministic GeoJSON store is provided. `BACKEND_SCHEMA.sql` contains the production PostGIS table definitions and spatial triggers.
4. **Append-Only Event Sourcing for Change Ledger**:
   Any updates, additional notes, or status changes generate new `ReviewEvent` records with distinct timestamps. Historical observations are never updated in place.
