import 'dotenv/config';
import { pool } from './db/pool.js';
import { runtimeConfig } from './lib/config.js';

const intervalMs = Math.max(5_000, Number(process.env.WORKER_POLL_INTERVAL_MS || 15_000));
let stopping = false;

if (!runtimeConfig.workerEnabled) {
  throw new Error('Worker process started while WORKER_ENABLED is not true. Refusing to run.');
}

async function claimAndProcessOne(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const claimed = await client.query<{ job_id: string; job_type: string }>(
      `SELECT job_id, job_type FROM processing_jobs
       WHERE status = 'QUEUED'
       ORDER BY created_at ASC
       FOR UPDATE SKIP LOCKED LIMIT 1`
    );
    if (claimed.rowCount === 0) {
      await client.query('ROLLBACK');
      return;
    }
    const job = claimed.rows[0];
    await client.query(
      `UPDATE processing_jobs SET status = 'RUNNING', started_at = now(), updated_at = now(), progress_percent = 1 WHERE job_id = $1`,
      [job.job_id]
    );
    await client.query('COMMIT');

    // Explicitly fail jobs whose scientific handler is not deployed. This is
    // safer than returning simulated EO outputs or a fabricated success state.
    const reason = runtimeConfig.eoProcessingEnabled
      ? `No handler is registered for job type ${job.job_type}; deploy the corresponding validated processor before retrying.`
      : 'EO processing is disabled by configuration; set EO_PROCESSING_ENABLED=true only on a worker with validated raster tooling.';
    await pool.query(
      `UPDATE processing_jobs SET status = 'FAILED', failure_reason = $2, finished_at = now(), updated_at = now() WHERE job_id = $1`,
      [job.job_id, reason]
    );
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error(JSON.stringify({ event: 'worker_error', error: error instanceof Error ? error.message : String(error) }));
  } finally {
    client.release();
  }
}

async function loop(): Promise<void> {
  if (stopping) return;
  await claimAndProcessOne();
  setTimeout(() => void loop(), intervalMs);
}

process.once('SIGTERM', () => { stopping = true; void pool.end(); });
process.once('SIGINT', () => { stopping = true; void pool.end(); });

console.log(JSON.stringify({ event: 'worker_started', concurrency: runtimeConfig.workerConcurrency, pollIntervalMs: intervalMs }));
void loop();
