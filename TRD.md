# TECHNICAL REQUIREMENTS DOCUMENT (TRD)
## HERITAGE PULSE (हेरिटेज पल्स)
### Provenance-Aware, Uncertainty-Driven Change Ledger Infrastructure
**Smart India Hackathon 2026 · Heritage & Culture · Problem Statement PS 26197**
*Team Sinister Six*

---

## 1. System Architecture & Topology

Heritage Pulse is designed with a mobile-first, decoupled architecture for reliable field capture, spatial reasoning, and audit-ready change ledger tracking.

```
+---------------------------------------------------------------------------------------------------------+
|                                      HERITAGE PULSE SYSTEM TOPOLOGY                                     |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  CLIENT TIER (Mobile Web PWA)                                                                           |
|  +---------------------------------------------------------------------------------------------------+  |
|  |  React + TypeScript + Tailwind CSS                                                                |  |
|  |  ├── UI Components (Site Context Card, Field Capture Studio, Change Ledger, Reviewer Console)    |  |
|  |  ├── Map Engine: MapLibre GL / Leaflet.js                                                         |  |
|  |  ├── Client GIS Engine: Turf.js (Point-in-polygon, boundary distance, accuracy circle overlap)   |  |
|  |  └── Local Storage / Offline Draft Queue (IndexedDB / LocalStorage)                               |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                                                  |                                                      |
|                                        REST API / HTTPS                                                 |
|                                                  v                                                      |
|  APPLICATION & SERVICE TIER (Node.js / Express)                                                          |
|  +---------------------------------------------------------------------------------------------------+  |
|  |  API Gateway & Role Authentication (Reporter, Reviewer, Administrator)                            |  |
|  |  ├── Geometry Governance Service (Source versioning, approval states, limitation notes)           |  |
|  |  ├── Spatial Reasoning Engine (PostGIS / Turf.js spatial calculation verification)               |  |
|  |  ├── Change Ledger Engine (Append-only event stream recording)                                    |  |
|  |  └── Reviewer Packet Generator (HTML / PDF Reviewer Packet compilation)                           |  |
|  +---------------------------------------------------------------------------------------------------+  |
|                               |                                      |                                  |
|                               v                                      v                                  |
|  PERSISTENCE TIER                                   OBJECT STORAGE                                      |
|  +-----------------------------------------------+  +------------------------------------------------+  |
|  |  PostgreSQL 15+ / PostGIS 3.3+               |  |  Local / MinIO Object Storage                  |  |
|  |  ├── Sites & Geometry Records                 |  |  ├── Evidence Photographs & Thumbnails         |  |
|  |  ├── Observation & Evidence Records           |  |  └── Exported Reviewer Packets (PDF/HTML)      |  |
|  |  └── Append-Only Review Event Ledger          |  +------------------------------------------------+  |
|  +-----------------------------------------------+                                                      |
+---------------------------------------------------------------------------------------------------------+
```

---

## 2. Spatial Uncertainty Model & Mathematical Rules

### 2.1 Problem Statement
Consumer smartphone GPS sensors report horizontal accuracy ($r_{gps}$) ranging from $3\text{m}$ to $> 40\text{m}$. For protected heritage sites with irregular boundaries, any point whose uncertainty circle intersects a boundary edge cannot be classified with certainty.

### 2.2 Mathematical Evaluation Engine
Let:
* $\mathcal{G}_{site} \subset \mathbb{R}^2$ be the source-labelled GeoJSON MultiPolygon representing the protected site/zone.
* $C_{obs} = (\phi, \lambda)$ be the observed latitude and longitude coordinate.
* $r_{gps} \in \mathbb{R}^+$ be the device-reported horizontal accuracy in meters.
* $\mathcal{D}(C_{obs}, r_{gps}) = \{ x \in \mathbb{R}^2 \mid \|x - C_{obs}\| \le r_{gps} \}$ be the uncertainty disk.
* $\delta(C_{obs}, \partial \mathcal{G}_{site})$ be the minimum distance from observation point $C_{obs}$ to boundary perimeter $\partial \mathcal{G}_{site}$.

### 2.3 Spatial Classification Rules

```typescript
import * as turf from '@turf/turf';

export interface SpatialEvaluationInput {
  latitude: number;
  longitude: number;
  gpsAccuracyMeters: number;
  siteGeometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
  layerConfidenceScore: number;
}

export interface SpatialEvaluationOutput {
  classification: 
    | 'POTENTIAL_ZONE_CONCERN' 
    | 'NO_SPATIAL_CONCERN' 
    | 'LOCATION_UNCERTAIN' 
    | 'CLASSIFICATION_UNAVAILABLE';
  distanceToBoundaryMeters: number;
  explanation: string;
  refusalToOverclaimReason?: string;
}

export function evaluateSpatialUncertainty(input: SpatialEvaluationInput): SpatialEvaluationOutput {
  const { latitude, longitude, gpsAccuracyMeters, siteGeometry, layerConfidenceScore } = input;
  const point = turf.point([longitude, latitude]);

  // Test 1: Geometry Governance Check
  if (layerConfidenceScore < 0.70) {
    return {
      classification: 'CLASSIFICATION_UNAVAILABLE',
      distanceToBoundaryMeters: -1,
      explanation: 'Source geometry is unreviewed or below required confidence score. Source review required.',
      refusalToOverclaimReason: 'Unapproved geometry layer'
    };
  }

  // Test 2: Degraded GPS Error Check
  if (gpsAccuracyMeters > 35.0) {
    return {
      classification: 'LOCATION_UNCERTAIN',
      distanceToBoundaryMeters: -1,
      explanation: `Device horizontal GPS accuracy error (±${gpsAccuracyMeters.toFixed(1)}m) is too large for dependable calculation.`,
      refusalToOverclaimReason: 'GPS error > 35m'
    };
  }

  // Calculate Distance to Boundary Line
  const boundaryLines = turf.polygonToLine(siteGeometry);
  const distanceKm = turf.pointToLineDistance(point, boundaryLines, { units: 'kilometers' });
  const distanceMeters = distanceKm * 1000;
  const isInside = turf.booleanPointInPolygon(point, siteGeometry);

  // Test 3: Accuracy Circle Overlap Check
  if (distanceMeters <= gpsAccuracyMeters) {
    return {
      classification: 'LOCATION_UNCERTAIN',
      distanceToBoundaryMeters: Math.round(distanceMeters * 10) / 10,
      explanation: `The GPS accuracy circle (±${gpsAccuracyMeters.toFixed(1)}m) overlaps the zone boundary (${distanceMeters.toFixed(1)}m distance). The application cannot make a dependable zone classification.`,
      refusalToOverclaimReason: 'Accuracy circle overlaps boundary'
    };
  }

  // Test 4: Point Clearly Inside
  if (isInside) {
    return {
      classification: 'POTENTIAL_ZONE_CONCERN',
      distanceToBoundaryMeters: 0,
      explanation: `Reported point appears within the active zone layer. GPS accuracy is ±${gpsAccuracyMeters.toFixed(1)}m. This is not a legal finding; authority verification is required.`
    };
  }

  // Test 5: Point Clearly Outside
  return {
    classification: 'NO_SPATIAL_CONCERN',
    distanceToBoundaryMeters: Math.round(distanceMeters * 10) / 10,
    explanation: `No spatial concern indicated by this layer (point is ${distanceMeters.toFixed(1)}m outside). This does not prove absence of other issues.`
  };
}
```

---

## 3. Data Contract & Schema Specification

The Change Ledger utilizes 5 primary entities:

### 3.1 `SiteRecord`
* `site_id`: UUID
* `slug`: String (`"shivneri-fort"`)
* `name`: String (`"Shivneri Fort"`)
* `description`: Text (Verified significance paragraph)
* `cultural_context`: Text
* `source_agency`: String
* `source_date`: Date
* `is_active`: Boolean

### 3.2 `GeometryRecord`
* `geometry_id`: UUID
* `site_id`: UUID (FK)
* `geojson_geometry`: Geometry (MultiPolygon)
* `crs`: String (`"EPSG:4326"`)
* `source_document_url`: String
* `capture_date`: Date
* `reviewer_name`: String
* `limitation_note`: Text
* `version_label`: String (`"v1.0-pilot"`)
* `governance_state`: Enum (`SOURCE_LOGGED`, `DRAFT`, `UNDER_REVIEW`, `PILOT_PUBLISHED`, `REPLACED`, `RETIRED`)

### 3.3 `ObservationRecord`
* `observation_id`: UUID
* `case_id`: String (`"HP-MH-2026-0001"`)
* `site_id`: UUID (FK)
* `reporter_type`: Enum (`VISITOR`, `RESIDENT`, `STUDENT`, `NGO_VOLUNTEER`)
* `category`: Enum (`POSSIBLE_CONSTRUCTION`, `POSSIBLE_ENCROACHMENT`, `PHYSICAL_DAMAGE`, `DUMPING_OR_WASTE`, `BLOCKED_ACCESS`, `ALTERATION`, `VISUAL_OBSTRUCTION`, `OTHER`)
* `factual_description`: Text
* `latitude`: Double
* `longitude`: Double
* `gps_accuracy_meters`: Double
* `timestamp`: TIMESTAMPTZ
* `privacy_consent`: Boolean

### 3.4 `EvidenceRecord`
* `evidence_id`: UUID
* `observation_id`: UUID (FK)
* `photo_url`: String
* `upload_timestamp`: TIMESTAMPTZ
* `file_metadata`: JSONB (MIME, size, width, height)
* `sha256_checksum`: String (64 hex)

### 3.5 `ReviewEvent`
* `event_id`: UUID
* `observation_id`: UUID (FK)
* `reviewer_role`: String (`"Heritage Curator / Reviewer"`)
* `timestamp`: TIMESTAMPTZ
* `action`: Enum (`SUBMITTED`, `ADDITIONAL_INFO_NEEDED`, `FIELD_VERIFICATION_RECOMMENDED`, `REFERRED_MANUALLY`, `CLOSED_INSUFFICIENT_LOCATION`, `CLOSED_DUPLICATE`, `CLOSED_REVIEWED`)
* `reviewer_notes`: Text
* `next_status`: String

---

## 4. API Endpoints Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/sites/shivneri-fort` | Fetch site context card & active geometry. |
| `POST` | `/api/v1/observations` | Submit field observation with photo upload. |
| `GET` | `/api/v1/cases/:caseId` | Retrieve complete Change Ledger timeline for a case. |
| `GET` | `/api/v1/reviewer/cases` | List cases for reviewer assessment console. |
| `POST` | `/api/v1/reviewer/cases/:caseId/action` | Append reviewer action event to Change Ledger. |
| `GET` | `/api/v1/cases/:caseId/packet` | Generate & download exportable Reviewer Evidence Packet. |
