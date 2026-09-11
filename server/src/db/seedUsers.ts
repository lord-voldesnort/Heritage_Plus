import { randomBytes } from 'node:crypto';
import { pool } from './pool.js';
import { hashPassword } from '../lib/auth.js';

function generatePassword(): string {
  return randomBytes(9).toString('base64url'); // 12-char URL-safe random password
}

async function upsertUser(email: string, displayName: string, role: 'REVIEWER' | 'ADMIN', password: string) {
  const passwordHash = await hashPassword(password);
  await pool.query(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [email, passwordHash, displayName, role]
  );
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@heritagepulse.local';
  const reviewerEmail = process.env.SEED_REVIEWER_EMAIL || 'curator@heritagepulse.local';

  const existing = await pool.query('SELECT email FROM users WHERE email = ANY($1)', [[adminEmail, reviewerEmail]]);
  const alreadySeeded = new Set(existing.rows.map((r) => r.email));

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || generatePassword();
  const reviewerPassword = process.env.SEED_REVIEWER_PASSWORD || generatePassword();

  if (!alreadySeeded.has(adminEmail)) {
    await upsertUser(adminEmail, 'Heritage Pulse Administrator', 'ADMIN', adminPassword);
  }
  if (!alreadySeeded.has(reviewerEmail)) {
    await upsertUser(reviewerEmail, 'Conservation Curator', 'REVIEWER', reviewerPassword);
  }

  console.log('[seed-users] Done. Credentials for accounts created just now (existing accounts are left unchanged):');
  if (!alreadySeeded.has(adminEmail)) {
    console.log(`  ADMIN    email=${adminEmail}  password=${adminPassword}`);
  }
  if (!alreadySeeded.has(reviewerEmail)) {
    console.log(`  REVIEWER email=${reviewerEmail}  password=${reviewerPassword}`);
  }
  console.log('[seed-users] Store these securely — this is the only time the plaintext password is shown. Change on first login in a real deployment.');

  await pool.end();
}

main().catch((err) => {
  console.error('[seed-users] failed:', err);
  process.exit(1);
});
