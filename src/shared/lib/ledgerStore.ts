import { ObservationRecord, ReviewEvent, SpatialResult, CaseStatus } from '../types';
import { MOCK_CASES } from '../mock-data/mockCases';
import { generateNextCaseId, generateUUID } from './caseGenerator';

const STORAGE_KEY = 'heritage_pulse_cases_v1';
const DEMO_IDS_KEY = 'heritage_pulse_demo_ids_v1';

function loadCasesFromStorage(): ObservationRecord[] | null {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const isValid = parsed.every(
      (item) =>
        item &&
        typeof item.caseId === 'string' &&
        Array.isArray(item.eventsTimeline) &&
        item.spatialResult &&
        typeof item.currentStatus === 'string'
    );
    return isValid ? parsed : null;
  } catch (err) {
    console.warn('Failed to load cases from localStorage, falling back to mock cases:', err);
    return null;
  }
}

function saveCasesToStorage(cases: ObservationRecord[]): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
    }
  } catch (err) {
    console.warn('Failed to save cases to localStorage:', err);
  }
}

function loadDemoIdsFromStorage(): string[] {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return [];
    }
    const raw = window.localStorage.getItem(DEMO_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDemoIdsToStorage(ids: Set<string>): void {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(DEMO_IDS_KEY, JSON.stringify([...ids]));
    }
  } catch {
    // Ignore storage errors
  }
}

class LedgerStore {
  private cases: ObservationRecord[];
  private demoCaseIds: Set<string>;

  constructor() {
    const persisted = loadCasesFromStorage();
    this.cases = persisted || [...MOCK_CASES];
    this.demoCaseIds = new Set(loadDemoIdsFromStorage());
  }

  public getCases(): ObservationRecord[] {
    return [...this.cases];
  }

  public getCaseById(caseId: string): ObservationRecord | undefined {
    return this.cases.find(c => c.caseId.toLowerCase() === caseId.toLowerCase());
  }

  public loadFromStorage(): void {
    const persisted = loadCasesFromStorage();
    if (persisted) {
      this.cases = persisted;
    }
    this.demoCaseIds = new Set(loadDemoIdsFromStorage());
  }

  public saveToStorage(): void {
    saveCasesToStorage(this.cases);
    saveDemoIdsToStorage(this.demoCaseIds);
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
      evidenceMetadata?: {
        fileMimeType?: string;
        fileSizeBytes?: number;
        sha256Checksum?: string;
      };
    },
    spatialResult: SpatialResult,
    isDemoScenario: boolean = false
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
            fileMimeType: data.evidenceMetadata?.fileMimeType || 'image/jpeg',
            fileSizeBytes: data.evidenceMetadata?.fileSizeBytes || 1024000,
            sha256Checksum: data.evidenceMetadata?.sha256Checksum || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
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
      spatialResult,
      currentStatus: 'SUBMITTED_FOR_REVIEW',
      evidenceList: newEvidence,
      eventsTimeline,
    };

    // Prepend to cases list and persist
    this.cases = [newCase, ...this.cases];
    if (isDemoScenario) {
      this.demoCaseIds.add(caseId);
      saveDemoIdsToStorage(this.demoCaseIds);
    }
    saveCasesToStorage(this.cases);
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

    // Terminal closed-case protection: cannot modify closed cases
    const isTerminal =
      targetCase.currentStatus === 'CLOSED_REVIEWED' ||
      targetCase.currentStatus === 'CLOSED_DUPLICATE' ||
      targetCase.currentStatus === 'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE';

    if (isTerminal) {
      console.warn(`Cannot record review action on closed case ${caseId} (${targetCase.currentStatus}).`);
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
    saveCasesToStorage(this.cases);
    return updatedCase;
  }

  public appendReviewerDecision(
    caseId: string,
    actionTitle: string,
    resultingStatus: CaseStatus,
    notes: string,
    eventType: 'INFO_REQUESTED' | 'STATUS_UPDATED' | 'CASE_CLOSED' = 'STATUS_UPDATED',
    reviewerRole: string = 'REVIEWER'
  ): ObservationRecord | null {
    const targetCase = this.cases.find(c => c.caseId.toLowerCase() === caseId.toLowerCase());
    if (!targetCase) return null;

    // Terminal closed-case protection: cannot modify closed cases
    const isTerminal =
      targetCase.currentStatus === 'CLOSED_REVIEWED' ||
      targetCase.currentStatus === 'CLOSED_DUPLICATE' ||
      targetCase.currentStatus === 'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE';

    if (isTerminal) {
      console.warn(`Cannot append reviewer decision to closed case ${caseId} (${targetCase.currentStatus}).`);
      return null;
    }

    const now = new Date().toISOString();
    const eventId = generateUUID();

    const newEvent: ReviewEvent = {
      eventId,
      caseId: targetCase.caseId,
      timestamp: now,
      eventType,
      actorRole: reviewerRole,
      title: actionTitle,
      summary: `${actionTitle}: ${notes}`,
      actionTaken: resultingStatus,
      reviewerNotes: notes,
      resultingStatus,
    };

    // Append-only: create new case object with appended eventsTimeline
    const updatedCase: ObservationRecord = {
      ...targetCase,
      currentStatus: resultingStatus,
      eventsTimeline: [...targetCase.eventsTimeline, newEvent],
    };

    this.cases = this.cases.map(c => (c.caseId === targetCase.caseId ? updatedCase : c));
    saveCasesToStorage(this.cases);
    return updatedCase;
  }

  public resetDemoData(): void {
    // Preserve user-created field observations (not demo scenarios and not initial MOCK_CASES)
    const userCases = this.cases.filter(
      (c) =>
        !this.demoCaseIds.has(c.caseId) &&
        !MOCK_CASES.some((m) => m.caseId.toLowerCase() === c.caseId.toLowerCase())
    );

    // Re-seed baseline MOCK_CASES while preserving any user-created observations
    this.cases = [...userCases, ...MOCK_CASES];
    this.demoCaseIds.clear();
    saveCasesToStorage(this.cases);
    saveDemoIdsToStorage(this.demoCaseIds);
  }

  public resetAllData(): void {
    this.cases = [...MOCK_CASES];
    this.demoCaseIds.clear();
    saveCasesToStorage(this.cases);
    saveDemoIdsToStorage(this.demoCaseIds);
  }
}

export const ledgerStore = new LedgerStore();
