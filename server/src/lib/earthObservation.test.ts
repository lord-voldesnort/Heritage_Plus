import { describe, expect, it } from 'vitest';
import { searchSentinel2Scenes } from './stac.js';
import { summarizeTemporalSeries } from './temporal.js';

describe('Sentinel-2 STAC discovery', () => {
  it('normalizes provider scenes and preserves asset provenance', async () => {
    const scenes = await searchSentinel2Scenes(
      { bbox: [73.85, 19.18, 73.87, 19.21], limit: 1 },
      {
        catalogUrl: 'https://catalog.example.test/v1',
        fetchImpl: async () => new Response(JSON.stringify({
          features: [{
            id: 'scene-1',
            collection: 'sentinel-2-l2a',
            bbox: [73.85, 19.18, 73.87, 19.21],
            properties: { datetime: '2026-01-02T03:04:05Z', 'eo:cloud_cover': 4.5 },
            assets: { red: { href: 'https://assets.example.test/B04.tif', type: 'image/tiff', roles: ['data'] } },
          }],
        })),
      },
    );
    expect(scenes[0]).toMatchObject({ id: 'scene-1', cloudCover: 4.5, collection: 'sentinel-2-l2a' });
    expect(scenes[0].assets.red.href).toContain('B04.tif');
    expect(scenes[0].source.catalogUrl).toBe('https://catalog.example.test/v1');
  });

  it('fails explicitly when the provider is unavailable', async () => {
    await expect(searchSentinel2Scenes({ bbox: [0, 0, 1, 1] }, { fetchImpl: async () => new Response('down', { status: 503 }) })).rejects.toThrow('STAC provider returned HTTP 503');
  });
});

describe('temporal summaries', () => {
  it('reports a robust difference and calibrated limitation reasons', () => {
    const result = summarizeTemporalSeries([
      { timestamp: '2026-01-01', value: 0.5, cloudFraction: 0.01 },
      { timestamp: '2026-02-01', value: 0.52, cloudFraction: 0.02 },
      { timestamp: '2026-03-01', value: 0.51, cloudFraction: 0.01 },
      { timestamp: '2026-04-01', value: 0.2, cloudFraction: 0.03 },
    ]);
    expect(result.latestDifference).toBeCloseTo(-0.31, 5);
    expect(result.latestRobustZ).not.toBeNull();
    expect(result.uncertainty).toBe('KNOWN_LIMITED');
  });

  it('does not invent an anomaly score when dispersion is unavailable', () => {
    const result = summarizeTemporalSeries([
      { timestamp: '2026-01-01', value: 0.5, cloudFraction: 0.01 },
      { timestamp: '2026-02-01', value: null, cloudFraction: null },
    ]);
    expect(result.latestRobustZ).toBeNull();
    expect(result.uncertainty).toBe('UNKNOWN_NOT_CALIBRATED');
    expect(result.uncertaintyReasons.length).toBeGreaterThan(0);
  });
});
