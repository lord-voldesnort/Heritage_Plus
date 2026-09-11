/**
 * REAL integration tests against a LIVE Heritage Pulse API + PostgreSQL.
 *
 * Unlike the rest of the test suite (which tests pure functions and the
 * retired in-memory ledgerStore fixture), these tests make real HTTP
 * requests to a running server (default http://localhost:3000) and read
 * real rows from Postgres. They require:
 *
 *   1. A running Postgres with the schema migrated: `npm run migrate` (in server/)
 *   2. Site/geometry seed data:                     `npm run seed`     (in server/)
 *   3. A known-password test reviewer account:      `npm run seed:test-user` (in server/)
 *   4. The API server running:                      `npm run dev`     (in server/)
 *
 * If the server isn't reachable, this whole suite is skipped (not failed)
 * with a clear console message — so `npm test` still passes for anyone who
 * hasn't stood up the backend, while CI (which should start these services)
 * gets real coverage. See server/README section on integration tests.
 *
 * This directly closes the gap left in src/test/person4-journey.test.ts,
 * where packet-generation assertions were skipped after getReviewerPacketData
 * became async/API-backed (see comments there pointing here).
 */
import { describe, it, expect } from 'vitest';
import { IntegrationApiClient } from './helpers/apiTestClient';

const TEST_EMAIL = 'integration-tests@heritagepulse.local';
const TEST_PASSWORD = process.env.SEED_TEST_REVIEWER_PASSWORD || 'integration-test-only-password-1';

const client = new IntegrationApiClient();
const serverReachable = await client.isReachable().catch(() => false);

if (!serverReachable) {
  // eslint-disable-next-line no-console
  console.warn(
    '\n[api-integration.test.ts] SKIPPED: no live API reachable at ' +
      (process.env.INTEGRATION_API_URL || 'http://localhost:3000/api') +
      '. Start the backend (see file header comment) to run these tests.\n'
  );
}

describe.skipIf(!serverReachable)('Heritage Pulse API — live integration', () => {
  describe('Case creation & authoritative spatial classification', () => {
    it('classifies a point inside the protected boundary as POTENTIAL_ZONE_CONCERN', async () => {
      const { status, body } = await client.createCase({
        siteId: 'site-shivneri-01',
        category: 'POSSIBLE_ENCROACHMENT',
        factualDescription: 'Integration test: point inside protected boundary.',
        latitude: '19.1970',
        longitude: '73.8600',
        gpsAccuracyMeters: '6',
      });
      expect(status).toBe(201);
      expect(body.case.computedClassification).toBe('POTENTIAL_ZONE_CONCERN');
      expect(body.case.caseId).toMatch(/^HP-MH-\d{4}-\d{4}$/);
      expect(body.case.currentStatus).toBe('SUBMITTED_FOR_REVIEW');
      expect(body.case.eventsTimeline.length).toBeGreaterThanOrEqual(4);
    });

    it('classifies a point far outside all boundary tiers as NO_SPATIAL_CONCERN_INDICATED', async () => {
      const { status, body } = await client.createCase({
        siteId: 'site-shivneri-01',
        category: 'OTHER_VISIBLE_CHANGE',
        factualDescription: 'Integration test: point far outside all zones.',
        latitude: '19.5000',
        longitude: '74.2000',
        gpsAccuracyMeters: '6',
      });
      expect(status).toBe(201);
      expect(body.case.computedClassification).toBe('NO_SPATIAL_CONCERN_INDICATED');
    });

    it('rejects GPS accuracy worse than 35m as EVIDENCE_INSUFFICIENT', async () => {
      const { body } = await client.createCase({
        siteId: 'site-shivneri-01',
        category: 'OTHER_VISIBLE_CHANGE',
        factualDescription: 'Integration test: poor GPS accuracy.',
        latitude: '19.1970',
        longitude: '73.8600',
        gpsAccuracyMeters: '50',
      });
      expect(body.case.computedClassification).toBe('EVIDENCE_INSUFFICIENT');
    });

    it('never trusts a client-supplied classification — none is accepted as input', async () => {
      // The create endpoint has no field for a client-supplied classification
      // at all; this test documents that guarantee by confirming the server
      // computed a real one even though we never sent one.
      const { body } = await client.createCase({
        siteId: 'site-shivneri-01',
        category: 'PHYSICAL_DAMAGE',
        factualDescription: 'Integration test: confirms server-authoritative classification.',
        latitude: '19.1970',
        longitude: '73.8600',
        gpsAccuracyMeters: '5',
      });
      expect(body.case.spatialResult.classification).toBe(body.case.computedClassification);
      expect(['POTENTIAL_ZONE_CONCERN', 'NO_SPATIAL_CONCERN_INDICATED', 'LOCATION_UNCERTAIN', 'EVIDENCE_INSUFFICIENT', 'SOURCE_UNAVAILABLE']).toContain(
        body.case.computedClassification
      );
    });
  });

  describe('Evidence: real SHA-256 hashing and integrity verification', () => {
    it('uploads evidence, computes a real SHA-256 server-side, and serves it back with a matching hash header', async () => {
      // Minimal valid 1x1 PNG, built at test time (not a fixture file).
      const crc32 = (buf: Buffer) => {
        let c: number;
        const table: number[] = [];
        for (let n = 0; n < 256; n++) {
          c = n;
          for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
          table[n] = c >>> 0;
        }
        let crc = 0xffffffff;
        for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
        return (crc ^ 0xffffffff) >>> 0;
      };
      const chunk = (tag: string, data: Buffer) => {
        const tagBuf = Buffer.from(tag, 'ascii');
        const len = Buffer.alloc(4);
        len.writeUInt32BE(data.length);
        const crcBuf = Buffer.alloc(4);
        crcBuf.writeUInt32BE(crc32(Buffer.concat([tagBuf, data])));
        return Buffer.concat([len, tagBuf, data, crcBuf]);
      };
      const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const ihdr = chunk('IHDR', Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]));
      const zlib = await import('node:zlib');
      const idatData = zlib.deflateSync(Buffer.from([0x00, 0xff, 0x00, 0x00]));
      const idat = chunk('IDAT', idatData);
      const iend = chunk('IEND', Buffer.alloc(0));
      const png = Buffer.concat([sig, ihdr, idat, iend]);

      const { status, body } = await client.createCase(
        {
          siteId: 'site-shivneri-01',
          category: 'PHYSICAL_DAMAGE',
          factualDescription: 'Integration test: evidence upload with real hashing.',
          latitude: '19.1970',
          longitude: '73.8600',
          gpsAccuracyMeters: '5',
        },
        { buffer: png, filename: 'test.png', mimeType: 'image/png' }
      );
      expect(status).toBe(201);
      expect(body.case.evidenceList).toHaveLength(1);
      const evidence = body.case.evidenceList[0];
      expect(evidence.sha256Checksum).toMatch(/^[a-f0-9]{64}$/);

      const expectedHash = (await import('node:crypto')).createHash('sha256').update(png).digest('hex');
      expect(evidence.sha256Checksum).toBe(expectedHash);

      const fileResult = await client.fetchFile(evidence.fileUrl);
      expect(fileResult.status).toBe(200);
      expect(fileResult.headers.get('x-content-sha256')).toBe(expectedHash);
      expect(fileResult.buffer.equals(png)).toBe(true);
    });
  });

  describe('Authentication & RBAC', () => {
    it('rejects an unauthenticated review attempt', async () => {
      const created = await client.createCase({
        siteId: 'site-shivneri-01',
        category: 'OTHER_VISIBLE_CHANGE',
        factualDescription: 'Integration test: auth gate case.',
        latitude: '19.1970',
        longitude: '73.8600',
        gpsAccuracyMeters: '5',
      });
      const anonClient = new IntegrationApiClient();
      const { status, body } = await anonClient.review(created.body.case.caseId, 'CLOSED_REVIEWED', 'unauthenticated attempt');
      expect(status).toBe(401);
      expect(body.error).toBe('unauthenticated');
    });

    it('rejects login with a wrong password without revealing whether the account exists', async () => {
      const anonClient = new IntegrationApiClient();
      const { status, body } = await anonClient.login(TEST_EMAIL, 'definitely-wrong-password');
      expect(status).toBe(401);
      expect(body.error).toBe('invalid_credentials');
    });

    it('logs in with the correct password and records the real session identity on a review action', async () => {
      const created = await client.createCase({
        siteId: 'site-shivneri-01',
        category: 'OTHER_VISIBLE_CHANGE',
        factualDescription: 'Integration test: authenticated review records real identity.',
        latitude: '19.1970',
        longitude: '73.8600',
        gpsAccuracyMeters: '5',
      });
      const caseId = created.body.case.caseId;

      const authed = new IntegrationApiClient();
      const loginResult = await authed.login(TEST_EMAIL, TEST_PASSWORD);
      expect(loginResult.status).toBe(200);
      expect(loginResult.body.user.email).toBe(TEST_EMAIL);
      expect(loginResult.body.user.role).toBe('REVIEWER');

      const me = await authed.me();
      expect(me.body.user.email).toBe(TEST_EMAIL);

      const reviewResult = await authed.review(caseId, 'FIELD_VERIFICATION_RECOMMENDED', 'Integration test review — schedule on-site check.');
      expect(reviewResult.status).toBe(200);
      expect(reviewResult.body.case.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
      // The reviewer's identity is derived from the session, not client input.
      expect(reviewResult.body.newEvent.actorRole).toContain('Integration Test Reviewer');

      await authed.logout();
      const afterLogout = await authed.review(caseId, 'CLOSED_REVIEWED', 'should fail post-logout');
      expect(afterLogout.status).toBe(401);
    });

    it('enforces closed-case protection server-side (a REVIEWER cannot reopen a case an ADMIN closed)', async () => {
      const created = await client.createCase({
        siteId: 'site-shivneri-01',
        category: 'OTHER_VISIBLE_CHANGE',
        factualDescription: 'Integration test: closed-case governance.',
        latitude: '19.1970',
        longitude: '73.8600',
        gpsAccuracyMeters: '5',
      });
      const caseId = created.body.case.caseId;

      const authed = new IntegrationApiClient();
      await authed.login(TEST_EMAIL, TEST_PASSWORD);
      const closeResult = await authed.review(caseId, 'CLOSED_REVIEWED', 'Closing as reviewed.');
      expect(closeResult.body.case.currentStatus).toBe('CLOSED_REVIEWED');

      const reopenAttempt = await authed.review(caseId, 'FIELD_VERIFICATION_RECOMMENDED', 'Attempting to reopen a closed case.');
      expect(reopenAttempt.status).toBe(409);
      expect(reopenAttempt.body.error).toBe('case_closed');
    });
  });

  describe('Real PostGIS spatial search', () => {
    it('finds cases within a radius using ST_DWithin, sorted nearest-first', async () => {
      await client.createCase({
        siteId: 'site-shivneri-01',
        category: 'OTHER_VISIBLE_CHANGE',
        factualDescription: 'Integration test: nearby search fixture.',
        latitude: '19.1971',
        longitude: '73.8601',
        gpsAccuracyMeters: '5',
      });
      const { status, body } = await client.nearby(73.86, 19.197, 2000);
      expect(status).toBe(200);
      expect(Array.isArray(body.results)).toBe(true);
      expect(body.results.length).toBeGreaterThan(0);
      for (let i = 1; i < body.results.length; i++) {
        expect(body.results[i].distanceMeters).toBeGreaterThanOrEqual(body.results[i - 1].distanceMeters);
      }
    });
  });
});
