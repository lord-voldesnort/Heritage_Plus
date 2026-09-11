export interface StacSearchInput {
  bbox: [number, number, number, number];
  datetime?: string;
  maxCloudCover?: number;
  limit?: number;
}

export interface StacAssetSummary {
  href: string;
  title?: string;
  mediaType?: string;
  roles?: string[];
}

export interface Sentinel2Scene {
  id: string;
  collection: string;
  datetime: string | null;
  cloudCover: number | null;
  bbox: number[] | null;
  assets: Record<string, StacAssetSummary>;
  source: {
    provider: string;
    catalogUrl: string;
    fetchedAt: string;
  };
}

interface StacFeature {
  id?: string;
  collection?: string;
  properties?: Record<string, unknown>;
  bbox?: number[];
  assets?: Record<string, { href?: string; title?: string; type?: string; roles?: string[] }>;
}

const DEFAULT_CATALOG = 'https://earth-search.aws.element84.com/v1';
const DEFAULT_TIMEOUT_MS = 15_000;

function numeric(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeScene(feature: StacFeature, catalogUrl: string, fetchedAt: string): Sentinel2Scene {
  const properties = feature.properties || {};
  const rawAssets = feature.assets || {};
  const assets: Record<string, StacAssetSummary> = {};
  for (const [key, asset] of Object.entries(rawAssets)) {
    if (!asset.href) continue;
    assets[key] = {
      href: asset.href,
      ...(asset.title ? { title: asset.title } : {}),
      ...(asset.type ? { mediaType: asset.type } : {}),
      ...(asset.roles ? { roles: asset.roles } : {}),
    };
  }
  const cloudCover = numeric(properties['eo:cloud_cover'] ?? properties['cloud_cover']);
  const datetime = typeof properties.datetime === 'string' ? properties.datetime : null;
  return {
    id: String(feature.id || ''),
    collection: String(feature.collection || 'sentinel-2-l2a'),
    datetime,
    cloudCover,
    bbox: Array.isArray(feature.bbox) ? feature.bbox : null,
    assets,
    source: { provider: 'Element84 Earth Search', catalogUrl, fetchedAt },
  };
}

export async function searchSentinel2Scenes(
  input: StacSearchInput,
  options: { catalogUrl?: string; fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<Sentinel2Scene[]> {
  const catalogUrl = (options.catalogUrl || process.env.STAC_CATALOG_URL || DEFAULT_CATALOG).replace(/\/$/, '');
  const fetchImpl = options.fetchImpl || fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetchImpl(`${catalogUrl}/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/geo+json, application/json' },
      body: JSON.stringify({
        collections: ['sentinel-2-l2a'],
        bbox: input.bbox,
        ...(input.datetime ? { datetime: input.datetime } : {}),
        ...(input.maxCloudCover !== undefined ? { 'filter-lang': 'cql2-json', filter: { op: '<=', args: [{ property: 'eo:cloud_cover' }, input.maxCloudCover] } } : {}),
        limit: input.limit ?? 25,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`STAC provider returned HTTP ${response.status}`);
    }
    const body = (await response.json()) as { features?: StacFeature[] };
    if (!Array.isArray(body.features)) throw new Error('STAC provider returned an invalid FeatureCollection');
    const fetchedAt = new Date().toISOString();
    return body.features.map((feature) => normalizeScene(feature, catalogUrl, fetchedAt));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('STAC provider request timed out');
    throw new Error(`Sentinel-2 discovery unavailable: ${error instanceof Error ? error.message : 'unknown provider error'}`);
  } finally {
    clearTimeout(timeout);
  }
}
