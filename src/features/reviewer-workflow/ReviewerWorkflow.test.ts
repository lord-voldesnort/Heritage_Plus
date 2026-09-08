import { describe, it, expect, beforeEach } from 'vitest';
import { LedgerStore } from '../../shared/lib/ledgerStore';
import { ClientStorageAdapter } from '../../shared/lib/persistenceAdapter';
import { resolveMultiTierSpatialResult } from '../../shared/lib/spatialEngine';
import { SHIVNERI_SITE, SHIVNERI_GEOMETRY } from '../../shared/mock-data/mockSite';
import { CASE_STATUSES } from '../../shared/constants/caseStatuses';
import { PERMITTED_ACTIONS } from './ReviewerActionCard';

describe('A6 Reviewer Workflow & Review-Event Integrity Suite', () => {
  let adapter: ClientStorageAdapter;
  let store: LedgerStore;

  beforeEach(() => {
    adapter = new ClientStorageAdapter('test_hp_reviewer_workflow_key');
    adapter.clear();
    store = new LedgerStore(adapter);
  });

  function createSampleCase(desc: string = 'Sample observation for reviewer triage') {
    const spatialResult = resolveMultiTierSpatialResult({
      latitude: 19.1980,
      longitude: 73.8580,
      gpsAccuracyMeters: 4.5,
      factualDescription: desc,
    });

    return store.createCase(
      {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_GEOMETRY.geometryId,
        category: 'POSSIBLE_CONSTRUCTION',
        factualDescription: desc,
        latitude: 19.1980,
        longitude: 73.8580,
        gpsAccuracyMeters: 4.5,
        reporterType: 'VISITOR',
        photoUrl: 'https://example.com/test-evidence.jpg',
      },
      spatialResult
    );
  }

  // 1. Valid transitions across all permitted actions
  it('1. Valid transition: supports all permitted reviewer actions and updates case status correctly', () => {
    for (const action of PERMITTED_ACTIONS) {
      const c = createSampleCase(`Testing action: ${action.key}`);
      const initialCount = c.eventsTimeline.length;

      const updated = store.recordReviewAction(
        c.caseId,
        action.targetStatus,
        `Institutional justification for action: ${action.label}`,
        'Heritage Curator'
      );

      expect(updated).not.toBeNull();
      expect(updated?.currentStatus).toBe(action.targetStatus);
      expect(updated?.eventsTimeline.length).toBe(initialCount + 1);

      const latestEvent = updated?.eventsTimeline[updated.eventsTimeline.length - 1];
      expect(latestEvent?.resultingStatus).toBe(action.targetStatus);
      expect(latestEvent?.actionTaken).toBe(action.targetStatus);
      expect(latestEvent?.reviewerNotes).toContain(action.label);
    }
  });

  // 2. Invalid transition rejection
  it('2. Invalid transition rejection: safely rejects unknown actions, returns null, and leaves state unmutated', () => {
    const c = createSampleCase('Testing invalid transition rejection');
    const initialCount = c.eventsTimeline.length;
    const initialStatus = c.currentStatus;

    const invalidResult = store.recordReviewAction(
      c.caseId,
      'UNKNOWN_MALFORMED_STATUS' as any,
      'Malformed action note',
      'REVIEWER'
    );

    expect(invalidResult).toBeNull();

    const unmodified = store.getCaseById(c.caseId);
    expect(unmodified?.currentStatus).toBe(initialStatus);
    expect(unmodified?.eventsTimeline.length).toBe(initialCount);
  });

  // 3. Note and justification validation
  it('3. Note validation: accurately preserves detailed reviewer justification without truncation or corruption', () => {
    const c = createSampleCase('Testing reviewer note preservation');
    const detailedNote =
      'Boundary ambiguity detected near western bastion. Physical ground survey scheduled with ASI Pune Circle.';

    const updated = store.recordReviewAction(
      c.caseId,
      'FIELD_VERIFICATION_RECOMMENDED',
      detailedNote,
      'Senior Conservation Architect'
    );

    const latestEvent = updated?.eventsTimeline[updated.eventsTimeline.length - 1];
    expect(latestEvent?.reviewerNotes).toBe(detailedNote);
  });

  // 4. Event creation and metadata
  it('4. Event creation: generates unique event ID, ISO timestamp, actor role, and summary', () => {
    const c = createSampleCase('Testing event creation metadata');

    const updated = store.recordReviewAction(
      c.caseId,
      'REFERRED',
      'Forwarding compiled evidence packet to ASI Director General.',
      'Chief Heritage Officer'
    );

    const latestEvent = updated?.eventsTimeline[updated.eventsTimeline.length - 1];
    expect(latestEvent).toBeDefined();
    expect(latestEvent?.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(latestEvent?.caseId).toBe(c.caseId);
    expect(latestEvent?.actorRole).toBe('Chief Heritage Officer');
    expect(latestEvent?.eventType).toBe('REVIEW_ACTION_RECORDED');
    expect(new Date(latestEvent?.timestamp || '').getTime()).toBeGreaterThan(0);
  });

  // 5. Event persistence across storage rehydration
  it('5. Event persistence: review events persist through simulated application restart / reload', () => {
    const c = createSampleCase('Testing event persistence');

    store.recordReviewAction(
      c.caseId,
      'ADDITIONAL_INFORMATION_NEEDED',
      'High-precision GPS observation requested from eastern perimeter.',
      'Heritage Curator'
    );

    // Simulate page reload / new store instance on same storage adapter
    const reloadedStore = new LedgerStore(adapter);
    const reloadedCase = reloadedStore.getCaseById(c.caseId);

    expect(reloadedCase?.currentStatus).toBe('ADDITIONAL_INFORMATION_NEEDED');
    expect(reloadedCase?.eventsTimeline.length).toBe(5);

    const reloadedEvent = reloadedCase?.eventsTimeline[4];
    expect(reloadedEvent?.reviewerNotes).toContain('High-precision GPS observation requested');
  });

  // 6. Event ordering (strictly monotonic chronological timeline)
  it('6. Event ordering: events are chronologically ordered and strictly append-only', () => {
    const c = createSampleCase('Testing event timeline monotonicity');

    store.recordReviewAction(c.caseId, 'ADDITIONAL_INFORMATION_NEEDED', 'Note 1', 'Curator A');
    store.recordReviewAction(c.caseId, 'FIELD_VERIFICATION_RECOMMENDED', 'Note 2', 'Curator B');
    store.recordReviewAction(c.caseId, 'REFERRED', 'Note 3', 'Curator C');

    const retrieved = store.getCaseById(c.caseId);
    expect(retrieved?.eventsTimeline.length).toBe(7);

    for (let i = 0; i < (retrieved?.eventsTimeline.length || 0) - 1; i++) {
      const t1 = new Date(retrieved!.eventsTimeline[i].timestamp).getTime();
      const t2 = new Date(retrieved!.eventsTimeline[i + 1].timestamp).getTime();
      expect(t1).toBeLessThanOrEqual(t2);
    }
  });

  // 7. Previous event preservation
  it('7. Previous event preservation: historical events are never mutated when new actions are appended', () => {
    const c = createSampleCase('Testing historical event immutability');
    const originalEventsSnapshot = JSON.parse(JSON.stringify(c.eventsTimeline));

    store.recordReviewAction(c.caseId, 'CLOSED_REVIEWED', 'Routine record cataloged.', 'Curator');

    const retrieved = store.getCaseById(c.caseId);
    expect(retrieved?.eventsTimeline.slice(0, 4)).toEqual(originalEventsSnapshot);
  });

  // 8. Queue reflection
  it('8. Queue reflection: listCases accurately reflects updated status and filter matches', () => {
    const c = createSampleCase('Testing queue reflection');

    store.recordReviewAction(c.caseId, 'FIELD_VERIFICATION_RECOMMENDED', 'Inspection needed.', 'Curator');

    const filteredCases = store.getCases({ status: 'FIELD_VERIFICATION_RECOMMENDED' });
    const match = filteredCases.find((item) => item.caseId === c.caseId);
    expect(match).toBeDefined();
    expect(match?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
  });

  // 9. Status update integrity
  it('9. Status update: case currentStatus matches resulting status and is verified against CASE_STATUSES', () => {
    const c = createSampleCase('Testing status update integrity');

    const updated = store.recordReviewAction(c.caseId, 'CLOSED_DUPLICATE', 'Duplicate of HP-MH-2026-0001.', 'Curator');

    expect(updated?.currentStatus).toBe('CLOSED_DUPLICATE');
    expect(CASE_STATUSES['CLOSED_DUPLICATE'].isTerminal).toBe(true);
  });

  // 10. Closed-case protection & explicit auditing
  it('10. Closed-case behavior: recording an action on a closed case appends an explicit event without erasing history', () => {
    const c = createSampleCase('Testing closed case action auditing');

    // Close the case
    store.recordReviewAction(c.caseId, 'CLOSED_REVIEWED', 'Initial closure: no action needed.', 'Curator 1');
    const closedCase = store.getCaseById(c.caseId);
    expect(closedCase?.currentStatus).toBe('CLOSED_REVIEWED');
    expect(closedCase?.eventsTimeline.length).toBe(5);

    // Re-evaluate / append subsequent administrative note
    const reAction = store.recordReviewAction(
      c.caseId,
      'FIELD_VERIFICATION_RECOMMENDED',
      'Reopened: Secondary citizen report indicates ongoing activity.',
      'Superintending Archaeologist'
    );

    expect(reAction?.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
    expect(reAction?.eventsTimeline.length).toBe(6);
    expect(reAction?.eventsTimeline[4].resultingStatus).toBe('CLOSED_REVIEWED');
    expect(reAction?.eventsTimeline[5].resultingStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
  });
});
