# DATA MODEL & SHARED SCHEMA
## HERITAGE PULSE (हेरिटेज पल्स)
*Owner: Vishwajeet | Reviewers: Ameya, Vivek*

---

## 1. Core Entity Relationship Model

Heritage Pulse is structured around 5 primary data contracts:

```
[ SiteRecord ] 1 ---- * [ GeometryRecord ]
      |
      | 1
      |
      *
[ ObservationRecord ] 1 ---- * [ EvidenceRecord ]
      |
      | 1
      |
      *
[ ReviewEvent ] (Append-only Change Ledger Stream)
```

---

## 2. Entity Definitions

### 2.1 `SiteRecord`
Represents the target protected heritage site.
* `siteId`: string (UUID)
* `slug`: string (`"shivneri-fort"`)
* `name`: string (`"Shivneri Fort"`)
* `vernacularName`: string (`"शिवनेरी किल्ला"`)
* `location`: `{ state: string, district: string, centroid: [number, number] }`
* `significanceParagraph`: string (Verified cultural context)
* `representativeImageUrl`: string
* `sourceAgency`: string (`"Archaeological Survey of India / State Dept"`)

### 2.2 `GeometryRecord`
Represents a versioned, source-documented boundary geometry.
* `geometryId`: string (UUID)
* `siteId`: string (UUID)
* `versionLabel`: string (`"v1.0-pilot"`)
* `geojson`: GeoJSON.MultiPolygon | GeoJSON.Polygon
* `sourceDocumentOrUrl`: string
* `captureDate`: string (ISO date)
* `limitationNote`: string
* `governanceState`: `'SOURCE_LOGGED' | 'DRAFT' | 'UNDER_REVIEW' | 'PILOT_PUBLISHED' | 'REPLACED' | 'RETIRED'`
* `layerConfidenceScore`: number ($0.00 - 1.00$)

### 2.3 `ObservationRecord`
Represents an objective on-ground field observation.
* `observationId`: string (UUID)
* `caseId`: string (`"HP-MH-2026-0001"`)
* `siteId`: string (UUID)
* `geometryId`: string (UUID)
* `reporterType`: `'VISITOR' | 'RESIDENT' | 'STUDENT' | 'VOLUNTEER'`
* `category`: ObservationTypeEnum
* `factualDescription`: string
* `latitude`: number
* `longitude`: number
* `gpsAccuracyMeters`: number
* `observedTimestamp`: string (ISO 8601)
* `computedClassification`: SpatialClassificationEnum
* `distanceToBoundaryMeters`: number | null
* `spatialReasoningExplanation`: string
* `currentStatus`: CaseStatusEnum

### 2.4 `EvidenceRecord`
Represents an image or document attached to an observation.
* `evidenceId`: string (UUID)
* `observationId`: string (UUID)
* `fileUrl`: string
* `fileMimeType`: string
* `fileSizeBytes`: number
* `sha256Checksum`: string (64 hex characters)
* `uploadTimestamp`: string (ISO 8601)

### 2.5 `ReviewEvent`
Represents an immutable event in the Change Ledger.
* `eventId`: string (UUID)
* `caseId`: string
* `timestamp`: string (ISO 8601)
* `eventType`: `'OBSERVATION_CREATED' | 'LOCATION_CAPTURED' | 'SPATIAL_CALCULATED' | 'EVIDENCE_ATTACHED' | 'REVIEW_ACTION_RECORDED'`
* `actorRole`: string (`"Observer"` or `"Heritage Curator"`)
* `summary`: string
* `actionTaken`: ReviewActionEnum | null
* `reviewerNotes`: string | null
* `resultingStatus`: CaseStatusEnum
