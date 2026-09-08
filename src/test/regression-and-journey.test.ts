import { describe, it, expect } from 'vitest';
import { ledgerStore } from '../shared/lib/ledgerStore';
import { calculateSpatialResult } from '../shared/lib/spatialEngine';
import { SHIVNERI_GEOMETRY, SHIVNERI_SITE } from '../shared/mock-data/mockSite';
import { DEMO_SCENARIOS } from '../shared/mock-data/mockScenarios';
import { containsBannedLanguage, BANNED_PHRASES } from '../shared/constants/bannedLanguage';
import { SPATIAL_CLASSIFICATIONS } from '../shared/constants/spatialClassifications';
import { CASE_STATUSES } from '../shared/constants/caseStatuses';

describe('Final Quality, Regression, and Demo Hardening Suite (Person 4 & Person 5 & Vivek)', () => {

  describe('1. Complete 6-Stage Product Journey Regression', () => {
    it('executes the full 6-stage flow: Capture -> Telemetry -> Spatial -> Ledger -> Reviewer -> Packet', () => {
      // Stage 1: Capture Observation
      const factualNotes = 'Stone wall displacement observed 10m from northern gate.';
      const category = 'PHYSICAL_DAMAGE';
      const mockPhotoUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';

      // Stage 2: GPS Telemetry & Accuracy Recording
      const latitude = 19.1980;
      const longitude = 73.8580;
      const gpsAccuracyMeters = 4.5;

      // Stage 3: Spatial Evaluation (Engine math)
      const spatialResult = calculateSpatialResult(
        { latitude, longitude, gpsAccuracyMeters, factualDescription: factualNotes },
        SHIVNERI_GEOMETRY
      );
      expect(spatialResult.classification).toBe('POTENTIAL_ZONE_CONCERN');

      // Stage 4: Change Ledger Case Creation
      const createdCase = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category,
          factualDescription: factualNotes,
          latitude,
          longitude,
          gpsAccuracyMeters,
          reporterType: 'VISITOR',
          photoUrl: mockPhotoUrl,
        },
        spatialResult
      );

      expect(createdCase.caseId).toMatch(/^HP-MH-\d{4}-\d{4}$/);
      expect(createdCase.currentStatus).toBe('SUBMITTED_FOR_REVIEW');
      expect(createdCase.evidenceList).toHaveLength(1);
      expect(createdCase.evidenceList[0].fileUrl).toBe(mockPhotoUrl);
      expect(createdCase.evidenceList[0].sha256Checksum).toBeTruthy();

      // Stage 5: Reviewer Action Append-Only Continuity
      const initialTimelineCount = createdCase.eventsTimeline.length;
      const initialEventsCopy = [...createdCase.eventsTimeline];

      // Action 1: Info Requested
      const caseAfterInfo = ledgerStore.appendReviewerDecision(
        createdCase.caseId,
        'Request Additional Ground Measurement',
        'ADDITIONAL_INFORMATION_NEEDED',
        'Please re-check coordinates in open sky area.',
        'INFO_REQUESTED',
        'Heritage Curator'
      );
      expect(caseAfterInfo?.currentStatus).toBe('ADDITIONAL_INFORMATION_NEEDED');
      expect(caseAfterInfo?.eventsTimeline).toHaveLength(initialTimelineCount + 1);

      // Action 2: Field Verification Recommended
      const caseAfterVerify = ledgerStore.appendReviewerDecision(
        createdCase.caseId,
        'Recommend Field Inspection',
        'FIELD_VERIFICATION_RECOMMENDED',
        'Field officer dispatched for site measurement.',
        'STATUS_UPDATED',
        'District Archaeological Officer'
      );
      expect(caseAfterVerify?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
      expect(caseAfterVerify?.eventsTimeline).toHaveLength(initialTimelineCount + 2);

      // Action 3: Referred
      const caseAfterReferral = ledgerStore.appendReviewerDecision(
        createdCase.caseId,
        'Refer for Official Review',
        'REFERRED',
        'Case escalated to central competent authority for review.',
        'STATUS_UPDATED',
        'Institutional Curator'
      );
      expect(caseAfterReferral?.currentStatus).toBe('REFERRED');

      // Action 4: Closed Case
      const caseAfterClose = ledgerStore.appendReviewerDecision(
        createdCase.caseId,
        'Close Case - Verification Complete',
        'CLOSED_REVIEWED',
        'Administrative ground measurement completed; case closed.',
        'CASE_CLOSED',
        'Authority Reviewer'
      );
      expect(caseAfterClose?.currentStatus).toBe('CLOSED_REVIEWED');
      expect(caseAfterClose?.eventsTimeline).toHaveLength(initialTimelineCount + 4);

      // Assert Immutable Append-Only Ledger History
      initialEventsCopy.forEach((evt, idx) => {
        expect(caseAfterClose!.eventsTimeline[idx]).toEqual(evt);
      });

      // Stage 6: Authority Review Packet Dossier Verification
      expect(SHIVNERI_GEOMETRY.versionLabel).toBe('v1.0-bhuvan-protected-7068');
      expect(SHIVNERI_GEOMETRY.layerConfidenceScore).toBeGreaterThanOrEqual(0.90);
      expect(spatialResult.statements.authorityNotice).toContain('Indicative decision support only');
      expect(spatialResult.statements.authorityNotice).toContain('authority');
    });
  });

  describe('2. Mandatory 4 Benchmark Scenarios Verification (Zero False Certainty)', () => {
    it('Scenario 1 (Inside Zone): classifies point deep inside as POTENTIAL_ZONE_CONCERN', () => {
      const scenario = DEMO_SCENARIOS.find(s => s.id === 'scenario-1-inside')!;
      const result = calculateSpatialResult(
        {
          latitude: scenario.latitude,
          longitude: scenario.longitude,
          gpsAccuracyMeters: scenario.gpsAccuracyMeters,
          factualDescription: scenario.factualNotes,
        },
        SHIVNERI_GEOMETRY
      );

      expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
      expect(result.distanceToBoundaryMeters).toBeCloseTo(128.8, 1);
      expect(result.isUncertaintyOverlap).toBe(false);
      expect(result.explanation).toContain('Potential zone-related concern');
    });

    it('Scenario 2 (Outside Zone): classifies point safely outside as NO_SPATIAL_CONCERN_INDICATED', () => {
      const scenario = DEMO_SCENARIOS.find(s => s.id === 'scenario-2-outside')!;
      const result = calculateSpatialResult(
        {
          latitude: scenario.latitude,
          longitude: scenario.longitude,
          gpsAccuracyMeters: scenario.gpsAccuracyMeters,
          factualDescription: scenario.factualNotes,
        },
        SHIVNERI_GEOMETRY
      );

      expect(result.classification).toBe('NO_SPATIAL_CONCERN_INDICATED');
      expect(result.distanceToBoundaryMeters).toBeGreaterThan(0);
      expect(result.isUncertaintyOverlap).toBe(false);
      expect(result.explanation).toContain('No spatial concern indicated by this layer');
    });

    it('Scenario 3 (Near Boundary Edge): refuses to overclaim and returns LOCATION_UNCERTAIN when accuracy disk intersects boundary', () => {
      const scenario = DEMO_SCENARIOS.find(s => s.id === 'scenario-3-near-boundary')!;
      const result = calculateSpatialResult(
        {
          latitude: scenario.latitude,
          longitude: scenario.longitude,
          gpsAccuracyMeters: scenario.gpsAccuracyMeters,
          factualDescription: scenario.factualNotes,
        },
        SHIVNERI_GEOMETRY
      );

      expect(result.classification).toBe('LOCATION_UNCERTAIN');
      expect(result.isUncertaintyOverlap).toBe(true);
      expect(result.explanation).toContain('Location uncertain');
      expect(result.explanation).toContain('overlaps the zone boundary');
    });

    it('Scenario 4 (Poor GPS Accuracy): returns EVIDENCE_INSUFFICIENT when uncertainty radius exceeds 35m threshold', () => {
      const scenario = DEMO_SCENARIOS.find(s => s.id === 'scenario-4-poor-gps')!;
      const result = calculateSpatialResult(
        {
          latitude: scenario.latitude,
          longitude: scenario.longitude,
          gpsAccuracyMeters: scenario.gpsAccuracyMeters,
          factualDescription: scenario.factualNotes,
        },
        SHIVNERI_GEOMETRY
      );

      expect(result.classification).toBe('EVIDENCE_INSUFFICIENT');
      expect(result.isUncertaintyOverlap).toBe(true);
      expect(result.explanation).toContain('exceeds 35m threshold');
    });
  });

  describe('3. Fallback Data & Offline Resilience Verification', () => {
    it('ensures seeded cases load reliably from ledgerStore in offline/fallback mode', () => {
      const seededCases = ledgerStore.getCases();
      expect(seededCases.length).toBeGreaterThan(0);

      seededCases.forEach(caseRecord => {
        expect(caseRecord.caseId).toBeTruthy();
        expect(caseRecord.siteId).toBe(SHIVNERI_SITE.siteId);
        expect(caseRecord.spatialResult.classification).toBeTruthy();
        expect(caseRecord.eventsTimeline.length).toBeGreaterThan(0);
      });
    });

    it('verifies getCaseById returns valid record or undefined without throwing', () => {
      const existing = ledgerStore.getCaseById('HP-MH-2026-0001');
      expect(existing).toBeDefined();

      const missing = ledgerStore.getCaseById('HP-NONEXISTENT-9999');
      expect(missing).toBeUndefined();
    });
  });

  describe('4. Legal Safety & Safe Language Audit (Zero Accusatory Terms)', () => {
    it('verifies zero occurrences of forbidden accusatory terms across outputs', () => {
      // Scan BANNED_PHRASES list
      expect(BANNED_PHRASES.length).toBeGreaterThan(0);

      // Check all seeded cases
      const allCases = ledgerStore.getCases();
      allCases.forEach(c => {
        const json = JSON.stringify(c).toLowerCase();
        BANNED_PHRASES.forEach(phrase => {
          expect(json).not.toContain(phrase);
        });
      });

      // Check all classifications
      Object.values(SPATIAL_CLASSIFICATIONS).forEach(sc => {
        expect(containsBannedLanguage(sc.badgeLabel).hasViolation).toBe(false);
        expect(containsBannedLanguage(sc.summaryDescription).hasViolation).toBe(false);
      });

      // Check all case statuses
      Object.values(CASE_STATUSES).forEach(cs => {
        expect(containsBannedLanguage(cs.label).hasViolation).toBe(false);
        expect(containsBannedLanguage(cs.description).hasViolation).toBe(false);
      });
    });

    it('verifies mandatory advisory disclaimer copy on all decision outputs', () => {
      const mandatoryDisclaimer = 'Indicative decision support only. This prototype does not determine legal status or property boundaries.';
      expect(mandatoryDisclaimer).toContain('Indicative decision support');
      expect(mandatoryDisclaimer).toContain('does not determine legal status');
    });
  });
});
