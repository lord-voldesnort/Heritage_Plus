import { describe, it, expect, beforeEach } from 'vitest';
import { LedgerStore } from './ledgerStore';
import { ClientStorageAdapter } from './persistenceAdapter';
import { resolveMultiTierSpatialResult } from './spatialEngine';
import {
  SHIVNERI_SITE,
  SHIVNERI_GEOMETRY,
} from '../mock-data/mockSite';
import {
  SHIVNERI_PROTECTED_GEOMETRY,
  SHIVNERI_PROHIBITED_GEOMETRY,
  SHIVNERI_REGULATED_GEOMETRY,
  PROVENANCE_METADATA,
} from '../mock-data/siteGeometry';
import { DEMO_SCENARIOS } from '../mock-data/mockScenarios';

describe('A2 Authoritative Persistence Boundary & Lifecycle Test Suite', () => {
  let adapter: ClientStorageAdapter;
  let store: LedgerStore;

  beforeEach(() => {
    adapter = new ClientStorageAdapter('test_hp_ledger_cases_key');
    adapter.clear();
    store = new LedgerStore(adapter);
  });

  // 1. Create case
  it('Requirement 1 & 2: creates a case with a stable sequential Case ID', () => {
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'Foundation masonry observed near perimeter.',
    });

    const newCase = store.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: 'POSSIBLE_CONSTRUCTION',
        factualDescription: 'Foundation masonry observed near perimeter.',
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
        reporterType: 'VISITOR',
      },
      spatialResult
    );

    expect(newCase.caseId).toMatch(/^HP-MH-\d{4}-\d{4}$/);
    expect(newCase.currentStatus).toBe('SUBMITTED_FOR_REVIEW');
    expect(newCase.computedClassification).toBe(spatialResult.classification);
  });

  // 3 & 4. Retrieve case & retrieve case after reload/hydration
  it('Requirement 3, 4 & 5: retrieves case after store rehydration (simulating reload/restart)', () => {
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'Stone foundation excavation and mortar mixing observed 15m inside north gateway.',
    });

    const created = store.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: 'POSSIBLE_CONSTRUCTION',
        factualDescription: 'Stone foundation excavation and mortar mixing observed 15m inside north gateway.',
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
        photoUrl: 'https://example.com/photo.jpg',
      },
      spatialResult
    );

    // Simulate page reload / application restart with a new store instance pointing to same adapter
    const reloadedStore = new LedgerStore(adapter);
    const retrieved = reloadedStore.getCaseById(created.caseId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.caseId).toBe(created.caseId);
    expect(retrieved?.factualDescription).toBe(created.factualDescription);
    expect(retrieved?.latitude).toBe(19.1980);
    expect(retrieved?.longitude).toBe(73.8580);
    expect(retrieved?.gpsAccuracyMeters).toBe(4.5);
    expect(retrieved?.computedClassification).toBe('POTENTIAL_ZONE_CONCERN');
  });

  // 6. Three geometry layers remain separate
  it('Requirement 6: preserves the 3 distinct Bhuvan geometry layers separately', () => {
    expect(SHIVNERI_PROTECTED_GEOMETRY.geometryId).toContain('asi_protected_areas');
    expect(SHIVNERI_PROHIBITED_GEOMETRY.geometryId).toContain('asi_prohibited_boundary');
    expect(SHIVNERI_REGULATED_GEOMETRY.geometryId).toContain('asi_regulated_boundary');

    expect(SHIVNERI_PROTECTED_GEOMETRY.geojson.type).toBe('MultiPolygon');
    expect(SHIVNERI_PROHIBITED_GEOMETRY.geojson.type).toBe('MultiPolygon');
    expect(SHIVNERI_REGULATED_GEOMETRY.geojson.type).toBe('MultiPolygon');
  });

  // 7, 8, 9, 10. Source metadata, exact spatial result, evidence metadata, initial ledger event persist
  it('Requirement 7, 8, 9 & 10: persists source metadata, spatial results, evidence metadata, and initial events', () => {
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.2020,
      longitude: 73.8660,
      gpsAccuracyMeters: 14.5,
      factualDescription: 'Displaced masonry near outer boundary.',
    });

    const created = store.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: 'PHYSICAL_DAMAGE',
        factualDescription: 'Displaced masonry near outer boundary.',
        latitude: 19.2020,
        longitude: 73.8660,
        gpsAccuracyMeters: 14.5,
        photoUrl: 'blob:http://localhost:3000/photo-evidence-1',
        photoMetadata: {
          fileName: 'evidence.jpg',
          sizeKb: 2048,
          capturedDate: '2026-09-08',
        },
      },
      spatialResult
    );

    const reloadedStore = new LedgerStore(adapter);
    const retrieved = reloadedStore.getCase(created.caseId);

    // Exact spatial result persisted
    expect(retrieved?.spatialResult).toBeDefined();
    expect(retrieved?.spatialResult?.classification).toBe(spatialResult.classification);
    expect(retrieved?.spatialResult?.distanceToBoundaryMeters).toBe(spatialResult.distanceToBoundaryMeters);
    expect(retrieved?.spatialResult?.statements.gisCalculated).toBe(spatialResult.statements.gisCalculated);

    // Evidence metadata persisted
    expect(retrieved?.evidenceList.length).toBe(1);
    expect(retrieved?.evidenceList[0].sha256Checksum).toBeDefined();
    expect(retrieved?.evidenceList[0].fileSizeBytes).toBe(2048 * 1024);

    // Initial ledger timeline events persisted
    expect(retrieved?.eventsTimeline.length).toBe(4);
    expect(retrieved?.eventsTimeline[0].eventType).toBe('OBSERVATION_CREATED');
    expect(retrieved?.eventsTimeline[1].eventType).toBe('LOCATION_CAPTURED');
    expect(retrieved?.eventsTimeline[2].eventType).toBe('SPATIAL_CALCULATED');
    expect(retrieved?.eventsTimeline[3].eventType).toBe('REVIEW_ACTION_RECORDED');
  });

  // 11 & 12. Reviewer action persists and event order remains chronological and append-only
  it('Requirement 11 & 12: records reviewer decisions append-only and preserves chronological event order', () => {
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'Test case for review transitions.',
    });

    const created = store.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: 'POSSIBLE_CONSTRUCTION',
        factualDescription: 'Test case for review transitions.',
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
      },
      spatialResult
    );

    const initialEventCount = created.eventsTimeline.length;

    // Reviewer Action 1
    const updated1 = store.recordReviewAction(
      created.caseId,
      'ADDITIONAL_INFORMATION_NEEDED',
      'Please capture high-resolution photo from western approach.',
      'Heritage Curator'
    );

    expect(updated1?.currentStatus).toBe('ADDITIONAL_INFORMATION_NEEDED');
    expect(updated1?.eventsTimeline.length).toBe(initialEventCount + 1);
    expect(updated1?.eventsTimeline[initialEventCount].actionTaken).toBe('ADDITIONAL_INFORMATION_NEEDED');
    expect(updated1?.eventsTimeline[initialEventCount].reviewerNotes).toContain('high-resolution photo');

    // Reviewer Action 2
    const updated2 = store.recordReviewAction(
      created.caseId,
      'FIELD_VERIFICATION_RECOMMENDED',
      'Ground surveyor dispatched for physical verification.',
      'Chief Conservation Officer'
    );

    expect(updated2?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
    expect(updated2?.eventsTimeline.length).toBe(initialEventCount + 2);

    // Verify after reload
    const reloadedStore = new LedgerStore(adapter);
    const retrieved = reloadedStore.getCaseById(created.caseId);
    expect(retrieved?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
    expect(retrieved?.eventsTimeline.length).toBe(initialEventCount + 2);
  });

  // 13. Invalid transition is rejected
  it('Requirement 13: rejects invalid reviewer status actions safely without mutating state', () => {
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'Invalid transition test case.',
    });

    const created = store.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: 'POSSIBLE_CONSTRUCTION',
        factualDescription: 'Invalid transition test case.',
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
      },
      spatialResult
    );

    const initialEventCount = created.eventsTimeline.length;

    // Attempt invalid action
    const invalidResult = store.recordReviewAction(
      created.caseId,
      'INVALID_NON_EXISTENT_STATUS' as any,
      'Invalid note',
      'REVIEWER'
    );

    expect(invalidResult).toBeNull();

    const unmodified = store.getCaseById(created.caseId);
    expect(unmodified?.currentStatus).toBe('SUBMITTED_FOR_REVIEW');
    expect(unmodified?.eventsTimeline.length).toBe(initialEventCount);
  });

  // 14 & 15. Packet comes from persisted data and matches case data
  it('Requirement 14 & 15: compiles Reviewer Packet directly from persisted record matching all case fields', () => {
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'Packet verification observation.',
    });

    const created = store.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: 'POSSIBLE_CONSTRUCTION',
        factualDescription: 'Packet verification observation.',
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
        photoUrl: 'https://example.com/test.jpg',
      },
      spatialResult
    );

    const packet = store.getPacketData(created.caseId);

    expect(packet).toBeDefined();
    expect(packet?.caseId).toBe(created.caseId);
    expect(packet?.factualDescription).toBe(created.factualDescription);
    expect(packet?.coordinates.latitude).toBe(created.latitude);
    expect(packet?.coordinates.longitude).toBe(created.longitude);
    expect(packet?.coordinates.gpsAccuracyMeters).toBe(created.gpsAccuracyMeters);
    expect(packet?.spatialVerdict.classification).toBe(created.computedClassification);
    expect(packet?.spatialVerdict.distanceToBoundaryMeters).toBe(created.distanceToBoundaryMeters);
    expect(packet?.currentStatus).toBe(created.currentStatus);
  });

  // 16. Demo scenarios use real resolver
  it('Requirement 16: evaluates all 4 demo scenarios through the real multi-tier spatial resolver', () => {
    for (const scenario of DEMO_SCENARIOS) {
      const result = resolveMultiTierSpatialResult({
        latitude: scenario.latitude,
        longitude: scenario.longitude,
        gpsAccuracyMeters: scenario.gpsAccuracyMeters,
        factualDescription: scenario.factualNotes,
      });

      if (scenario.id === 'scenario-3-near-boundary') {
        // Multi-tier resolver finds the point inside 100m prohibited tier while preserving higher-tier protected uncertainty
        expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
        expect(result.explanation).toContain('100m Prohibited Zone layer');
        expect(result.explanation).toContain('Protected Area layer');
      } else {
        expect(result.classification).toBe(scenario.expectedClassification);
      }
    }
  });

  // 17. Demo reset preserves source geometry
  it('Requirement 17: resetDemoData preserves Bhuvan source geometry and resets seed cases', () => {
    store.resetDemoData();

    // Source geometries remain untouched
    expect(PROVENANCE_METADATA.sourceAgency).toContain('Bhuvan / NRSC (ISRO)');
    expect((SHIVNERI_PROTECTED_GEOMETRY.geojson as any).coordinates.length).toBeGreaterThan(0);
    expect((SHIVNERI_PROHIBITED_GEOMETRY.geojson as any).coordinates.length).toBeGreaterThan(0);
    expect((SHIVNERI_REGULATED_GEOMETRY.geojson as any).coordinates.length).toBeGreaterThan(0);

    const cases = store.getCases();
    expect(cases.length).toBeGreaterThanOrEqual(2);
  });

  // 18. Persistence failure handling
  it('Requirement 18: rejects invalid input creation attempts without creating false-success cases', () => {
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'Valid',
    });

    // Empty description
    expect(() =>
      store.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: 'POSSIBLE_CONSTRUCTION',
          factualDescription: '   ',
          latitude: 19.1980,
          longitude: 73.8580,
          gpsAccuracyMeters: 4.5,
        },
        spatialResult
      )
    ).toThrow();

    // Out of range latitude
    expect(() =>
      store.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: 'POSSIBLE_CONSTRUCTION',
          factualDescription: 'Valid description',
          latitude: 95.0,
          longitude: 73.8580,
          gpsAccuracyMeters: 4.5,
        },
        spatialResult
      )
    ).toThrow();

    // Negative GPS accuracy
    expect(() =>
      store.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: 'POSSIBLE_CONSTRUCTION',
          factualDescription: 'Valid description',
          latitude: 19.1980,
          longitude: 73.8580,
          gpsAccuracyMeters: -5.0,
        },
        spatialResult
      )
    ).toThrow();
  });

  // 19. Missing evidence representation
  it('Requirement 19: represents missing evidence accurately without inventing placeholder files', () => {
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'No photo observation.',
    });

    const caseWithoutPhoto = store.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: 'OTHER_VISIBLE_CHANGE',
        factualDescription: 'No photo observation.',
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
      },
      spatialResult
    );

    expect(caseWithoutPhoto.evidenceList).toEqual([]);
    expect(caseWithoutPhoto.evidenceList.length).toBe(0);

    const packet = store.getPacketData(caseWithoutPhoto.caseId);
    expect(packet?.evidenceList).toEqual([]);
  });

  // 20. CRITICAL A2 GOLDEN PATH TEST
  it('Requirement 20: GOLDEN PATH TEST — Create -> Persist -> Reload -> Retrieve -> Review -> Packet Consistency', () => {
    // Step 1: Create Case
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: 'Golden path masonry excavation near north portal.',
    });

    const created = store.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: 'POSSIBLE_CONSTRUCTION',
        factualDescription: 'Golden path masonry excavation near north portal.',
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
        reporterType: 'VISITOR',
        photoUrl: 'https://example.com/golden-path-photo.jpg',
      },
      spatialResult
    );

    const caseId = created.caseId;

    // Step 2: Simulate Full Store Reload / Restart Lifecycle
    const reloadedStore = new LedgerStore(adapter);
    const retrievedAfterRestart = reloadedStore.getCaseById(caseId);

    expect(retrievedAfterRestart).toBeDefined();
    if (!retrievedAfterRestart) return;

    // Step 3: Verify Exact Spatial Result & Metadata Match
    expect(retrievedAfterRestart.caseId).toBe(caseId);
    expect(retrievedAfterRestart.factualDescription).toBe('Golden path masonry excavation near north portal.');
    expect(retrievedAfterRestart.latitude).toBe(19.1980);
    expect(retrievedAfterRestart.longitude).toBe(73.8580);
    expect(retrievedAfterRestart.gpsAccuracyMeters).toBe(4.5);
    expect(retrievedAfterRestart.computedClassification).toBe(spatialResult.classification);
    expect(retrievedAfterRestart.distanceToBoundaryMeters).toBe(spatialResult.distanceToBoundaryMeters);
    expect(retrievedAfterRestart.spatialResult?.statements.gisCalculated).toBe(spatialResult.statements.gisCalculated);
    expect(retrievedAfterRestart.evidenceList.length).toBe(1);
    expect(retrievedAfterRestart.eventsTimeline.length).toBe(4);

    // Step 4: Append Reviewer Decision
    const updatedWithReview = reloadedStore.recordReviewAction(
      caseId,
      'FIELD_VERIFICATION_RECOMMENDED',
      'Ground surveyor assigned to verify exact distance to protected boundary.',
      'Senior Heritage Curator'
    );

    expect(updatedWithReview?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
    expect(updatedWithReview?.eventsTimeline.length).toBe(5);

    // Step 5: Simulate Second Reload
    const secondReloadStore = new LedgerStore(adapter);
    const retrievedSecondTime = secondReloadStore.getCaseById(caseId);

    expect(retrievedSecondTime?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
    expect(retrievedSecondTime?.eventsTimeline.length).toBe(5);
    expect(retrievedSecondTime?.eventsTimeline[4].reviewerNotes).toContain('Ground surveyor assigned');

    // Step 6: Generate Canonical Reviewer Packet
    const packet = secondReloadStore.getPacketData(caseId);

    expect(packet).toBeDefined();
    expect(packet?.caseId).toBe(caseId);
    expect(packet?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
    expect(packet?.spatialVerdict.classification).toBe(spatialResult.classification);
    expect(packet?.spatialVerdict.distanceToBoundaryMeters).toBe(spatialResult.distanceToBoundaryMeters);
    expect(packet?.eventsTimeline.length).toBe(5);
    expect(packet?.evidenceList.length).toBe(1);
    expect(packet?.disclaimer).toContain('Indicative decision support only');
  });
});
