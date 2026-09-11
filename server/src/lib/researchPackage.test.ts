import { describe, expect, it } from 'vitest';
import { buildResearchPackageManifest } from './researchPackage.js';

describe('research package manifests', () => {
  it('records provenance and deterministic result checksum', () => {
    const input = {
      dataset: { id: 'shivneri-scenes', version: '2026.09.11', description: 'Measured scene metadata', source: 'STAC' },
      experiment: { id: 'exp-1', hypothesis: 'Compare measured values', algorithm: 'robust-difference', parameters: { baselineCount: 3 } },
      provenance: { source: 'Element84 Earth Search', processingVersion: 'stac-discovery-v1', codeVersion: 'test' },
      results: { latestDifference: -0.2 },
      limitations: ['No calibrated physical-damage model is applied.'],
    };
    const one = buildResearchPackageManifest(input, new Date('2026-09-11T00:00:00Z'));
    const two = buildResearchPackageManifest(input, new Date('2026-09-11T00:00:00Z'));
    expect(one).toEqual(two);
    expect(one.resultSha256).toHaveLength(64);
    expect(one.limitations).toHaveLength(1);
  });

  it('rejects a package without explicit limitations', () => {
    expect(() => buildResearchPackageManifest({
      dataset: { id: 'd', version: '1', description: 'd' },
      provenance: { source: 's', processingVersion: 'p' },
      results: {},
      limitations: [],
    })).toThrow('limitation');
  });
});
