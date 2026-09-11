import { Router } from 'express';
import { pool } from '../db/pool.js';
import { hashBuffer, readStoredEvidence } from '../lib/storage.js';

export const evidenceRouter = Router();

/**
 * Serve a stored evidence file, but only after re-hashing the bytes on disk
 * and confirming they still match the SHA-256 recorded at upload time. If
 * they don't match, something tampered with or corrupted the file and we
 * fail explicitly rather than silently serving untrusted bytes.
 */
evidenceRouter.get('/files/:key', async (req, res, next) => {
  try {
    const key = req.params.key;
    const dbResult = await pool.query<{ file_mime_type: string; sha256_checksum: string }>(
      `SELECT file_mime_type, sha256_checksum FROM evidence_records WHERE file_url = $1`,
      [`/api/evidence/files/${key}`]
    );
    if (dbResult.rowCount === 0) {
      return res.status(404).json({ error: 'not_found', message: 'No evidence record references this file.', requestId: req.id });
    }
    const { file_mime_type, sha256_checksum } = dbResult.rows[0];

    let buffer: Buffer;
    try {
      buffer = await readStoredEvidence(key);
    } catch {
      return res.status(404).json({ error: 'file_missing', message: 'Evidence metadata exists but the file is missing from storage.', requestId: req.id });
    }

    const actualHash = hashBuffer(buffer);
    if (actualHash !== sha256_checksum) {
      // Explicit failure per the zero-fake-data / never-fabricate-success policy —
      // do not serve a file whose integrity cannot be verified.
      return res.status(409).json({
        error: 'integrity_check_failed',
        message: 'Stored file hash does not match the recorded SHA-256 checksum. Refusing to serve.',
        requestId: req.id,
      });
    }

    res.setHeader('Content-Type', file_mime_type);
    res.setHeader('X-Content-SHA256', actualHash);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});
