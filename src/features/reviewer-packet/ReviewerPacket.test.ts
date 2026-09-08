import { describe, it, expect } from 'vitest';
import {
  buildCanonicalReviewerPacketData,
  CANONICAL_LEGAL_DISCLAIMER,
  containsBannedLanguage,
} from '../../shared/contracts/heritagePulseContract';
import { ledgerStore } from '../../shared/lib/ledgerStore';
import { ObservationRecord } from '../../shared/types';

describe('Reviewer Packet Canonical Data Integration', () => {
  it('builds canonical reviewer packet data from a stored case record without recalculation', () => {
    const mockCase = ledgerStore.getCaseById('HP-MH-2026-0001');
    expect(mockCase).toBeDefined();

    if (!mockCase) return;

    const packet = buildCanonicalReviewerPacketData(mockCase);

    expect(packet.caseId).toBe('HP-MH-2026-0001');
    expect(packet.siteName).toContain('Shivner');
    expect(packet.monumentNumber).toBe('MUMMH015');
    expect(packet.category).toBe('POSSIBLE_CONSTRUCTION');
    expect(packet.factualDescription).toBe(mockCase.factualDescription);
    expect(packet.coordinates.latitude).toBe(19.1982);
    expect(packet.coordinates.longitude).toBe(73.8624);
    expect(packet.coordinates.gpsAccuracyMeters).toBe(4.5);
    expect(packet.spatialVerdict.classification).toBe('POTENTIAL_ZONE_CONCERN');
    expect(packet.spatialVerdict.distanceToBoundaryMeters).toBe(0.0);
    expect(packet.spatialVerdict.isUncertaintyOverlap).toBe(false);
    expect(packet.disclaimer).toBe(CANONICAL_LEGAL_DISCLAIMER);
    expect(packet.evidenceList.length).toBe(1);
    expect(packet.eventsTimeline.length).toBe(4);
    expect(packet.currentStatus).toBe('SUBMITTED_FOR_REVIEW');
  });

  it('correctly flags uncertainty overlap when distance is within GPS uncertainty error', () => {
    const mockCase = ledgerStore.getCaseById('HP-MH-2026-0002');
    expect(mockCase).toBeDefined();

    if (!mockCase) return;

    const packet = buildCanonicalReviewerPacketData(mockCase);

    expect(packet.caseId).toBe('HP-MH-2026-0002');
    expect(packet.category).toBe('PHYSICAL_DAMAGE');
    expect(packet.spatialVerdict.classification).toBe('LOCATION_UNCERTAIN');
    expect(packet.spatialVerdict.distanceToBoundaryMeters).toBe(6.2);
    expect(packet.coordinates.gpsAccuracyMeters).toBe(14.5);
    expect(packet.spatialVerdict.isUncertaintyOverlap).toBe(true);
    expect(packet.currentStatus).toBe('ADDITIONAL_INFORMATION_NEEDED');
  });

  it('handles observations with no attached photo evidence without inventing data', () => {
    const caseWithoutPhoto: ObservationRecord = {
      observationId: 'obs-no-photo-001',
      caseId: 'HP-MH-2026-0099',
      siteId: 'site-shivneri-01',
      geometryId: 'geom-shivneri-v1',
      reporterType: 'VISITOR',
      category: 'DUMPING_OR_WASTE',
      factualDescription: 'Discarded packaging rubble observed near north path.',
      latitude: 19.1985,
      longitude: 73.8615,
      gpsAccuracyMeters: 5.0,
      observedTimestamp: '2026-09-07T08:00:00.000Z',
      privacyConsentGiven: true,
      computedClassification: 'NO_SPATIAL_CONCERN_INDICATED',
      distanceToBoundaryMeters: 45.0,
      spatialReasoningExplanation: 'Point coordinates fall outside the sourced boundary layer.',
      currentStatus: 'SUBMITTED_FOR_REVIEW',
      evidenceList: [],
      eventsTimeline: [],
    };

    const packet = buildCanonicalReviewerPacketData(caseWithoutPhoto);

    expect(packet.evidenceList).toEqual([]);
    expect(packet.evidenceList.length).toBe(0);
    expect(packet.factualDescription).toBe('Discarded packaging rubble observed near north path.');
  });

  it('preserves immutable review timeline history and reviewer notes', () => {
    const mockCase = ledgerStore.getCaseById('HP-MH-2026-0002');
    expect(mockCase).toBeDefined();
    if (!mockCase) return;

    const packet = buildCanonicalReviewerPacketData(mockCase);
    const reviewEvent = packet.eventsTimeline.find((e) => e.eventType === 'REVIEW_ACTION_RECORDED');

    expect(reviewEvent).toBeDefined();
    expect(reviewEvent?.reviewerNotes).toContain('GPS uncertainty disk');
    expect(reviewEvent?.actionTaken).toBe('ADDITIONAL_INFORMATION_NEEDED');
  });

  it('contains zero banned accusatory phrasing across all canonical packet definitions', () => {
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
