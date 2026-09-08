import {
  ObservationRecord,
  ReviewEvent,
  SpatialResult,
  CaseStatus,
  ObservationType,
  SpatialClassification,
  EvidenceRecord,
} from '../types';
import { MOCK_CASES } from '../mock-data/mockCases';
import { generateNextCaseId, generateUUID } from './caseGenerator';
import { PersistenceAdapter, ClientStorageAdapter } from './persistenceAdapter';
import { CASE_STATUSES } from '../constants/caseStatuses';
import {
  buildCanonicalReviewerPacketData,
  CanonicalReviewerPacketData,
} from '../contracts/heritagePulseContract';

export interface CaseFilters {
  category?: ObservationType;
  status?: CaseStatus;
  classification?: SpatialClassification;
  searchQuery?: string;
}

export class LedgerStore {
  private cases: ObservationRecord[];
  private adapter: PersistenceAdapter;

  constructor(adapter?: PersistenceAdapter) {
    this.adapter = adapter || new ClientStorageAdapter();
    this.cases = this.hydrateCases();
  }

  private hydrateCases(): ObservationRecord[] {
    const loaded = this.adapter.loadCases();
    if (loaded && Array.isArray(loaded) && loaded.length > 0) {
      // Merge seeded MOCK_CASES with loaded cases to guarantee benchmark cases exist
      const loadedMap = new Map(loaded.map((c) => [c.caseId.toLowerCase(), c]));
      for (const mockCase of MOCK_CASES) {
        if (!loadedMap.has(mockCase.caseId.toLowerCase())) {
          loaded.push(mockCase);
        }
      }
      return loaded;
    }
    // Seed initial cases into persistent storage
    const initial = [...MOCK_CASES];
    this.adapter.saveCases(initial);
    return initial;
  }

  public getCases(filters?: CaseFilters): ObservationRecord[] {
    let result = [...this.cases];
    if (!filters) return result;

    if (filters.category) {
      result = result.filter((c) => c.category === filters.category);
    }
    if (filters.status) {
      result = result.filter((c) => c.currentStatus === filters.status);
    }
    if (filters.classification) {
      result = result.filter(
        (c) => (c.spatialResult?.classification || c.computedClassification) === filters.classification
      );
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.caseId.toLowerCase().includes(q) ||
          c.factualDescription.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public listCases(filters?: CaseFilters): ObservationRecord[] {
    return this.getCases(filters);
  }

  public getCaseById(caseId: string): ObservationRecord | undefined {
    if (!caseId) return undefined;
    return this.cases.find((c) => c.caseId.toLowerCase() === caseId.trim().toLowerCase());
  }

  public getCase(caseId: string): ObservationRecord | undefined {
    return this.getCaseById(caseId);
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
      photoMetadata?: {
        fileName?: string;
        sizeKb?: number;
        capturedDate?: string;
      };
    },
    spatialResult: SpatialResult
  ): ObservationRecord {
    // 1. Strict Input Validation
    if (!data.factualDescription || !data.factualDescription.trim()) {
      throw new Error('Factual observation description cannot be empty.');
    }
    if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) {
      throw new Error('Observation coordinates must be valid finite numbers.');
    }
    if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
      throw new Error('Observation coordinates are outside valid WGS 84 bounds.');
    }
    if (!Number.isFinite(data.gpsAccuracyMeters) || data.gpsAccuracyMeters < 0) {
      throw new Error('GPS accuracy error must be a valid non-negative number.');
    }
    if (!spatialResult || !spatialResult.classification) {
      throw new Error('Spatial reasoning result is required for case creation.');
    }

    const caseId = generateNextCaseId('MH', this.cases);
    const observationId = generateUUID();
    const now = new Date().toISOString();

    const newEvidence: EvidenceRecord[] = data.photoUrl
      ? [
          {
            evidenceId: generateUUID(),
            observationId,
            fileUrl: data.photoUrl,
            fileMimeType: 'image/jpeg',
            fileSizeBytes: data.photoMetadata?.sizeKb ? data.photoMetadata.sizeKb * 1024 : 1024000,
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
        actorRole: data.reporterType || 'Citizen Observer',
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
        summary: `Spatial reasoning completed: ${spatialResult.classification}. Distance: ${
          spatialResult.distanceToBoundaryMeters !== null ? `${spatialResult.distanceToBoundaryMeters}m` : 'N/A'
        }.`,
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
      factualDescription: data.factualDescription.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      gpsAccuracyMeters: data.gpsAccuracyMeters,
      observedTimestamp: now,
      privacyConsentGiven: true,
      computedClassification: spatialResult.classification,
      distanceToBoundaryMeters: spatialResult.distanceToBoundaryMeters,
      spatialReasoningExplanation: spatialResult.explanation,
      spatialResult,
      currentStatus: 'SUBMITTED_FOR_REVIEW',
      evidenceList: newEvidence,
      eventsTimeline,
    };

    // Prepend to cases list and persist atomically
    const nextCases = [newCase, ...this.cases];
    const saved = this.adapter.saveCases(nextCases);
    if (!saved) {
      console.warn('Warning: Storage write-through failed; case kept in runtime memory.');
    }
    this.cases = nextCases;
    return newCase;
  }

  public recordReviewAction(
    caseId: string,
    action: CaseStatus,
    notes: string,
    reviewerRole: string = 'Heritage Curator'
  ): ObservationRecord | null {
    const targetCase = this.getCaseById(caseId);
    if (!targetCase) return null;

    // Validate permitted action
    if (!CASE_STATUSES[action]) {
      console.error(`Invalid case status action: ${action}`);
      return null;
    }

    const now = new Date().toISOString();
    const eventId = generateUUID();

    const newEvent: ReviewEvent = {
      eventId,
      caseId: targetCase.caseId,
      timestamp: now,
      eventType: 'REVIEW_ACTION_RECORDED',
      actorRole: reviewerRole,
      summary: `Reviewer recorded action: ${CASE_STATUSES[action]?.label || action}`,
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

    const nextCases = this.cases.map((c) =>
      c.caseId.toLowerCase() === targetCase.caseId.toLowerCase() ? updatedCase : c
    );
    this.adapter.saveCases(nextCases);
    this.cases = nextCases;
    return updatedCase;
  }

  public appendLedgerEvent(caseId: string, event: ReviewEvent): ObservationRecord | null {
    const targetCase = this.getCaseById(caseId);
    if (!targetCase) return null;

    const updatedCase: ObservationRecord = {
      ...targetCase,
      currentStatus: event.resultingStatus || targetCase.currentStatus,
      eventsTimeline: [...targetCase.eventsTimeline, event],
    };

    const nextCases = this.cases.map((c) =>
      c.caseId.toLowerCase() === targetCase.caseId.toLowerCase() ? updatedCase : c
    );
    this.adapter.saveCases(nextCases);
    this.cases = nextCases;
    return updatedCase;
  }

  public getLedgerTimeline(caseId: string): ReviewEvent[] {
    const targetCase = this.getCaseById(caseId);
    return targetCase ? [...targetCase.eventsTimeline] : [];
  }

  public saveEvidenceMetadata(caseId: string, evidence: EvidenceRecord): EvidenceRecord[] {
    const targetCase = this.getCaseById(caseId);
    if (!targetCase) return [];

    const updatedEvidence = [...targetCase.evidenceList, evidence];
    const updatedCase: ObservationRecord = {
      ...targetCase,
      evidenceList: updatedEvidence,
    };

    const nextCases = this.cases.map((c) =>
      c.caseId.toLowerCase() === targetCase.caseId.toLowerCase() ? updatedCase : c
    );
    this.adapter.saveCases(nextCases);
    this.cases = nextCases;
    return updatedEvidence;
  }

  public getEvidence(caseId: string): EvidenceRecord[] {
    const targetCase = this.getCaseById(caseId);
    return targetCase ? [...targetCase.evidenceList] : [];
  }

  public getPacketData(caseId: string): CanonicalReviewerPacketData | null {
    const targetCase = this.getCaseById(caseId);
    if (!targetCase) return null;
    return buildCanonicalReviewerPacketData(targetCase);
  }

  public updateCaseIfAllowed(caseId: string, update: Partial<ObservationRecord>): ObservationRecord | null {
    const targetCase = this.getCaseById(caseId);
    if (!targetCase) return null;

    // Protect immutable fields from unauthorized overwrite
    const safeUpdate = { ...update };
    delete (safeUpdate as any).spatialResult;
    delete (safeUpdate as any).computedClassification;
    delete (safeUpdate as any).distanceToBoundaryMeters;
    delete (safeUpdate as any).caseId;
    delete (safeUpdate as any).observationId;

    const updatedCase: ObservationRecord = {
      ...targetCase,
      ...safeUpdate,
      eventsTimeline: targetCase.eventsTimeline, // Never erase events
    };

    const nextCases = this.cases.map((c) =>
      c.caseId.toLowerCase() === targetCase.caseId.toLowerCase() ? updatedCase : c
    );
    this.adapter.saveCases(nextCases);
    this.cases = nextCases;
    return updatedCase;
  }

  public resetDemoData(): void {
    // Reset back to baseline MOCK_CASES
    const initial = [...MOCK_CASES];
    this.adapter.saveCases(initial);
    this.cases = initial;
  }
}

export const ledgerStore = new LedgerStore();
