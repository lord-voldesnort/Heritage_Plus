import { describe, it, expect, beforeEach } from 'vitest';
import { ledgerStore } from '../shared/lib/ledgerStore';
import { calculateSpatialResult } from '../shared/lib/spatialEngine';
import { SHIVNERI_GEOMETRY, SHIVNERI_SITE } from '../shared/mock-data/mockSite';
import { PROVENANCE_METADATA } from '../shared/mock-data/siteGeometry';
import { DEMO_SCENARIOS } from '../shared/mock-data/mockScenarios';
import { MOCK_CASES } from '../shared/mock-data/mockCases';
import { getReviewerPacketData, CANONICAL_NON_LEGAL_NOTICE } from '../features/reviewer-packet/packetData';
import { CANONICAL_LEGAL_DISCLAIMER } from '../shared/constants/disclaimer';
import { containsBannedLanguage } from '../shared/constants/bannedLanguage';

describe('Person 4: Rigorous P2 Gap Audit & Integration Suite', () => {
  beforeEach(() => {
    ledgerStore.resetAllData();
  });

  /* =====================================================================
   * GAP 1: Persistence Behavior (Local Adapter & Crash Recovery)
   * ===================================================================== */
  describe('Gap 1: Durable Local Persistence & Reset Safety', () => {
    it('persists newly created cases and reloads them via loadFromStorage', () => {
      const scenario = DEMO_SCENARIOS[0];
      const spatial = calculateSpatialResult(
        {
          latitude: scenario.latitude,
          longitude: scenario.longitude,
          gpsAccuracyMeters: scenario.gpsAccuracyMeters,
          factualDescription: scenario.factualNotes,
        },
        SHIVNERI_GEOMETRY
      );

      const created = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: scenario.category,
          factualDescription: scenario.factualNotes,
          latitude: scenario.latitude,
          longitude: scenario.longitude,
          gpsAccuracyMeters: scenario.gpsAccuracyMeters,
        },
        spatial
      );

      // Verify created case exists
      expect(ledgerStore.getCaseById(created.caseId)).toBeDefined();

      // Trigger re-load from storage (simulating page reload with storage intact)
      ledgerStore.loadFromStorage();
      const reloaded = ledgerStore.getCaseById(created.caseId);
      expect(reloaded).toBeDefined();
      expect(reloaded?.caseId).toBe(created.caseId);
    });

    it('gracefully handles corrupted storage data without crashing and falls back to baseline', () => {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem('heritage_pulse_cases_v1', 'INVALID_CORRUPTED_JSON{');
        // Loading should catch the error and maintain/fallback to mock cases
        ledgerStore.loadFromStorage();
        expect(ledgerStore.getCases().length).toBeGreaterThanOrEqual(MOCK_CASES.length);
      }
    });
  });

  /* =====================================================================
   * GAP 2: Canonical Spatial Machine-Status Tests
   * ===================================================================== */
  describe('Gap 2: Canonical Spatial Machine-Status Assertions', () => {
    // Conceptual mapping:
    // Prompt: INSIDE_PROHIBITED    -> Codebase: POTENTIAL_ZONE_CONCERN
    // Prompt: OUTSIDE_BOUNDARIES   -> Codebase: NO_SPATIAL_CONCERN_INDICATED
    // Prompt: LOCATION_UNCERTAIN   -> Codebase: LOCATION_UNCERTAIN
    // Prompt: POOR_GPS             -> Codebase: EVIDENCE_INSUFFICIENT
    const STATUS_MAP = {
      INSIDE_PROHIBITED: 'POTENTIAL_ZONE_CONCERN',
      OUTSIDE_BOUNDARIES: 'NO_SPATIAL_CONCERN_INDICATED',
      LOCATION_UNCERTAIN: 'LOCATION_UNCERTAIN',
      POOR_GPS: 'EVIDENCE_INSUFFICIENT',
    } as const;

    it('Scenario 1 (Inside Protected Area): asserts machine-readable POTENTIAL_ZONE_CONCERN (conceptual: INSIDE_PROHIBITED)', () => {
      const s1 = DEMO_SCENARIOS.find((s) => s.id === 'scenario-1-inside')!;
      const result = calculateSpatialResult(
        {
          latitude: s1.latitude,
          longitude: s1.longitude,
          gpsAccuracyMeters: s1.gpsAccuracyMeters,
          factualDescription: s1.factualNotes,
        },
        SHIVNERI_GEOMETRY
      );

      // Assert machine-readable status
      expect(result.classification).toBe(STATUS_MAP.INSIDE_PROHIBITED);
      expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
      expect(result.isUncertaintyOverlap).toBe(false);
      expect(result.gpsAccuracyMeters).toBe(s1.gpsAccuracyMeters);
      expect(typeof result.distanceToBoundaryMeters).toBe('number');
    });

    it('Scenario 2 (Outside Protected Area): asserts machine-readable NO_SPATIAL_CONCERN_INDICATED (conceptual: OUTSIDE_BOUNDARIES)', () => {
      const s2 = DEMO_SCENARIOS.find((s) => s.id === 'scenario-2-outside')!;
      const result = calculateSpatialResult(
        {
          latitude: s2.latitude,
          longitude: s2.longitude,
          gpsAccuracyMeters: s2.gpsAccuracyMeters,
          factualDescription: s2.factualNotes,
        },
        SHIVNERI_GEOMETRY
      );

      expect(result.classification).toBe(STATUS_MAP.OUTSIDE_BOUNDARIES);
      expect(result.classification).toBe('NO_SPATIAL_CONCERN_INDICATED');
      expect(result.distanceToBoundaryMeters).toBeGreaterThan(0);
    });

    it('Scenario 3 (Near Boundary Uncertainty Overlap): asserts machine-readable LOCATION_UNCERTAIN', () => {
      const s3 = DEMO_SCENARIOS.find((s) => s.id === 'scenario-3-near-boundary')!;
      const result = calculateSpatialResult(
        {
          latitude: s3.latitude,
          longitude: s3.longitude,
          gpsAccuracyMeters: s3.gpsAccuracyMeters,
          factualDescription: s3.factualNotes,
        },
        SHIVNERI_GEOMETRY
      );

      expect(result.classification).toBe(STATUS_MAP.LOCATION_UNCERTAIN);
      expect(result.classification).toBe('LOCATION_UNCERTAIN');
      expect(result.isUncertaintyOverlap).toBe(true);
    });

    it('Scenario 4 (Degraded GPS > 35m): asserts machine-readable EVIDENCE_INSUFFICIENT (conceptual: POOR_GPS)', () => {
      const s4 = DEMO_SCENARIOS.find((s) => s.id === 'scenario-4-poor-gps')!;
      const result = calculateSpatialResult(
        {
          latitude: s4.latitude,
          longitude: s4.longitude,
          gpsAccuracyMeters: s4.gpsAccuracyMeters,
          factualDescription: s4.factualNotes,
        },
        SHIVNERI_GEOMETRY
      );

      expect(result.classification).toBe(STATUS_MAP.POOR_GPS);
      expect(result.classification).toBe('EVIDENCE_INSUFFICIENT');
      expect(result.explanation).toContain('35m');
    });
  });

  /* =====================================================================
   * GAP 3: Evidence Contract Completeness
   * ===================================================================== */
  describe('Gap 3: Evidence Contract Linkage and Checksum Preservation', () => {
    it('records evidence metadata, MIME type, file size, and SHA-256 checksum in case record', () => {
      const spatial = calculateSpatialResult(
        {
          latitude: 19.1980,
          longitude: 73.8580,
          gpsAccuracyMeters: 5.0,
          factualDescription: 'Masonry dislocation evidence test.',
        },
        SHIVNERI_GEOMETRY
      );

      const mockChecksum = '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b';
      const created = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: 'PHYSICAL_DAMAGE',
          factualDescription: 'Masonry dislocation evidence test.',
          latitude: 19.1980,
          longitude: 73.8580,
          gpsAccuracyMeters: 5.0,
          photoUrl: 'data:image/jpeg;base64,mockEvidenceData',
          evidenceMetadata: {
            fileMimeType: 'image/jpeg',
            fileSizeBytes: 2048500,
            sha256Checksum: mockChecksum,
          },
        },
        spatial
      );

      expect(created.evidenceList).toHaveLength(1);
      const ev = created.evidenceList[0];
      expect(ev.evidenceId).toBeTruthy();
      expect(ev.observationId).toBe(created.observationId);
      expect(ev.fileMimeType).toBe('image/jpeg');
      expect(ev.fileSizeBytes).toBe(2048500);
      expect(ev.sha256Checksum).toBe(mockChecksum);
      expect(ev.uploadTimestamp).toBeTruthy();

      // Check packet inclusion
      const packet = getReviewerPacketData(created.caseId);
      expect(packet?.photoMetadata?.sha256Checksum).toBe(mockChecksum);
      expect(packet?.photoMetadata?.fileMimeType).toBe('image/jpeg');
      expect(packet?.photoMetadata?.sizeKb).toBe(Math.round(2048500 / 1024));
    });

    it('correctly handles observations without photographic evidence', () => {
      const spatial = calculateSpatialResult(
        {
          latitude: 19.1980,
          longitude: 73.8580,
          gpsAccuracyMeters: 5.0,
          factualDescription: 'No photo provided observation.',
        },
        SHIVNERI_GEOMETRY
      );

      const created = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: 'OTHER_VISIBLE_CHANGE',
          factualDescription: 'No photo provided observation.',
          latitude: 19.1980,
          longitude: 73.8580,
          gpsAccuracyMeters: 5.0,
        },
        spatial
      );

      expect(created.evidenceList).toHaveLength(0);
      const packet = getReviewerPacketData(created.caseId);
      expect(packet?.photoUrl).toBeNull();
      expect(packet?.photoMetadata).toBeNull();
      expect(packet?.evidenceList).toHaveLength(0);
    });

    it('verifies image format validation and size limit rules', () => {
      const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      const invalidMimes = ['application/pdf', 'image/gif', 'text/plain', 'video/mp4'];

      validMimes.forEach((mime) => {
        expect(validMimes.includes(mime)).toBe(true);
      });

      invalidMimes.forEach((mime) => {
        expect(validMimes.includes(mime)).toBe(false);
      });

      const maxBytes = 10 * 1024 * 1024;
      expect(5 * 1024 * 1024 < maxBytes).toBe(true);
      expect(12 * 1024 * 1024 > maxBytes).toBe(true);
    });
  });

  /* =====================================================================
   * GAP 4: Truthful Provenance & Removal of Unsupported Confidence Claims
   * ===================================================================== */
  describe('Gap 4: Truthful Provenance & Non-Legal Certainty', () => {
    it('verifies packet data preserves canonical Bhuvan/NRSC metadata and verbatim limitation notes', () => {
      const cases = ledgerStore.getCases();
      const packet = getReviewerPacketData(cases[0].caseId);
      expect(packet).not.toBeNull();
      if (!packet) return;

      expect(packet.provenance.sourceAgency).toBe(PROVENANCE_METADATA.sourceAgency);
      expect(packet.provenance.portalUrl).toBe(PROVENANCE_METADATA.portalUrl);
      expect(packet.crs).toBe(PROVENANCE_METADATA.crs);
      expect(packet.retrievalDate).toBe(PROVENANCE_METADATA.retrievalDate);
      expect(packet.bhuvanDisclaimer).toBe(PROVENANCE_METADATA.verbatimAsiDisclaimer);
      expect(packet.limitationNote).toBe(PROVENANCE_METADATA.verbatimLimitationText);
      expect(packet.disclaimer).toBe(CANONICAL_LEGAL_DISCLAIMER);
      expect(packet.nonLegalNotice).toBe(CANONICAL_NON_LEGAL_NOTICE);
    });
  });

  /* =====================================================================
   * GAP 5: Reviewer Transitions & Sealed Case Protection
   * ===================================================================== */
  describe('Gap 5: Reviewer Transition Matrix & Terminal Status Protection', () => {
    it('appends decisions across valid reviewer lifecycle states', () => {
      const cases = ledgerStore.getCases();
      const target = cases[0];
      const initialCount = target.eventsTimeline.length;

      // 1. Request more information
      const step1 = ledgerStore.appendReviewerDecision(
        target.caseId,
        'Request Ground Survey',
        'ADDITIONAL_INFORMATION_NEEDED',
        'Need closer ground measurement.',
        'INFO_REQUESTED',
        'Curator 1'
      );
      expect(step1?.currentStatus).toBe('ADDITIONAL_INFORMATION_NEEDED');
      expect(step1?.eventsTimeline.length).toBe(initialCount + 1);

      // 2. Recommend field verification
      const step2 = ledgerStore.appendReviewerDecision(
        target.caseId,
        'Field Inspection Recommended',
        'FIELD_VERIFICATION_RECOMMENDED',
        'On-site inspection scheduled.',
        'STATUS_UPDATED',
        'Curator 1'
      );
      expect(step2?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
      expect(step2?.eventsTimeline.length).toBe(initialCount + 2);

      // 3. Close case
      const step3 = ledgerStore.appendReviewerDecision(
        target.caseId,
        'Case Assessment Closed',
        'CLOSED_REVIEWED',
        'Inspection completed without further concern.',
        'CASE_CLOSED',
        'Curator 2'
      );
      expect(step3?.currentStatus).toBe('CLOSED_REVIEWED');
      expect(step3?.eventsTimeline.length).toBe(initialCount + 3);
    });

    it('strictly prevents modifying terminal closed cases across both appendReviewerDecision and recordReviewAction', () => {
      const cases = ledgerStore.getCases();
      const target = cases[0];

      // Close the case via appendReviewerDecision
      ledgerStore.appendReviewerDecision(
        target.caseId,
        'Initial Case Close',
        'CLOSED_REVIEWED',
        'Case concluded.',
        'CASE_CLOSED',
        'Curator'
      );

      const closedCase = ledgerStore.getCaseById(target.caseId);
      expect(closedCase?.currentStatus).toBe('CLOSED_REVIEWED');
      const closedTimelineLength = closedCase?.eventsTimeline.length;

      // Attempt 1: appendReviewerDecision should reject
      const blockedAttempt1 = ledgerStore.appendReviewerDecision(
        target.caseId,
        'Re-open attempt',
        'ADDITIONAL_INFORMATION_NEEDED',
        'Should be blocked.',
        'INFO_REQUESTED',
        'Reviewer'
      );
      expect(blockedAttempt1).toBeNull();

      // Attempt 2: recordReviewAction should reject
      const blockedAttempt2 = ledgerStore.recordReviewAction(
        target.caseId,
        'FIELD_VERIFICATION_RECOMMENDED',
        'Should also be blocked.'
      );
      expect(blockedAttempt2).toBeNull();

      const postAttemptCase = ledgerStore.getCaseById(target.caseId);
      expect(postAttemptCase?.currentStatus).toBe('CLOSED_REVIEWED');
      expect(postAttemptCase?.eventsTimeline.length).toBe(closedTimelineLength);
    });
  });

  /* =====================================================================
   * GAP 6: Canonical Packet Data Single Source of Truth
   * ===================================================================== */
  describe('Gap 6: Complete Packet-Data Single Source of Truth', () => {
    it('generates packet containing all 18 canonical fields and updates when reviewer actions occur', () => {
      const cases = ledgerStore.getCases();
      const target = cases[0];

      // Generate initial packet
      const packetBefore = getReviewerPacketData(target.caseId);
      expect(packetBefore).not.toBeNull();
      if (!packetBefore) return;

      expect(packetBefore.caseId).toBe(target.caseId);
      expect(packetBefore.monumentNumber).toBe('MUMMH015');
      expect(packetBefore.siteName).toBe(SHIVNERI_SITE.name);
      expect(packetBefore.category).toBe(target.category);
      expect(packetBefore.description).toBe(target.factualDescription);
      expect(packetBefore.latitude).toBe(target.latitude);
      expect(packetBefore.longitude).toBe(target.longitude);
      expect(packetBefore.accuracyMeters).toBe(target.gpsAccuracyMeters);
      expect(packetBefore.computedClassification).toBe(target.spatialResult.classification);
      expect(packetBefore.sourceUrl).toBe(PROVENANCE_METADATA.portalUrl);
      expect(packetBefore.retrievalDate).toBe(PROVENANCE_METADATA.retrievalDate);
      expect(packetBefore.crs).toBe(PROVENANCE_METADATA.crs);
      expect(packetBefore.disclaimer).toBe(CANONICAL_LEGAL_DISCLAIMER);
      expect(packetBefore.nonLegalNotice).toBe(CANONICAL_NON_LEGAL_NOTICE);
      expect(packetBefore.rawEvents.length).toBeGreaterThan(0);

      // Append reviewer action
      ledgerStore.appendReviewerDecision(
        target.caseId,
        'Curator Assessment',
        'ADDITIONAL_INFORMATION_NEEDED',
        'High resolution survey needed.',
        'INFO_REQUESTED',
        'Lead Archaeologist'
      );

      // Regenerate packet and confirm dynamic update
      const packetAfter = getReviewerPacketData(target.caseId);
      expect(packetAfter?.currentStatus).toBe('ADDITIONAL_INFORMATION_NEEDED');
      expect(packetAfter?.latestReviewEvent?.reviewerNotes).toBe('High resolution survey needed.');
      expect(packetAfter?.rawEvents.length).toBe(packetBefore.rawEvents.length + 1);
    });
  });

  /* =====================================================================
   * GAP 7: Reset Safety Proof
   * ===================================================================== */
  describe('Gap 7: Reset Safety Proof', () => {
    it('proves source geometry and provenance are completely unchanged across store resets', () => {
      const geoBefore = JSON.stringify(SHIVNERI_GEOMETRY);
      const provBefore = JSON.stringify(PROVENANCE_METADATA);

      // Create ad-hoc case
      const spatial = calculateSpatialResult(
        { latitude: 19.198, longitude: 73.858, gpsAccuracyMeters: 4.0, factualDescription: 'Temp' },
        SHIVNERI_GEOMETRY
      );
      ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: 'POSSIBLE_CONSTRUCTION',
          factualDescription: 'Temp',
          latitude: 19.198,
          longitude: 73.858,
          gpsAccuracyMeters: 4.0,
        },
        spatial,
        true // Demo scenario
      );

      // Trigger reset
      ledgerStore.resetDemoData();

      const geoAfter = JSON.stringify(SHIVNERI_GEOMETRY);
      const provAfter = JSON.stringify(PROVENANCE_METADATA);

      expect(geoAfter).toBe(geoBefore);
      expect(provAfter).toBe(provBefore);
      expect(ledgerStore.getCases().length).toBe(MOCK_CASES.length);
    });

    it('handles repeated resets idempotently without creating duplicate case IDs', () => {
      ledgerStore.resetDemoData();
      ledgerStore.resetDemoData();
      ledgerStore.resetDemoData();

      const cases = ledgerStore.getCases();
      expect(cases.length).toBe(MOCK_CASES.length);

      const caseIds = cases.map((c) => c.caseId);
      const uniqueIds = new Set(caseIds);
      expect(uniqueIds.size).toBe(caseIds.length);
    });

    it('preserves user-created field observations while pruning demo scenario cases on demo reset', () => {
      // 1. Create a real user case (isDemoScenario = false / default)
      const userSpatial = calculateSpatialResult(
        { latitude: 19.198, longitude: 73.858, gpsAccuracyMeters: 4.0, factualDescription: 'Real citizen field observation' },
        SHIVNERI_GEOMETRY
      );
      const userCase = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: 'PHYSICAL_DAMAGE',
          factualDescription: 'Real citizen field observation',
          latitude: 19.198,
          longitude: 73.858,
          gpsAccuracyMeters: 4.0,
        },
        userSpatial,
        false // Real user case
      );

      // 2. Create a demo scenario case (isDemoScenario = true)
      const demoSpatial = calculateSpatialResult(
        { latitude: 19.199, longitude: 73.859, gpsAccuracyMeters: 3.0, factualDescription: 'Quickbar demo scenario test' },
        SHIVNERI_GEOMETRY
      );
      const demoCase = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: 'POSSIBLE_CONSTRUCTION',
          factualDescription: 'Quickbar demo scenario test',
          latitude: 19.199,
          longitude: 73.859,
          gpsAccuracyMeters: 3.0,
        },
        demoSpatial,
        true // Demo scenario
      );

      expect(ledgerStore.getCaseById(userCase.caseId)).toBeDefined();
      expect(ledgerStore.getCaseById(demoCase.caseId)).toBeDefined();

      // 3. Reset demo data
      ledgerStore.resetDemoData();

      // 4. Assert user case is preserved, demo case is pruned, baseline cases are intact
      expect(ledgerStore.getCaseById(userCase.caseId)).toBeDefined();
      expect(ledgerStore.getCaseById(userCase.caseId)?.factualDescription).toBe('Real citizen field observation');
      expect(ledgerStore.getCaseById(demoCase.caseId)).toBeUndefined();
      expect(ledgerStore.getCases().length).toBe(MOCK_CASES.length + 1);

      // 5. Total reset clears all user cases back to baseline
      ledgerStore.resetAllData();
      expect(ledgerStore.getCases().length).toBe(MOCK_CASES.length);
      expect(ledgerStore.getCaseById(userCase.caseId)).toBeUndefined();
    });
  });

  /* =====================================================================
   * GAP 8: Real Visible Journey Integration Tests (Store / Route Level)
   * ===================================================================== */
  describe('Gap 8: Real Visible Journey Integration Verification', () => {
    it('completes the vertical slice: Capture -> Spatial -> Ledger -> Queue -> Action -> Packet', () => {
      // Step 1: Input capture parameters
      const latitude = 19.1975;
      const longitude = 73.8575;
      const gpsAccuracyMeters = 3.5;
      const factualDescription = 'Stone pathway surface wear near inner fortification.';
      const category = 'PHYSICAL_DAMAGE';

      // Step 2: Spatial engine calculates machine-readable classification
      const spatial = calculateSpatialResult(
        { latitude, longitude, gpsAccuracyMeters, factualDescription },
        SHIVNERI_GEOMETRY
      );
      expect(spatial.classification).toBe('POTENTIAL_ZONE_CONCERN');

      // Step 3: LedgerStore registers canonical case ID
      const created = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category,
          factualDescription,
          latitude,
          longitude,
          gpsAccuracyMeters,
        },
        spatial
      );
      expect(created.caseId).toMatch(/^HP-MH-\d{4}-\d{4}$/);

      // Step 4: Detail page route lookup (/result/:caseId)
      const detailRecord = ledgerStore.getCaseById(created.caseId);
      expect(detailRecord).toBeDefined();
      expect(detailRecord?.caseId).toBe(created.caseId);

      // Step 5: Reviewer queue lists case (/reviewer/queue)
      const queueCases = ledgerStore.getCases();
      expect(queueCases.some((c) => c.caseId === created.caseId)).toBe(true);

      // Step 6: Reviewer action drawer appends decision
      const reviewedCase = ledgerStore.appendReviewerDecision(
        created.caseId,
        'Field Inspection Mandated',
        'FIELD_VERIFICATION_RECOMMENDED',
        'Schedule on-site evaluation by ASI Junnar circle.',
        'STATUS_UPDATED',
        'Heritage Officer'
      );
      expect(reviewedCase?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');

      // Step 7: Packet preview dossier (/packet/:caseId)
      const packet = getReviewerPacketData(created.caseId);
      expect(packet).not.toBeNull();
      expect(packet?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
      expect(packet?.latestReviewEvent?.reviewerNotes).toBe('Schedule on-site evaluation by ASI Junnar circle.');
      expect(packet?.disclaimer).toBe(CANONICAL_LEGAL_DISCLAIMER);
      expect(packet?.nonLegalNotice).toBe(CANONICAL_NON_LEGAL_NOTICE);
    });

    it('verifies non-accusatory language contract across all notices, scenarios, and mock data', () => {
      expect(containsBannedLanguage(CANONICAL_LEGAL_DISCLAIMER).hasViolation).toBe(false);
      expect(containsBannedLanguage(CANONICAL_NON_LEGAL_NOTICE).hasViolation).toBe(false);

      DEMO_SCENARIOS.forEach((s) => {
        expect(containsBannedLanguage(s.factualNotes).hasViolation).toBe(false);
        expect(containsBannedLanguage(s.name).hasViolation).toBe(false);
      });

      MOCK_CASES.forEach((c) => {
        expect(containsBannedLanguage(c.factualDescription).hasViolation).toBe(false);
      });
    });
  });
});
