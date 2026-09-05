# TECHNICAL REQUIREMENTS DOCUMENT (TRD)
## HERITAGE GUARD (हेरिटेज गार्ड)
### Provenance-Aware Spatial Reasoning & Evidence Continuity Infrastructure
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Team Sinister Six*

---

## 1. System Architecture & Topology

Heritage Guard is designed with a decoupled, resilient architecture engineered for low-bandwidth rural field operations, rigorous geospatial computing, and cryptographic auditability.

```
+---------------------------------------------------------------------------------------------------------+
|                                      HERITAGE GUARD SYSTEM TOPOLOGY                                     |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  CLIENT TIER (Mobile PWA / Desktop Web)                                                                  |
|  +---------------------------------------------------------------------------------------------------+  |
|  |  React 19 + Vite + Tailwind CSS                                                                   |  |
|  |  ├── UI Components (Heritage Twin, Living Practice Cards, Field Studio, Curator Console)           |  |
|  |  ├── Map Engine: Leaflet.js / MapLibre GL + Custom Vector Tile Layer                             |  |
|  |  ├── Client GIS Engine: Turf.js (Pre-flight polygon calculation & buffer verification)            |  |
|  |  ├── Offline Engine: Dexie.js (IndexedDB) + PWA ServiceWorker (CacheStorage)                      |  |
|  |  └── Cryptographic Hashing: Web Crypto API (SubtleCrypto SHA-256 image & metadata digest)          |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                  |                                                      |
|                                        HTTPS / WSS / REST API                                           |
|                                                  v                                                      |
|  APPLICATION SERVICES TIER (Node.js / Express or Python FastAPI)                                        |
|  +---------------------------------------------------------------------------------------------------+  |
|  |  API Gateway & Auth Middleware (Role-based access: Public, Observer, Curator, Admin)              |  |
|  |  ├── Provenance & PII Sanitizer: ExifTool / Sharp (EXIF sanitization, facial/license blur)         |  |
|  |  ├── Geospatial Service: PostGIS / Shapely (Authoritative spatial reasoning engine)                |  |
|  |  ├── Change Ledger Service: Event stream recording, before/after temporal linking                 |  |
|  |  ├── Evidence Packaging Service: PDFKit / Puppeteer (Official ASI/District Safeguarding Dossiers) |  |
|  |  └── Sync Dispatcher: Idempotent queue consumer handling offline re-connections                   |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                               |                                      |                                  |
|                               v                                      v                                  |
|  PERSISTENCE TIER                                   OBJECT STORAGE                                      |
|  +-----------------------------------------------+  +------------------------------------------------+  |
|  |  PostgreSQL 16 + PostGIS 3.4                  |  |  MinIO / AWS S3 Compatible Storage             |  |
|  |  ├── Spatial GiST Indexes (Polygons, Buffers) |  |  ├── Immutable SHA-256 Content Addressed Media |  |
|  |  ├── Versioned Layer Geometries               |  |  └── Exported PDF Safeguarding Dossiers        |  |
|  |  ├── Immutable Append-Only Ledger Events      |  +------------------------------------------------+  |
|  |  └── Cryptographic Audit Logs                 |                                                      |
|  +-----------------------------------------------+                                                      |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Provenance-Aware Spatial Reasoning Specification

### 2.1 Problem Formulation
Under the **Ancient Monuments and Archaeological Sites and Remains (AMASR) (Amendment and Validation) Act, 2010**:
1. **Prohibited Area**: 100 meters in all directions from the protected monument boundary. No construction permitted.
2. **Regulated Area**: 200 meters in all directions beyond the prohibited area (total 300 meters from boundary). Regulated construction subject to Competent Authority permission.

Most applications use a circular radius from a centroid point $(x_0, y_0)$. For irregular archaeological sites (e.g., massive fort perimeters or multi-hectare ruins), centroid calculations generate massive false-positive and false-negative errors.

Furthermore, consumer smartphone GPS hardware reports a horizontal circular error ($r_{gps}$) ranging between $3\text{ m}$ to $50\text{ m}$. **Any point close to a boundary edge within this error margin cannot be classified with certainty.**

### 2.2 Mathematical Model
Let:
* $\mathcal{M} \subset \mathbb{R}^2$ be the MultiPolygon representing the physical monument core.
* $\mathcal{P}_{100} = \text{Buffer}(\mathcal{M}, 100\text{m})$ be the statutory prohibited zone MultiPolygon.
* $\mathcal{R}_{200} = \text{Buffer}(\mathcal{M}, 300\text{m}) \setminus \mathcal{P}_{100}$ be the statutory regulated zone MultiPolygon.
* $C_{obs} = (\phi, \lambda)$ be the observed latitude and longitude.
* $r_{gps} \in \mathbb{R}^+$ be the reported GPS accuracy radius in meters (68% confidence circle).
* $\mathcal{D}(C_{obs}, r_{gps}) = \{ x \in \mathbb{R}^2 \mid \|x - C_{obs}\| \le r_{gps} \}$ be the device uncertainty disk.
* $\partial \mathcal{P}_{100}$ and $\partial \mathcal{R}_{200}$ denote the boundary perimeters of the statutory zones.
* $\delta(C_{obs}, \partial \mathcal{P}) = \inf_{y \in \partial \mathcal{P}} d_{geodesic}(C_{obs}, y)$ be the minimum geodesic distance from the observation point to the boundary perimeter.
* $\sigma_{tolerance}$ be the surveying safety margin ($5.0\text{ m}$).

### 2.3 Deterministic Spatial Decision Matrix

```
                          [ Input: Coordinate C, Accuracy r_gps, Layer V ]
                                                  |
                                                  v
                                     [ Check: Layer Confidence? ]
                                      /                        \
                             < 0.70  /                          \ >= 0.70
                                    v                            v
                      [ Result: SRC_INSUFFICIENT ]     [ Check: r_gps > 35m? ]
                                                        /                  \
                                                Yes    /                    \ No
                                                      v                      v
                                            [ Result: LOC_UNCERTAIN ]   [ Compute delta to Prohibited & Regulated ]
                                                                                   |
                                                                                   v
                                                                   [ Is delta <= r_gps + sigma_tolerance? ]
                                                                    /                                    \
                                                            Yes    /                                      \ No
                                                                  v                                        v
                                                      [ Result: BOUNDARY_UNCERTAIN ]           [ Point-in-Polygon Test ]
                                                                                                /          |          \
                                                                                       Inside  /    Inside |           \ Outside
                                                                                   Prohibited /  Regulated |            \ Both
                                                                                             v             v             v
                                                                                    [ INSIDE_100M ] [ INSIDE_200M ] [ OUTSIDE_ZONES ]
```

### 2.4 Algorithmic Implementation (TypeScript / Turf.js)

```typescript
import * as turf from '@turf/turf';

export interface SpatialReasoningInput {
  longitude: number;
  latitude: number;
  accuracyMeters: number;
  layerVersion: {
    layerVersionId: string;
    sourceConfidence: number;
    prohibitedGeoJson: GeoJSON.MultiPolygon;
    regulatedGeoJson: GeoJSON.MultiPolygon;
  };
}

export interface SpatialReasoningOutput {
  statusCode: 'SRC_INSUFFICIENT' | 'LOC_UNCERTAIN' | 'BOUNDARY_UNCERTAIN' | 'INSIDE_PROHIBITED_ZONE' | 'INSIDE_REGULATED_ZONE' | 'OUTSIDE_STATUTORY_ZONES';
  badgeTitle: string;
  statementCitizen: string;
  distanceToProhibitedBoundaryMeters: number;
  isUncertaintyOverlap: boolean;
  requiresAuthorityVerification: boolean;
}

export function evaluateSpatialProximity(input: SpatialReasoningInput): SpatialReasoningOutput {
  const { longitude, latitude, accuracyMeters, layerVersion } = input;
  const point = turf.point([longitude, latitude]);

  // Check 1: Layer Source Integrity
  if (layerVersion.sourceConfidence < 0.70) {
    return {
      statusCode: 'SRC_INSUFFICIENT',
      badgeTitle: 'Sourced Boundary Insufficient',
      statementCitizen: 'Active boundary dataset lacks required confidence score. Field verification needed.',
      distanceToProhibitedBoundaryMeters: -1,
      isUncertaintyOverlap: false,
      requiresAuthorityVerification: true,
    };
  }

  // Check 2: High GPS Error
  if (accuracyMeters > 35.0) {
    return {
      statusCode: 'LOC_UNCERTAIN',
      badgeTitle: 'Location Inconclusive',
      statementCitizen: `Device reported an accuracy error of ±${accuracyMeters.toFixed(1)}m. Re-positioning required.`,
      distanceToProhibitedBoundaryMeters: -1,
      isUncertaintyOverlap: true,
      requiresAuthorityVerification: true,
    };
  }

  // Calculate Distance to Prohibited Boundary (100m)
  const prohibitedLines = turf.polygonToLine(layerVersion.prohibitedGeoJson);
  const distanceKm = turf.pointToLineDistance(point, prohibitedLines, { units: 'kilometers' });
  const distanceMeters = distanceKm * 1000;

  const isInsideProhibited = turf.booleanPointInPolygon(point, layerVersion.prohibitedGeoJson);
  const isInsideRegulated = turf.booleanPointInPolygon(point, layerVersion.regulatedGeoJson);

  // Check 3: Boundary Uncertainty Overlap
  const marginTolerance = 5.0; // 5 meter buffer
  if (distanceMeters <= (accuracyMeters + marginTolerance) && !isInsideProhibited) {
    return {
      statusCode: 'BOUNDARY_UNCERTAIN',
      badgeTitle: 'Boundary Overlap (Uncertain)',
      statementCitizen: `Point is ${distanceMeters.toFixed(1)}m from the 100m Prohibited line, which intersects device accuracy range (±${accuracyMeters.toFixed(1)}m).`,
      distanceToProhibitedBoundaryMeters: distanceMeters,
      isUncertaintyOverlap: true,
      requiresAuthorityVerification: true,
    };
  }

  // Check 4: Strict Prohibited Zone
  if (isInsideProhibited) {
    return {
      statusCode: 'INSIDE_PROHIBITED_ZONE',
      badgeTitle: 'Within 100m Prohibited Buffer',
      statementCitizen: 'Observation coordinates fall strictly within the statutory 100m Prohibited Buffer.',
      distanceToProhibitedBoundaryMeters: 0,
      isUncertaintyOverlap: false,
      requiresAuthorityVerification: true,
    };
  }

  // Check 5: Strict Regulated Zone
  if (isInsideRegulated) {
    return {
      statusCode: 'INSIDE_REGULATED_ZONE',
      badgeTitle: 'Within 200m Regulated Buffer',
      statementCitizen: 'Observation coordinates fall strictly within the statutory 200m Regulated Buffer.',
      distanceToProhibitedBoundaryMeters: distanceMeters,
      isUncertaintyOverlap: false,
      requiresAuthorityVerification: true,
    };
  }

  // Check 6: Outside Buffer
  return {
    statusCode: 'OUTSIDE_STATUTORY_ZONES',
    badgeTitle: 'Outside Known Statutory Zones',
    statementCitizen: `Observation is ${distanceMeters.toFixed(1)}m outside statutory preservation buffers.`,
    distanceToProhibitedBoundaryMeters: distanceMeters,
    isUncertaintyOverlap: false,
    requiresAuthorityVerification: false,
  };
}
```

---

## 3. Cryptographic Provenance & Hash Chain

To ensure court-admissible, tamper-evident evidence packets, each submission executes the following cryptographic verification pipeline:

```
[ Camera Raw Binary Blob ] --------> SubtleCrypto.digest('SHA-256') ---------> MediaSHA256 (64 hex)
                                                                                     |
[ Canonical JSON Payload: ]                                                          |
{ lat, lon, acc, cat, time } ------> SubtleCrypto.digest('SHA-256') ---------> PayloadSHA256 (64 hex)
                                                                                     |
                                                                                     v
[ Composite Verification Digest ] = SHA256( PayloadSHA256 + MediaSHA256 + LayerVersionID )
```

### Verification Guarantee:
* If a single byte of the observation text, GPS telemetry, or media artifact is edited in the database, the composite digest fails verification.
* Any updates to official boundaries create a new immutable `layer_version_id`, ensuring historical observations remain linked to the spatial reality in effect on the date of observation.

---

## 4. Offline Synchronization & PWA Caching Engine

### 4.1 Client IndexedDB Store Structure (Dexie.js)
The client maintains a local-first store for rural field conditions:

* `draft_observations`:
  * `id`: Auto-increment local ID.
  * `temp_uuid`: Client-generated UUIDv4.
  * `cluster_id`: Target heritage cluster UUID.
  * `photo_blob`: Compressed image binary ($< 2\text{MB}$, WebP/JPEG).
  * `telemetry`: `{ latitude, longitude, accuracy_m, altitude_m, timestamp }`.
  * `category`: Enum string.
  * `neutral_notes`: Text description.
  * `sync_status`: `'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED'`.
  * `retry_count`: Integer.
* `cached_clusters`:
  * `cluster_id`: Primary key.
  * `twin_bundle`: Complete offline JSON bundle (history, vernacular names, GeoJSON boundaries, practice cards).

### 4.2 Sync Protocol Rules
1. **Idempotency Guarantee**: Every sync request sends header `Idempotency-Key: <temp_uuid>`. The server uses this key to prevent duplicate insertion if network drops midway.
2. **Network Transition Listener**:
   ```javascript
   window.addEventListener('online', () => {
     heritageSyncWorker.flushQueue();
   });
   ```
3. **Optimistic UI**: The local UI reflects the observation immediately in the personal feed with a subtle `Draft Queued (Pending Upload)` amber indicator. Once synced, it transitions to `Verified & Sealed`.

---

## 5. RESTful API Specification

### 5.1 Endpoints Overview

| Method | Endpoint | Description | Auth Level |
|---|---|---|---|
| `GET` | `/api/v1/clusters/:slug` | Fetch complete 5-layer Heritage Twin bundle. | Public |
| `GET` | `/api/v1/clusters/:id/spatial-layer` | Fetch active GeoJSON boundaries & source metadata. | Public |
| `POST` | `/api/v1/observations` | Ingest new field observation + photo multipart. | Public / Observer |
| `GET` | `/api/v1/observations/:trackingCode` | Check public status and 3-statement reasoning. | Public |
| `GET` | `/api/v1/curator/inbox` | List observations for triage review. | Curator Only |
| `PATCH`| `/api/v1/curator/reviews/:id` | Update status, add notes, or flag referral. | Curator Only |
| `GET` | `/api/v1/curator/dossier/:id/pdf` | Stream official signed PDF Safeguarding Dossier. | Curator Only |

### 5.2 Payload Contracts

#### `POST /api/v1/observations`
**Headers**: `Content-Type: multipart/form-data`, `Idempotency-Key: 8f4a12ec-3904-4df8-9290-7f23a7e58912`

**Form Body**:
* `cluster_id`: `"e6b7d291-72f1-4db8-b59a-1158a1290bb3"`
* `layer_version_id`: `"c144e456-9781-4b1a-9653-83210988e001"`
* `category`: `"MASONRY_DISPLACEMENT"`
* `observation_notes`: `"Displaced ashlar stone blocks noted on outer plinth near north-east stepwell entry."`
* `latitude`: `27.009312`
* `longitude`: `76.606245`
* `gps_accuracy_meters`: `5.8`
* `client_captured_at`: `"2026-09-05T09:00:22.000Z"`
* `media_file`: `[binary image/webp]`

**Success Response (`201 Created`)**:
```json
{
  "success": true,
  "caseTrackingCode": "HG-RAJ-2026-0089",
  "observationId": "a90b4109-d7b3-4f93-868c-4a30e801c8bb",
  "spatialReasoning": {
    "statusCode": "INSIDE_PROHIBITED_ZONE",
    "badgeTitle": "Within 100m Prohibited Buffer",
    "distanceToProhibitedBoundaryMeters": 0.0,
    "accuracyMarginMeters": 5.8,
    "statements": {
      "userReported": "Displaced ashlar stone blocks noted on outer plinth near north-east stepwell entry.",
      "gisCalculated": "Coordinates fall within the statutory 100m Prohibited Zone as per ASI Notification SO 1928.",
      "authorityReservation": "Final structural and administrative determination requires verification by the Competent Authority."
    }
  },
  "provenanceDigest": {
    "payloadSha256": "4b6118d0988019b88937b2d561fae4eec49e29a98efae74be6bbbe1215b2ec67",
    "mediaSha256": "f5a772f9136ff93d6d06159c3a3c2e176b6d5f7823f66c9ff99a4e8d3509b276",
    "sealedAt": "2026-09-05T09:00:23.120Z"
  }
}
```

---

## 6. Official Dossier Generation Specification

When a curator approves an escalation, the backend compiles a standardized **Institutional Safeguarding Dossier (JSON-LD + Vector PDF)**:

1. **Header Block**: Emblems, Heritage Guard National Intelligence Seal, Case Tracking ID, Date of Record.
2. **Cluster Context**: National monument code, vernacular name, state/district jurisdiction, active gazette reference.
3. **Spatial Telemetry**: Point coordinates, GPS error radius, minimum distance to prohibited line, map snapshot with overlay polygon and accuracy disk.
4. **Physical Evidence**: High-resolution image, EXIF metadata dump, SHA-256 checksum, automatic privacy redaction certificate.
5. **Audit Chain**: Sequential log of observer timestamp, ingestion timestamp, curator ID, and referral action.
6. **QR Code Verification**: Direct verification link pointing to the cryptographic digest endpoint.
