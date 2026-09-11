import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  role: 'REVIEWER' | 'ADMIN';
}

/**
 * Attempt to authenticate by email/password, enforcing account lockout after
 * repeated failures (brute-force protection). Returns the user on success,
 * or a reason string on failure — never throws for bad credentials.
 */
export async function attemptLogin(
  email: string,
  password: string
): Promise<{ ok: true; user: AuthUser } | { ok: false; reason: 'invalid_credentials' | 'account_locked' | 'account_inactive' }> {
  const result = await pool.query<{
    user_id: string;
    email: string;
    password_hash: string;
    display_name: string;
    role: 'REVIEWER' | 'ADMIN';
    is_active: boolean;
    failed_login_attempts: number;
    locked_until: string | null;
  }>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);

  if (result.rowCount === 0) {
    // Still hash a dummy value so response timing doesn't reveal whether the
    // email exists (basic timing-attack mitigation).
    await bcrypt.compare(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva');
    return { ok: false, reason: 'invalid_credentials' };
  }

  const row = result.rows[0];

  if (!row.is_active) return { ok: false, reason: 'account_inactive' };

  if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) {
    return { ok: false, reason: 'account_locked' };
  }

  const valid = await verifyPassword(password, row.password_hash);

  if (!valid) {
    const attempts = row.failed_login_attempts + 1;
    const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
    await pool.query(
      `UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE user_id = $3`,
      [shouldLock ? 0 : attempts, shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString() : null, row.user_id]
    );
    return { ok: false, reason: shouldLock ? 'account_locked' : 'invalid_credentials' };
  }

  await pool.query(
    `UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = now() WHERE user_id = $1`,
    [row.user_id]
  );

  return {
    ok: true,
    user: { userId: row.user_id, email: row.email, displayName: row.display_name, role: row.role },
  };
}
