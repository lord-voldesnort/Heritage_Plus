# Production Implementation Status

This document records what is implemented in the repository and what still requires external infrastructure or scientific validation. It is intentionally evidence-based.

| Area | Implemented in repository | Verification status |
|---|---|---|
| PostgreSQL/PostGIS schema | Sites, versioned geometries, observations, evidence, review events, users, jobs, provenance, datasets, experiments, models, benchmarks, exports, and audit logs | Schema compiles conceptually; live migration requires PostgreSQL/PostGIS |
| Authentication/RBAC | Session authentication, reviewer/admin roles, login throttling, server-side review authorization | Unit-tested; live DB integration pending |
| Evidence | Server-side SHA-256, magic-byte checks, path traversal defense, integrity check on retrieval | Unit/API tests exist; live storage deployment pending |
| GIS | PostGIS radius search, GeoJSON geometry API, Turf client/server spatial classification | Unit-tested; live PostGIS integration pending |
| EO discovery | Authenticated Sentinel-2 STAC discovery with timeout, provider errors, cloud filtering, and provenance | Unit-tested and public-provider smoke-tested |
| Temporal analysis | Median, MAD, baseline difference, robust score, explicit uncertainty | Unit-tested; raster input pipeline pending |
| Async jobs | Relational job lifecycle schema | Worker execution and queue infrastructure pending |
| Research reproducibility | Provenance schema and deterministic research-package manifest builder | Unit-tested; persistent export endpoint pending |
| Operations | Health, readiness, metrics, structured request logging, CI, backup script, restore runbook | Local checks pass; backup restore requires live PostgreSQL |

## Acceptance boundary

The repository must not be described as fully production-ready until a fresh deployment successfully completes migration, authentication, authorization, evidence upload, live PostGIS search, EO discovery and processing, review validation, export, backup, and restore. EO raster processing, Sentinel-1 SAR, object-storage deployment, worker execution, and expert validation remain external implementation stages.
