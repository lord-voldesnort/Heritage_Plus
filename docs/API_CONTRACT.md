# API CONTRACT SPECIFICATION
## HERITAGE PULSE (हेरिटेज पल्स)
*Owner: Vishwajeet | Reviewers: Ameya, Vivek*

---

## 1. Endpoints Overview

| Method | Endpoint | Description | Access Level |
|---|---|---|---|
| `GET` | `/api/v1/sites/:slug` | Fetch Site Context Card and active GeoJSON geometry | Public |
| `POST` | `/api/v1/observations` | Ingest field observation with photo upload and GPS metadata | Public |
| `GET` | `/api/v1/cases/:caseId` | Retrieve full Change Ledger timeline for a single case | Public |
| `GET` | `/api/v1/reviewer/cases` | List cases for reviewer triage queue | Reviewer |
| `POST` | `/api/v1/reviewer/cases/:caseId/action` | Record a reviewer action event into Change Ledger | Reviewer |
| `GET` | `/api/v1/cases/:caseId/packet` | Generate formatted HTML/PDF Reviewer Evidence Packet | Reviewer |

---

## 2. Request & Response Payloads

### 2.1 `POST /api/v1/observations`
**Request (Multipart Form or JSON)**:
```json
{
  "siteSlug": "shivneri-fort",
  "category": "POSSIBLE_CONSTRUCTION",
  "factualDescription": "Stone masonry trench excavated 12m from north bastion wall.",
  "latitude": 19.1982,
  "longitude": 73.8624,
  "gpsAccuracyMeters": 4.5,
  "timestamp": "2026-09-07T00:30:00.000Z",
  "privacyConsent": true,
  "photoBlob": "[optional binary base64 or multipart]"
}
```

**Response (`201 Created`)**:
```json
{
  "success": true,
  "caseId": "HP-MH-2026-0001",
  "spatialResult": {
    "classification": "POTENTIAL_ZONE_CONCERN",
    "distanceToBoundaryMeters": 0.0,
    "gpsAccuracyMeters": 4.5,
    "isUncertaintyOverlap": false,
    "statements": {
      "userReported": "Stone masonry trench excavated 12m from north bastion wall.",
      "gisCalculated": "Reported point appears within the active zone layer. GPS accuracy is ±4.5m.",
      "authorityNotice": "Indicative decision support only. Statutory determination requires verification by the Competent Authority."
    }
  },
  "ledgerEventId": "evt-01928a-9281"
}
```

### 2.2 `POST /api/v1/reviewer/cases/:caseId/action`
**Request**:
```json
{
  "action": "FIELD_VERIFICATION_RECOMMENDED",
  "reviewerNotes": "Ground inspection required by circle conservation assistant.",
  "reviewerRole": "Senior Heritage Curator"
}
```

**Response (`200 OK`)**:
```json
{
  "success": true,
  "caseId": "HP-MH-2026-0001",
  "updatedStatus": "FIELD_VERIFICATION_RECOMMENDED",
  "eventLoggedAt": "2026-09-07T00:35:00.000Z"
}
```
