# A7 Evidence Integrity & Canonical Reviewer Packet Specification

**Heritage Pulse · SIH 2026 Prototype**  
**Monument**: Fort of Shivner (Shivneri Fort) [MUMMH015], Junnar, Pune District, Maharashtra  
**Milestone**: A7 (Evidence Integrity & Canonical Reviewer Packet Integrity)  
**Status**: COMPLETE & VERIFIED  

---

## 1. Executive Summary

Milestone A7 establishes the architectural guarantees for **Evidence Integrity** and the **Canonical Reviewer Packet Export**. 

Heritage Pulse complies with rigorous digital evidence principles:
1. Every evidence item is strictly scoped to its owning case with technical metadata and a cryptographic SHA-256 checksum.
2. The Reviewer Packet is compiled through exactly **one canonical builder** (`buildCanonicalReviewerPacketData`) directly from persisted `CaseRecord` data.
3. Zero downstream spatial recalculation is performed in reviewer or packet presentation layers.
4. Source provenance, geometry gate status, and verbatim statutory disclaimers are prominently displayed.

---

## 2. Evidence Integrity Architecture

### 2.1 `EvidenceRecord` Data Model
```typescript
interface EvidenceRecord {
  evidenceId: string;       // Unique UUID v4
  observationId: string;    // Associated observation ID
  fileUrl: string;          // Binary preview URL (blob: / sample URL)
  fileMimeType: string;     // MIME type (e.g. image/jpeg, image/png)
  fileSizeBytes: number;    // File size in bytes
  sha256Checksum: string;   // Cryptographic SHA-256 digest
  uploadTimestamp: string;  // ISO 8601 upload timestamp
}
```

### 2.2 Evidence Guarantees
- **Case Isolation**: Evidence records are strictly held within `caseRecord.evidenceList`. Evidence cannot leak across or become attached to another case.
- **Checksum Durability**: SHA-256 checksums persist through browser storage rehydration and are included in the exported Reviewer Packet.
- **Missing Evidence Handling**: When an observation is logged without an image (e.g., Category: Alteration with text description only), `evidenceList` remains an empty array (`[]`). The system never invents dummy files.
- **Truthful Binary Persistence Semantics**: The prototype persists complete evidence **metadata** (filenames, MIME types, sizes, checksums, timestamps) in client storage (`localStorage`). Binary image previews utilize browser `blob:` object URLs or sample imagery, which are local to the user session. The system explicitly distinguishes client metadata durability from cloud object storage.

---

## 3. Canonical Reviewer Packet Architecture

### 3.1 Single Canonical Packet Builder
All packet views and export utilities consume the single canonical builder in `src/shared/contracts/heritagePulseContract.ts`:

```typescript
function buildCanonicalReviewerPacketData(
  observation: ObservationRecord,
  siteName: string = 'Fort of Shivner (Shivneri Fort)',
  monumentNumber: string = 'MUMMH015'
): CanonicalReviewerPacketData
```

### 3.2 Canonical Packet Structure
The compiled dataset contains 8 essential sections:

1. **Header & Identification**: `caseId`, `generatedTimestamp`, `siteName`, `vernacularName` (शिवनेरी किल्ला), `monumentNumber` (`MUMMH015`), `district` (Pune), `state` (Maharashtra).
2. **Observation Details**: `category`, `categoryLabel`, `factualDescription`, `observedTimestamp`.
3. **Telemetry & Sensor Data**: `latitude`, `longitude`, `gpsAccuracyMeters`.
4. **Authoritative Spatial Verdict**: `classification`, `distanceToBoundaryMeters`, `isUncertaintyOverlap`, `geometryVersion`, `explanation`, `statements` (userReported, gisCalculated, authorityNotice).
5. **Source Provenance & Gate**: `sourceAgency` (Bhuvan/NRSC/ASI), `sourceDocumentOrUrl`, `gateStatus` (`PASSED_WITH_LIMITATIONS`), `crs` (`EPSG:4326`), `retrievalDate` (`2026-09-07`), `verbatimLimitationText`.
6. **Attached Evidence Records**: List of all `EvidenceRecord` items including SHA-256 hashes.
7. **Change Ledger History**: Complete chronologically ordered `eventsTimeline`.
8. **Statutory Legal Disclaimer**: `CANONICAL_LEGAL_DISCLAIMER` verbatim.

---

## 4. Packet Equality Guarantees

Programmatic tests enforce exact equality between the exported packet and persisted case record:

| Field Group | Packet Field | Case Field | Equality Result |
|---|---|---|---|
| **Identity** | `packet.caseId` | `case.caseId` | **STRICT MATCH** |
| **Status** | `packet.currentStatus` | `case.currentStatus` | **STRICT MATCH** |
| **Observation** | `packet.factualDescription` | `case.factualDescription` | **STRICT MATCH** |
| **Telemetry** | `packet.coordinates` | `{latitude, longitude, gpsAccuracyMeters}` | **STRICT MATCH** |
| **Spatial Result** | `packet.spatialVerdict.classification` | `case.spatialResult.classification` | **STRICT MATCH** |
| **Perimeter Distance** | `packet.spatialVerdict.distanceToBoundaryMeters` | `case.spatialResult.distanceToBoundaryMeters` | **STRICT MATCH** |
| **Evidence** | `packet.evidenceList` | `case.evidenceList` | **STRICT MATCH** |
| **Change Ledger** | `packet.eventsTimeline` | `case.eventsTimeline` | **STRICT MATCH** |

---

## 5. Non-Recalculation Verification

Reviewer Packet components (`ReviewerPacketPreview.tsx`, `ReviewerPacketPage.tsx`) are **pure presentation layers**.
- Automated test `Packet 6` uses Vitest spies on `resolveMultiTierSpatialResult` and `calculateSpatialResult` to prove that generating a Reviewer Packet invokes zero spatial calculation functions.
- Grep audits confirm zero `@turf` imports inside `src/features/reviewer-packet/`.

---

## 6. Documented Limitations

1. **Local Preview Storage**: Evidence binaries are session-scoped `blob:` object URLs or sample reference URLs. Production deployment will require an S3/GCS object store with signed URLs.
2. **Single-Site Prototype**: Provenance metadata reflects Fort of Shivner (`MUMMH015`).
3. **Indicative Bhuvan Geometry**: Spatial calculations reflect Bhuvan/NRSC version 1.0 source geometry mapped in association with ASI. Formal legal actions require on-ground physical boundary demarcation by the competent authority.
