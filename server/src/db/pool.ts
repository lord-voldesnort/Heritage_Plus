import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fail loudly at startup rather than silently falling back to an in-memory
  // or mock store. Per the zero-fake-data policy, the app must not pretend to
  // have a working database when it doesn't.
  throw new Error(
    'DATABASE_URL is not set. Copy server/.env.example to server/.env and configure it.'
  );
}

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  // Unexpected errors on idle clients — log and keep the process alive so
  // /health can report the DB as down rather than crashing the whole API.
  // eslint-disable-next-line no-console
  console.error('[db] unexpected idle client error', err);
});

export async function checkDbHealth(): Promise<{ ok: boolean; error?: string }> {
  try {
    await pool.query('SELECT 1');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown error' };
  }
}
