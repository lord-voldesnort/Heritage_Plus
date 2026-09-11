import { createHash } from 'node:crypto';

export interface ResearchPackageInput {
  dataset: { id: string; version: string; description: string; source?: string; license?: string; checksum?: string };
  experiment?: { id: string; hypothesis: string; algorithm: string; parameters: Record<string, unknown>; metrics?: Record<string, unknown> };
  provenance: { source: string; acquisitionTime?: string; processingVersion: string; codeVersion?: string; environment?: Record<string, unknown> };
  results: unknown;
  limitations: string[];
}

export interface ResearchPackageManifest extends ResearchPackageInput {
  packageVersion: '1';
  generatedAt: string;
  resultSha256: string;
}

export function buildResearchPackageManifest(input: ResearchPackageInput, now = new Date()): ResearchPackageManifest {
  if (!input.dataset.id || !input.dataset.version) throw new Error('Dataset identity is required');
  if (!input.provenance.source || !input.provenance.processingVersion) throw new Error('Provenance source and processing version are required');
  if (!Array.isArray(input.limitations) || input.limitations.length === 0) throw new Error('At least one limitation must be recorded');
  const resultSha256 = createHash('sha256').update(JSON.stringify(input.results)).digest('hex');
  return { ...input, packageVersion: '1', generatedAt: now.toISOString(), resultSha256 };
}
