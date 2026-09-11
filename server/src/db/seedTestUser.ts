/**
 * Seeds ONE dedicated account for the integration test suite, with a known
 * password so tests can log in deterministically. This is intentionally
 * separate from seedUsers.ts (which bootstraps real admin/curator accounts
 * with randomly-generated, one-time-shown passwords) — test credentials
 * should never be the same as real operator credentials.
 *
 * Run before the integration tests: `npm run seed:test-user`
 * Override the password via SEED_TEST_REVIEWER_PASSWORD if desired; tests
 * read the same variable (see src/test/api-integration.test.ts).
 */
import { pool } from './pool.js';
import { hashPassword } from '../lib/auth.js';

const TEST_EMAIL = 'integration-tests@heritagepulse.local';
const TEST_PASSWORD = process.env.SEED_TEST_REVIEWER_PASSWORD || 'integration-test-only-password-1';

async function main() {
  const passwordHash = await hashPassword(TEST_PASSWORD);
  await pool.query(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, 'Integration Test Reviewer', 'REVIEWER')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, failed_login_attempts = 0, locked_until = NULL`,
    [TEST_EMAIL, passwordHash]
  );
  console.log(`[seed-test-user] Ready: ${TEST_EMAIL}`);
  await pool.end();
}

main().catch((err) => {
  console.error('[seed-test-user] failed:', err);
  process.exit(1);
});
