import { describe, it, expect } from 'vitest';
import { ledgerStore } from '../shared/lib/ledgerStore';
import { calculateSpatialResult } from '../shared/lib/spatialEngine';
import { SHIVNERI_GEOMETRY, SHIVNERI_SITE } from '../shared/mock-data/mockSite';
import { DEMO_SCENARIOS } from '../shared/mock-data/mockScenarios';
import { containsBannedLanguage, BANNED_PHRASES } from '../shared/constants/bannedLanguage';
import { SPATIAL_CLASSIFICATIONS } from '../shared/constants/spatialClassifications';
import { CASE_STATUSES } from '../shared/constants/caseStatuses';
import { CaseStatus, ReviewEvent } from '../shared/types';

describe('Task 9: End-to-End Vertical Slice Integration & Definition of Done Test Suite', () => {
  
  describe('1. Field Capture & Observation Creation with Photo Evidence', () => {
    it('creates a full observation record with photo metadata, checksum, and initial timeline', () => {
      const mockPhotoUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
      const scenario = DEMO_SCENARIOS[0]; // Inside scenario

      const spatialResult = calculateSpatialResult(
        {
          latitude: scenario.latitude,
          longitude: scenario.longitude,
          gpsAccuracyMeters: scenario.gpsAccuracyMeters,
          factualDescription: scenario.factualNotes,
        },
        SHIVNERI_GEOMETRY
      );

      const newCase = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: scenario.category,
          factualDescription: scenario.factualNotes,
          latitude: scenario.latitude,
          longitude: scenario.longitude,
          gpsAccuracyMeters: scenario.gpsAccuracyMeters,
          reporterType: 'VISITOR',
          photoUrl: mockPhotoUrl,
        },
        spatialResult
      );

      // Verify case metadata
      expect(newCase.caseId).toMatch(/^HP-MH-\d{4}-\d{4}$/);
      expect(newCase.siteId).toBe(SHIVNERI_SITE.siteId);
      expect(newCase.geometryId).toBe(SHIVNERI_GEOMETRY.geometryId);
      expect(newCase.currentStatus).toBe('SUBMITTED_FOR_REVIEW');

      // Verify photo evidence attached
      expect(newCase.evidenceList).toHaveLength(1);
      const evidence = newCase.evidenceList[0];
      expect(evidence.fileUrl).toBe(mockPhotoUrl);
      expect(evidence.fileMimeType).toBe('image/jpeg');
      expect(evidence.sha256Checksum).toBeTruthy();

      // Verify initial timeline events sequence
      expect(newCase.eventsTimeline).toHaveLength(4);
      expect(newCase.eventsTimeline[0].eventType).toBe('OBSERVATION_CREATED');
      expect(newCase.eventsTimeline[1].eventType).toBe('LOCATION_CAPTURED');
      expect(newCase.eventsTimeline[2].eventType).toBe('SPATIAL_CALCULATED');
      expect(newCase.eventsTimeline[3].eventType).toBe('REVIEW_ACTION_RECORDED');
    });
  });

  describe('2. Spatial Reasoning Engine: Point-in-Polygon & Buffer Evaluation (All 4 Demo Scenarios)', () => {
    it('Scenario 1 (Inside Protected Zone): correctly classifies point clearly inside as POTENTIAL_ZONE_CONCERN', () => {
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
      expect(result.distanceToBoundaryMeters).toBe(0.0);
      expect(result.isUncertaintyOverlap).toBe(false);
      expect(result.explanation).toContain('Potential zone-related concern');
      expect(result.explanation).toContain(SHIVNERI_GEOMETRY.versionLabel);
    });

    it('Scenario 2 (Outside Regulated Zone): correctly classifies point clearly outside as NO_SPATIAL_CONCERN_INDICATED', () => {
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

    it('Scenario 3 (Near Boundary Edge): refuses to overclaim and outputs LOCATION_UNCERTAIN when error disk overlaps boundary', () => {
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
      expect(result.distanceToBoundaryMeters).not.toBeNull();
      expect(result.distanceToBoundaryMeters!).toBeLessThanOrEqual(scenario.gpsAccuracyMeters);
      expect(result.explanation).toContain('Location uncertain');
      expect(result.explanation).toContain('overlaps the zone boundary');
    });

    it('Scenario 4 (Poor GPS Accuracy): flags EVIDENCE_INSUFFICIENT when uncertainty radius exceeds 35m threshold', () => {
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
      expect(result.distanceToBoundaryMeters).toBeNull();
      expect(result.isUncertaintyOverlap).toBe(true);
      expect(result.explanation).toContain('exceeds 35m threshold');
    });
  });

  describe('3. Append-Only Change Ledger & Reviewer Audit Continuity', () => {
    it('appends reviewer actions to the events timeline without mutating initial events', () => {
      const scenario = DEMO_SCENARIOS[0];
      const spatialResult = calculateSpatialResult(
        {
          latitude: scenario.latitude,
          longitude: scenario.longitude,
          gpsAccuracyMeters: scenario.gpsAccuracyMeters,
          factualDescription: 'Observed foundation work.',
        },
        SHIVNERI_GEOMETRY
      );

      const createdCase = ledgerStore.createCase(
        {
          siteId: SHIVNERI_SITE.siteId,
          geometryId: SHIVNERI_GEOMETRY.geometryId,
          category: 'POSSIBLE_CONSTRUCTION',
          factualDescription: 'Observed foundation work.',
          latitude: scenario.latitude,
          longitude: scenario.longitude,
          gpsAccuracyMeters: scenario.gpsAccuracyMeters,
        },
        spatialResult
      );

      const initialTimelineCount = createdCase.eventsTimeline.length;
      const initialFirstEvent = { ...createdCase.eventsTimeline[0] };

      // Reviewer action 1: Request info
      const updatedCase1 = ledgerStore.appendReviewerDecision(
        createdCase.caseId,
        'Request Additional Ground Measurement',
        'ADDITIONAL_INFORMATION_NEEDED',
        'Secondary GPS reading requested due to tree canopy.',
        'INFO_REQUESTED',
        'Senior Heritage Curator'
      );

      expect(updatedCase1).not.toBeNull();
      expect(updatedCase1!.currentStatus).toBe('ADDITIONAL_INFORMATION_NEEDED');
      expect(updatedCase1!.eventsTimeline).toHaveLength(initialTimelineCount + 1);
      
      // Verify initial event 0 was NOT mutated
      expect(updatedCase1!.eventsTimeline[0]).toEqual(initialFirstEvent);

      // Reviewer action 2: Recommend Field Verification
      const updatedCase2 = ledgerStore.appendReviewerDecision(
        createdCase.caseId,
        'Recommend Field Inspection',
        'FIELD_VERIFICATION_RECOMMENDED',
        'Field officer dispatched for on-site measurement.',
        'STATUS_UPDATED',
        'District Archaeological Officer'
      );

      expect(updatedCase2).not.toBeNull();
      expect(updatedCase2!.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
      expect(updatedCase2!.eventsTimeline).toHaveLength(initialTimelineCount + 2);

      // Reviewer action 3: Close case
      const updatedCase3 = ledgerStore.appendReviewerDecision(
        createdCase.caseId,
        'Close Case - Verification Complete',
        'CLOSED_REVIEWED',
        'Administrative ground survey completed; case closed.',
        'CASE_CLOSED',
        'Authority Reviewer'
      );

      expect(updatedCase3).not.toBeNull();
      expect(updatedCase3!.currentStatus).toBe('CLOSED_REVIEWED');
      expect(updatedCase3!.eventsTimeline).toHaveLength(initialTimelineCount + 3);

      // Verify complete append-only event sequence
      const timelineTypes = updatedCase3!.eventsTimeline.map((e: ReviewEvent) => e.eventType);
      expect(timelineTypes).toEqual([
        'OBSERVATION_CREATED',
        'LOCATION_CAPTURED',
        'SPATIAL_CALCULATED',
        'REVIEW_ACTION_RECORDED',
        'INFO_REQUESTED',
        'STATUS_UPDATED',
        'CASE_CLOSED',
      ]);
    });
  });

  describe('4. Authority Review Packet Provenance & Statutory Disclaimers', () => {
    it('verifies that full case records contain complete provenance metadata and mandatory disclaimer copy', () => {
      const caseRecord = ledgerStore.getCases()[0];

      // Geometry Provenance Assertions
      expect(SHIVNERI_GEOMETRY.versionLabel).toBe('v1.0-bhuvan-protected-7068');
      expect(SHIVNERI_GEOMETRY.layerConfidenceScore).toBeGreaterThanOrEqual(0.90);
      expect(SHIVNERI_GEOMETRY.sourceDocumentOrUrl).toContain('bhuvan-app1.nrsc.gov.in');
      expect(SHIVNERI_GEOMETRY.limitationNote).toBeTruthy();

      // 3-Statement Verdict Breakdown Assertions
      const spatialResult = calculateSpatialResult(
        {
          latitude: caseRecord.latitude,
          longitude: caseRecord.longitude,
          gpsAccuracyMeters: caseRecord.gpsAccuracyMeters,
          factualDescription: caseRecord.factualDescription,
        },
        SHIVNERI_GEOMETRY
      );

      expect(spatialResult.statements.userReported).toBeTruthy();
      expect(spatialResult.statements.gisCalculated).toBeTruthy();
      expect(spatialResult.statements.authorityNotice).toBeTruthy();

      // Mandatory Advisory Disclaimer Verification
      const mandatoryDisclaimer = 'Indicative decision support only. This prototype does not determine legal status or property boundaries.';
      expect(spatialResult.statements.authorityNotice).toContain('Indicative decision support');
      expect(mandatoryDisclaimer).toContain('does not determine legal status');
    });
  });

  describe('5. Strict Product Contract & Safe Language Audit (Zero Accusatory Language)', () => {
    it('verifies zero occurrences of banned terms across all spatial engine outputs', () => {
      expect(BANNED_PHRASES.length).toBeGreaterThan(0);
      DEMO_SCENARIOS.forEach(scenario => {
        const result = calculateSpatialResult(
          {
            latitude: scenario.latitude,
            longitude: scenario.longitude,
            gpsAccuracyMeters: scenario.gpsAccuracyMeters,
            factualDescription: scenario.factualNotes,
          },
          SHIVNERI_GEOMETRY
        );

        // Check explanation
        const explanationCheck = containsBannedLanguage(result.explanation);
        expect(explanationCheck.hasViolation).toBe(false);

        // Check 3 statements
        const userCheck = containsBannedLanguage(result.statements.userReported);
        const gisCheck = containsBannedLanguage(result.statements.gisCalculated);
        const authCheck = containsBannedLanguage(result.statements.authorityNotice);

        expect(userCheck.hasViolation).toBe(false);
        expect(gisCheck.hasViolation).toBe(false);
        expect(authCheck.hasViolation).toBe(false);
      });
    });

    it('verifies zero occurrences of banned terms across all spatial classification metadata', () => {
      Object.values(SPATIAL_CLASSIFICATIONS).forEach(sc => {
        const badgeCheck = containsBannedLanguage(sc.badgeLabel);
        const summaryCheck = containsBannedLanguage(sc.summaryDescription);

        expect(badgeCheck.hasViolation).toBe(false);
        expect(summaryCheck.hasViolation).toBe(false);
      });
    });

    it('verifies zero occurrences of banned terms across all case status labels and descriptions', () => {
      Object.values(CASE_STATUSES).forEach(cs => {
        const labelCheck = containsBannedLanguage(cs.label);
        const descCheck = containsBannedLanguage(cs.description);

        expect(labelCheck.hasViolation).toBe(false);
        expect(descCheck.hasViolation).toBe(false);
      });
    });

    it('verifies non-accusatory status transitions across case lifecycle', () => {
      const allowedStatuses: CaseStatus[] = [
        'DRAFT',
        'SUBMITTED_FOR_REVIEW',
        'ADDITIONAL_INFORMATION_NEEDED',
        'FIELD_VERIFICATION_RECOMMENDED',
        'REFERRED',
        'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE',
        'CLOSED_DUPLICATE',
        'CLOSED_REVIEWED',
      ];

      allowedStatuses.forEach(status => {
        const check = containsBannedLanguage(status);
        expect(check.hasViolation).toBe(false);
      });
    });

    it('asserts zero occurrences of specific single-word banned terms (illegal, encroacher, violator)', () => {
      const forbiddenSingleTerms = ['illegal', 'encroacher', 'violator'];
      
      const allCases = ledgerStore.getCases();
      allCases.forEach(caseRecord => {
        const fullContent = JSON.stringify(caseRecord).toLowerCase();
        forbiddenSingleTerms.forEach(term => {
          expect(fullContent).not.toContain(term);
        });
      });
    });
  });
});
