/**
 * Evidence object storage.
 *
 * This is a LOCAL DISK implementation, appropriate for the ~5-user free-tier
 * deployment target. It is written behind a narrow interface so it can be
 * swapped for an S3-compatible client later without touching route code —
 * only this file would change.
 *
 * Every hash is computed HERE, server-side, from the actual uploaded bytes.
 * The API never trusts a client-supplied checksum.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { runtimeConfig } from './config.js';

const STORAGE_DIR = process.env.STORAGE_LOCAL_DIR || './uploads';

// Minimal magic-byte sniffing so a renamed .exe with a .jpg extension is
// rejected even if the browser-supplied Content-Type claimed image/jpeg.
const MAGIC_BYTES: { mime: string; check: (buf: Buffer) => boolean }[] = [
  { mime: 'image/jpeg', check: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: 'image/png',
    check: (b) =>
      b.length > 8 &&
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  { mime: 'image/webp', check: (b) => b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
  { mime: 'image/tiff', check: (b) => b.length > 4 && ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a) || (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00)) },
];

export class UnsupportedFileTypeError extends Error {
  constructor() {
    super('File content does not match a supported image type (JPEG, PNG, WebP, TIFF).');
    this.name = 'UnsupportedFileTypeError';
  }
}

export interface StoredEvidence {
  fileUrl: string; // path clients should request evidence through, e.g. /api/evidence/files/<key>
  fileMimeType: string;
  fileSizeBytes: number;
  sha256Checksum: string;
}

/**
 * Persist an uploaded evidence file. Validates magic bytes against the
 * declared MIME type, computes the SHA-256 of the actual bytes on disk, and
 * returns metadata to be stored alongside the observation record.
 */
export async function storeEvidenceFile(buffer: Buffer, originalName: string, declaredMimeType: string): Promise<StoredEvidence> {
  const sniffed = MAGIC_BYTES.find((m) => m.check(buffer));
  if (!sniffed) {
    throw new UnsupportedFileTypeError();
  }

  const sha256 = createHash('sha256').update(buffer).digest('hex');
  const key = `${randomUUID()}${extname(originalName) || guessExtension(sniffed.mime)}`;

  if (runtimeConfig.storageProvider === 'supabase') {
    const endpoint = `${runtimeConfig.supabaseUrl}/storage/v1/object/${encodeURIComponent(runtimeConfig.storageBucket!)}/${encodeURIComponent(key)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${runtimeConfig.supabaseKey}`,
        apikey: runtimeConfig.supabaseKey!,
        'Content-Type': sniffed.mime,
        'x-upsert': 'false',
      },
      body: buffer,
    });
    if (!response.ok) throw new Error(`Supabase Storage upload failed with HTTP ${response.status}`);
    return { fileUrl: `/api/evidence/files/${key}`, fileMimeType: sniffed.mime, fileSizeBytes: buffer.byteLength, sha256Checksum: sha256 };
  }

  if (runtimeConfig.storageProvider === 's3') {
    throw new Error('S3 object storage is configured but its deployment adapter is not installed in this environment. Refusing to store evidence locally.');
  }

  await mkdir(STORAGE_DIR, { recursive: true });
  await writeFile(join(STORAGE_DIR, key), buffer);

  return {
    fileUrl: `/api/evidence/files/${key}`,
    fileMimeType: sniffed.mime,
    fileSizeBytes: buffer.byteLength,
    sha256Checksum: sha256,
  };
}

export function resolveStoredFilePath(key: string): string {
  // key comes from our own generated filenames (uuid + extension); still
  // reject path traversal defensively in case a malformed key is ever passed.
  if (key.includes('..') || key.includes('/') || key.includes('\\')) {
    throw new Error('Invalid evidence file key');
  }
  return join(STORAGE_DIR, key);
}

/** Recompute the SHA-256 of bytes on disk, for integrity verification at retrieval time. */
export function hashBuffer(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

export async function readStoredEvidence(key: string): Promise<Buffer> {
  if (runtimeConfig.storageProvider === 'supabase') {
    const endpoint = `${runtimeConfig.supabaseUrl}/storage/v1/object/${encodeURIComponent(runtimeConfig.storageBucket!)}/${encodeURIComponent(key)}`;
    const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${runtimeConfig.supabaseKey}`, apikey: runtimeConfig.supabaseKey! } });
    if (!response.ok) throw new Error(`Supabase Storage download failed with HTTP ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  }
  return readFile(resolveStoredFilePath(key));
}

function guessExtension(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/tiff':
      return '.tiff';
    default:
      return '';
  }
}
