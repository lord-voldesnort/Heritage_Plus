/**
 * Integration test for getReviewerPacketData() itself (not just the raw API)
 * — this is the function src/test/person4-journey.test.ts's "Gap 4" and
 * "Gap 6" tests used to exercise synchronously against the in-memory
 * ledgerStore fixture. It's now async and backed by the real API, so this
 * test creates a real case via the live server and confirms the packet
 * mapping is correct end-to-end, including that it reflects a real reviewer
 * action.
 *
 * Requires the same live backend as src/test/api-integration.test.ts (see
 * that file's header for setup steps); skips gracefully if unreachable.
 */
import { describe, it, expect } from 'vitest';
import { getReviewerPacketData, CANONICAL_NON_LEGAL_NOTICE } from './packetData';
import { CANONICAL_LEGAL_DISCLAIMER } from '../../shared/constants/disclaimer';
import { PROVENANCE_METADATA } from '../../shared/mock-data/siteGeometry';
import { IntegrationApiClient } from '../../test/helpers/apiTestClient';

const TEST_EMAIL = 'integration-tests@heritagepulse.local';
const TEST_PASSWORD = process.env.SEED_TEST_REVIEWER_PASSWORD || 'integration-test-only-password-1';

const probe = new IntegrationApiClient();
const serverReachable = await probe.isReachable().catch(() => false);

if (!serverReachable) {
  // eslint-disable-next-line no-console
  console.warn('\n[packetData.integration.test.ts] SKIPPED: no live API reachable — see api-integration.test.ts header for setup.\n');
}

describe.skipIf(!serverReachable)('getReviewerPacketData — live integration', () => {
  it('builds a complete packet from a real case, with correct provenance, and reflects a real reviewer action', async () => {
    const client = new IntegrationApiClient();
    const created = await client.createCase({
      siteId: 'site-shivneri-01',
      category: 'POSSIBLE_ENCROACHMENT',
      factualDescription: 'Integration test: packet data generation end-to-end.',
      latitude: '19.1970',
      longitude: '73.8600',
      gpsAccuracyMeters: '6',
    });
    expect(created.status).toBe(201);
    const caseId = created.body.case.caseId;

    const packetBefore = await getReviewerPacketData(caseId);
    expect(packetBefore).not.toBeNull();
    if (!packetBefore) return;

    // Core fields sourced from the live server response
    expect(packetBefore.caseId).toBe(caseId);
    expect(packetBefore.category).toBe('POSSIBLE_ENCROACHMENT');
    expect(packetBefore.description).toBe('Integration test: packet data generation end-to-end.');
    expect(packetBefore.latitude).toBeCloseTo(19.197, 3);
    expect(packetBefore.longitude).toBeCloseTo(73.86, 3);
    expect(packetBefore.computedClassification).toBe('POTENTIAL_ZONE_CONCERN');
    expect(packetBefore.currentStatus).toBe('SUBMITTED_FOR_REVIEW');
    expect(packetBefore.rawEvents.length).toBeGreaterThan(0);

    // Provenance/legal text — static, but confirms the mapping wires them through
    expect(packetBefore.sourceUrl).toBe(PROVENANCE_METADATA.portalUrl);
    expect(packetBefore.retrievalDate).toBe(PROVENANCE_METADATA.retrievalDate);
    expect(packetBefore.crs).toBe(PROVENANCE_METADATA.crs);
    expect(packetBefore.disclaimer).toBe(CANONICAL_LEGAL_DISCLAIMER);
    expect(packetBefore.nonLegalNotice).toBe(CANONICAL_NON_LEGAL_NOTICE);

    // Record a real reviewer decision and confirm the packet reflects it
    const authed = new IntegrationApiClient();
    await authed.login(TEST_EMAIL, TEST_PASSWORD);
    const reviewResult = await authed.review(caseId, 'ADDITIONAL_INFORMATION_NEEDED', 'High resolution survey needed.');
    expect(reviewResult.status).toBe(200);

    const packetAfter = await getReviewerPacketData(caseId);
    expect(packetAfter?.currentStatus).toBe('ADDITIONAL_INFORMATION_NEEDED');
    expect(packetAfter?.latestReviewEvent?.reviewerNotes).toBe('High resolution survey needed.');
    expect(packetAfter?.rawEvents.length).toBe(packetBefore.rawEvents.length + 1);
  });

  it('returns null for a case ID that does not exist', async () => {
    const packet = await getReviewerPacketData('HP-MH-2026-9999');
    expect(packet).toBeNull();
  });
});
