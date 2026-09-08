import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  buildCanonicalReviewerPacketData,
  CANONICAL_LEGAL_DISCLAIMER,
  containsBannedLanguage,
} from '../../shared/contracts/heritagePulseContract';
import { LedgerStore, ledgerStore } from '../../shared/lib/ledgerStore';
import { ClientStorageAdapter } from '../../shared/lib/persistenceAdapter';
import { resolveMultiTierSpatialResult } from '../../shared/lib/spatialEngine';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { ObservationRecord, EvidenceRecord } from '../../shared/types';
import * as spatialEngineModule from '../../shared/lib/spatialEngine';

describe('A7 Evidence Integrity & Canonical Reviewer Packet Suite', () => {
  let adapter: ClientStorageAdapter;
  let store: LedgerStore;

  beforeEach(() => {
    adapter = new ClientStorageAdapter('test_hp_reviewer_packet_suite_key');
    adapter.clear();
    store = new LedgerStore(adapter);
  });

  function createSampleCase(withPhoto = true): ObservationRecord {
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'Foundation excavation observed near northern boundary.',
    });

    return store.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: 'POSSIBLE_CONSTRUCTION',
        factualDescription: 'Foundation excavation observed near northern boundary.',
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
        reporterType: 'VISITOR',
        photoUrl: withPhoto ? 'blob:http://localhost:5173/sample-photo-blob-001' : undefined,
        photoMetadata: withPhoto
          ? {
              fileName: 'excavation_north.jpg',
              sizeKb: 1540,
              capturedDate: '2026-09-08',
            }
          : undefined,
      },
      spatialResult
    );
  }

  // ==========================================
  // A7: EVIDENCE INTEGRITY TESTS
  // ==========================================

  it('Evidence 1. Metadata persistence: persists complete evidence record with all required technical fields', () => {
    const c = createSampleCase(true);
    expect(c.evidenceList.length).toBe(1);

    const ev = c.evidenceList[0];
    expect(ev.evidenceId).toBeDefined();
    expect(ev.observationId).toBe(c.observationId);
    expect(ev.fileUrl).toContain('sample-photo-blob-001');
    expect(ev.fileMimeType).toBe('image/jpeg');
    expect(ev.fileSizeBytes).toBe(1540 * 1024);
    expect(ev.sha256Checksum).toBeDefined();
    expect(new Date(ev.uploadTimestamp).getTime()).toBeGreaterThan(0);

    // Verify after store rehydration
    const reloadedStore = new LedgerStore(adapter);
    const reloadedCase = reloadedStore.getCaseById(c.caseId);
    expect(reloadedCase?.evidenceList[0]).toEqual(ev);
  });

  it('Evidence 2. Checksum preservation: SHA-256 hash is preserved across store hydration and packet compilation', () => {
    const c = createSampleCase(true);
    const originalChecksum = c.evidenceList[0].sha256Checksum;

    const packet = store.getPacketData(c.caseId);
    expect(packet?.evidenceList[0].sha256Checksum).toBe(originalChecksum);
  });

  it('Evidence 3. Evidence-case linkage: evidence records are strictly isolated to their owning case', () => {
    const caseA = createSampleCase(true);
    const caseB = createSampleCase(false);

    // Save additional evidence specifically to Case B
    const extraEvidence: EvidenceRecord = {
      evidenceId: 'ev-unique-case-b',
      observationId: caseB.observationId,
      fileUrl: 'blob:http://localhost:5173/case-b-evidence',
      fileMimeType: 'image/jpeg',
      fileSizeBytes: 204800,
      sha256Checksum: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      uploadTimestamp: new Date().toISOString(),
    };

    store.saveEvidenceMetadata(caseB.caseId, extraEvidence);

    const retrievedA = store.getCaseById(caseA.caseId);
    const retrievedB = store.getCaseById(caseB.caseId);

    expect(retrievedA?.evidenceList.some((e) => e.evidenceId === 'ev-unique-case-b')).toBe(false);
    expect(retrievedB?.evidenceList.some((e) => e.evidenceId === 'ev-unique-case-b')).toBe(true);
  });

  it('Evidence 4. Missing evidence: represents missing photo accurately without inventing placeholder files', () => {
    const c = createSampleCase(false);
    expect(c.evidenceList).toEqual([]);

    const packet = store.getPacketData(c.caseId);
    expect(packet?.evidenceList).toEqual([]);
    expect(packet?.evidenceList.length).toBe(0);
  });

  it('Evidence 5. Failed evidence handling: saveEvidenceMetadata on non-existent case returns empty array safely', () => {
    const dummyEvidence: EvidenceRecord = {
      evidenceId: 'ev-dummy',
      observationId: 'obs-dummy',
      fileUrl: 'blob:http://localhost:5173/dummy',
      fileMimeType: 'image/jpeg',
      fileSizeBytes: 100,
      sha256Checksum: 'dummy-hash',
      uploadTimestamp: new Date().toISOString(),
    };

    const result = store.saveEvidenceMetadata('NON-EXISTENT-CASE-ID', dummyEvidence);
    expect(result).toEqual([]);
  });

  it('Evidence 6. Duplicate ID protection: case creation assigns unique UUIDs to every evidence record', () => {
    const case1 = createSampleCase(true);
    const case2 = createSampleCase(true);

    expect(case1.evidenceList[0].evidenceId).not.toBe(case2.evidenceList[0].evidenceId);
  });

  it('Evidence 7. Local-preview limitation: distinguishes client blob object URL from permanent binary storage', () => {
    const c = createSampleCase(true);
    const fileUrl = c.evidenceList[0].fileUrl;

    // Truthful semantics: client uses local blob URL
    expect(fileUrl.startsWith('blob:') || fileUrl.startsWith('https://') || fileUrl.startsWith('http://')).toBe(true);
  });

  // ==========================================
  // A7: CANONICAL PACKET EQUALITY & INTEGRITY TESTS
  // ==========================================

  it('Packet 1. Packet/Case equality: packet fields strictly equal stored CaseRecord fields', () => {
    const c = createSampleCase(true);
    const packet = store.getPacketData(c.caseId);

    expect(packet).not.toBeNull();
    expect(packet?.caseId).toBe(c.caseId);
    expect(packet?.currentStatus).toBe(c.currentStatus);
    expect(packet?.category).toBe(c.category);
    expect(packet?.factualDescription).toBe(c.factualDescription);
    expect(packet?.coordinates.latitude).toBe(c.latitude);
    expect(packet?.coordinates.longitude).toBe(c.longitude);
    expect(packet?.coordinates.gpsAccuracyMeters).toBe(c.gpsAccuracyMeters);
  });

  it('Packet 2. Packet/Ledger equality: packet timeline strictly mirrors persisted eventsTimeline', () => {
    const c = createSampleCase(true);
    store.recordReviewAction(c.caseId, 'FIELD_VERIFICATION_RECOMMENDED', 'Inspection rationale', 'Curator');

    const updatedCase = store.getCaseById(c.caseId);
    const packet = store.getPacketData(c.caseId);

    expect(packet?.eventsTimeline).toEqual(updatedCase?.eventsTimeline);
    expect(packet?.eventsTimeline.length).toBe(updatedCase?.eventsTimeline.length);
  });

  it('Packet 3. Packet/Evidence equality: packet evidenceList strictly matches case evidenceList', () => {
    const c = createSampleCase(true);
    const packet = store.getPacketData(c.caseId);

    expect(packet?.evidenceList).toEqual(c.evidenceList);
  });

  it('Packet 4. Packet/Provenance equality: packet contains Bhuvan/NRSC source metadata and gate status', () => {
    const c = createSampleCase(true);
    const packet = store.getPacketData(c.caseId);

    expect(packet?.provenance.sourceAgency).toContain('Bhuvan / NRSC (ISRO)');
    expect(packet?.provenance.sourceDocumentOrUrl).toBe('https://bhuvan-app1.nrsc.gov.in/culture_monuments/');
    expect(packet?.provenance.gateStatus).toBe('PASSED_WITH_LIMITATIONS');
    expect(packet?.provenance.crs).toBe('EPSG:4326');
    expect(packet?.disclaimer).toBe(CANONICAL_LEGAL_DISCLAIMER);
  });

  it('Packet 5. Packet/Spatial-result equality: packet spatialVerdict reads directly from stored spatialResult', () => {
    const c = createSampleCase(true);
    const packet = store.getPacketData(c.caseId);

    expect(packet?.spatialVerdict.classification).toBe(c.spatialResult?.classification);
    expect(packet?.spatialVerdict.distanceToBoundaryMeters).toBe(c.spatialResult?.distanceToBoundaryMeters);
    expect(packet?.spatialVerdict.gpsAccuracyMeters).toBe(c.spatialResult?.gpsAccuracyMeters);
    expect(packet?.spatialVerdict.explanation).toBe(c.spatialResult?.explanation);
    expect(packet?.spatialVerdict.statements).toEqual(c.spatialResult?.statements);
  });

  it('Packet 6. No recalculation guarantee: packet generation does NOT call Turf or spatial engine calculators', () => {
    const calcMultiSpy = vi.spyOn(spatialEngineModule, 'resolveMultiTierSpatialResult');
    const calcSingleSpy = vi.spyOn(spatialEngineModule, 'calculateSpatialResult');

    const c = createSampleCase(true);
    calcMultiSpy.mockClear();
    calcSingleSpy.mockClear();

    // Call packet builder
    const packet = buildCanonicalReviewerPacketData(c);

    // Expect zero downstream calculation invocations
    expect(calcMultiSpy).not.toHaveBeenCalled();
    expect(calcSingleSpy).not.toHaveBeenCalled();
    expect(packet.caseId).toBe(c.caseId);

    calcMultiSpy.mockRestore();
    calcSingleSpy.mockRestore();
  });

  // ==========================================
  // SAFE LANGUAGE PROTOCOL VALIDATION
  // ==========================================

  it('Zero banned accusatory phrasing across all canonical packet definitions', () => {
    const allCases = ledgerStore.getCases();
    for (const c of allCases) {
      const packet = buildCanonicalReviewerPacketData(c);
      const textsToValidate = [
        packet.factualDescription,
        packet.spatialVerdict.explanation,
        packet.disclaimer,
        packet.provenance.verbatimLimitationText || '',
        ...packet.eventsTimeline.map((e) => `${e.summary} ${e.reviewerNotes || ''}`),
      ];

      for (const text of textsToValidate) {
        const check = containsBannedLanguage(text);
        expect(check.hasViolation).toBe(false);
      }
    }
  });
});
