import { ObservationRecord, ReviewEvent, SpatialResult, CaseStatus } from '../types';
import { MOCK_CASES } from '../mock-data/mockCases';
import { generateNextCaseId, generateUUID } from './caseGenerator';

class LedgerStore {
  private cases: ObservationRecord[];

  constructor() {
    this.cases = [...MOCK_CASES];
  }

  public getCases(): ObservationRecord[] {
    return [...this.cases];
  }

  public getCaseById(caseId: string): ObservationRecord | undefined {
    return this.cases.find(c => c.caseId.toLowerCase() === caseId.toLowerCase());
  }

  public createCase(
    data: {
      siteId: string;
      geometryId: string;
      category: ObservationRecord['category'];
      factualDescription: string;
      latitude: number;
      longitude: number;
      gpsAccuracyMeters: number;
      reporterType?: ObservationRecord['reporterType'];
      photoUrl?: string;
    },
    spatialResult: SpatialResult
  ): ObservationRecord {
    const caseId = generateNextCaseId('MH');
    const observationId = generateUUID();
    const now = new Date().toISOString();

    const newEvidence = data.photoUrl
      ? [
          {
            evidenceId: generateUUID(),
            observationId,
            fileUrl: data.photoUrl,
            fileMimeType: 'image/jpeg',
            fileSizeBytes: 1024000,
            sha256Checksum: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
            uploadTimestamp: now,
          },
        ]
      : [];

    const eventsTimeline: ReviewEvent[] = [
      {
        eventId: generateUUID(),
        caseId,
        timestamp: now,
        eventType: 'OBSERVATION_CREATED',
        actorRole: data.reporterType || 'Visitor',
        summary: `Field observation logged for category: ${data.category}`,
        resultingStatus: 'DRAFT',
      },
      {
        eventId: generateUUID(),
        caseId,
        timestamp: now,
        eventType: 'LOCATION_CAPTURED',
        actorRole: 'Device Hardware Sensor',
        summary: `GPS coordinates captured: (${data.latitude.toFixed(4)}°N, ${data.longitude.toFixed(4)}°E) with ±${data.gpsAccuracyMeters.toFixed(1)}m accuracy.`,
        resultingStatus: 'DRAFT',
      },
      {
        eventId: generateUUID(),
        caseId,
        timestamp: now,
        eventType: 'SPATIAL_CALCULATED',
        actorRole: 'Spatial Reasoning Engine',
        summary: `Spatial reasoning completed: ${spatialResult.classification}. Distance: ${spatialResult.distanceToBoundaryMeters ?? 'N/A'}m.`,
        resultingStatus: 'DRAFT',
      },
      {
        eventId: generateUUID(),
        caseId,
        timestamp: now,
        eventType: 'REVIEW_ACTION_RECORDED',
        actorRole: 'Change Ledger Dispatcher',
        summary: 'Case logged into append-only Change Ledger. Submitted for reviewer triage.',
        resultingStatus: 'SUBMITTED_FOR_REVIEW',
      },
    ];

    const newCase: ObservationRecord = {
      observationId,
      caseId,
      siteId: data.siteId,
      geometryId: data.geometryId,
      reporterType: data.reporterType || 'VISITOR',
      category: data.category,
      factualDescription: data.factualDescription,
      latitude: data.latitude,
      longitude: data.longitude,
      gpsAccuracyMeters: data.gpsAccuracyMeters,
      observedTimestamp: now,
      privacyConsentGiven: true,
      computedClassification: spatialResult.classification,
      distanceToBoundaryMeters: spatialResult.distanceToBoundaryMeters,
      spatialReasoningExplanation: spatialResult.explanation,
      currentStatus: 'SUBMITTED_FOR_REVIEW',
      evidenceList: newEvidence,
      eventsTimeline,
    };

    // Prepend to cases list
    this.cases = [newCase, ...this.cases];
    return newCase;
  }

  public recordReviewAction(
    caseId: string,
    action: CaseStatus,
    notes: string,
    reviewerRole: string = 'Heritage Curator'
  ): ObservationRecord | null {
    const targetCase = this.cases.find(c => c.caseId.toLowerCase() === caseId.toLowerCase());
    if (!targetCase) return null;

    const now = new Date().toISOString();
    const eventId = generateUUID();

    const newEvent: ReviewEvent = {
      eventId,
      caseId: targetCase.caseId,
      timestamp: now,
      eventType: 'REVIEW_ACTION_RECORDED',
      actorRole: reviewerRole,
      summary: `Reviewer recorded action: ${action}`,
      actionTaken: action,
      reviewerNotes: notes,
      resultingStatus: action,
    };

    // Append-only: create new case object with appended eventsTimeline
    const updatedCase: ObservationRecord = {
      ...targetCase,
      currentStatus: action,
      eventsTimeline: [...targetCase.eventsTimeline, newEvent],
    };

    this.cases = this.cases.map(c => (c.caseId === targetCase.caseId ? updatedCase : c));
    return updatedCase;
  }
}

export const ledgerStore = new LedgerStore();
