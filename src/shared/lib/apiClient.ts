import type { ObservationRecord, SiteRecord, GeometryRecord, ReviewEvent } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  code: string;
  requestId?: string;

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

async function parseErrorResponse(res: Response): Promise<never> {
  let body: { error?: string; message?: string; requestId?: string } = {};
  try {
    body = await res.json();
  } catch {
    // response body wasn't JSON — fall through with a generic message
  }
  throw new ApiError(
    res.status,
    body.error || 'unknown_error',
    body.message || `Request failed with status ${res.status}`,
    body.requestId
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...init, credentials: 'include' });
  } catch (err) {
    // Network-level failure (API unreachable, DNS, offline, etc). Fail
    // explicitly rather than silently falling back to stale/fake data.
    throw new ApiError(0, 'network_unreachable', 'Could not reach the Heritage Pulse server. Check your connection and try again.');
  }
  if (!res.ok) {
    await parseErrorResponse(res);
  }
  return res.json() as Promise<T>;
}

export interface CaseFilters {
  category?: string;
  status?: string;
  classification?: string;
  q?: string;
}

export interface Sentinel2SceneSummary {
  id: string;
  collection: string;
  datetime: string | null;
  cloudCover: number | null;
  bbox: number[] | null;
  assets: Record<string, { href: string; title?: string; mediaType?: string; roles?: string[] }>;
  source: { provider: string; catalogUrl: string; fetchedAt: string };
}

export const apiClient = {
  async getSite(slug: string): Promise<{ site: SiteRecord; geometries: Record<string, GeometryRecord> }> {
    return request(`/sites/${encodeURIComponent(slug)}`);
  },

  async listCases(filters: CaseFilters = {}): Promise<ObservationRecord[]> {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    if (filters.classification) params.set('classification', filters.classification);
    if (filters.q) params.set('q', filters.q);
    const qs = params.toString();
    const data = await request<{ cases: ObservationRecord[] }>(`/observations${qs ? `?${qs}` : ''}`);
    return data.cases;
  },

  async getCaseById(caseId: string): Promise<ObservationRecord | null> {
    try {
      const data = await request<{ case: ObservationRecord }>(`/observations/${encodeURIComponent(caseId)}`);
      return data.case;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async createCase(params: {
    siteId: string;
    category: string;
    factualDescription: string;
    latitude: number;
    longitude: number;
    gpsAccuracyMeters: number;
    reporterType?: string;
    isDemoScenario?: boolean;
    photoFile?: File | null;
  }): Promise<ObservationRecord> {
    const form = new FormData();
    form.set('siteId', params.siteId);
    form.set('category', params.category);
    form.set('factualDescription', params.factualDescription);
    form.set('latitude', String(params.latitude));
    form.set('longitude', String(params.longitude));
    form.set('gpsAccuracyMeters', String(params.gpsAccuracyMeters));
    if (params.reporterType) form.set('reporterType', params.reporterType);
    if (params.isDemoScenario) form.set('isDemoScenario', 'true');
    if (params.photoFile) form.set('photo', params.photoFile);

    const data = await request<{ case: ObservationRecord }>(`/observations`, { method: 'POST', body: form });
    return data.case;
  },

  async recordReview(params: {
    caseId: string;
    action: string;
    notes?: string;
    actionTitle?: string;
    eventType?: string;
  }): Promise<{ case: ObservationRecord; newEvent: ReviewEvent }> {
    return request(`/observations/${encodeURIComponent(params.caseId)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: params.action,
        notes: params.notes || '',
        actionTitle: params.actionTitle,
        eventType: params.eventType,
      }),
    });
  },

  async findNearby(lng: number, lat: number, radiusMeters = 300) {
    return request<{ results: { caseId: string; category: string; currentStatus: string; distanceMeters: number }[] }>(
      `/observations/nearby?lng=${lng}&lat=${lat}&radiusMeters=${radiusMeters}`
    );
  },

  async searchSentinel2Scenes(params: {
    bbox: [number, number, number, number];
    datetime?: string;
    maxCloudCover?: number;
    limit?: number;
  }): Promise<Sentinel2SceneSummary[]> {
    const query = new URLSearchParams({ bbox: params.bbox.join(',') });
    if (params.datetime) query.set('datetime', params.datetime);
    if (params.maxCloudCover !== undefined) query.set('maxCloudCover', String(params.maxCloudCover));
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    const data = await request<{ scenes: Sentinel2SceneSummary[] }>(`/earth-observation/sentinel-2/search?${query.toString()}`);
    return data.scenes;
  },

  async resetDemoData(): Promise<void> {
    await request(`/dev/reset-demo`, { method: 'POST' });
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const data = await request<{ user: AuthUser }>(`/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return data.user;
  },

  async logout(): Promise<void> {
    await request(`/auth/logout`, { method: 'POST' });
  },

  async me(): Promise<AuthUser | null> {
    const data = await request<{ user: AuthUser | null }>(`/auth/me`);
    return data.user;
  },
};

export interface AuthUser {
  userId: string;
  email: string;
  displayName: string;
  role: 'REVIEWER' | 'ADMIN';
}
