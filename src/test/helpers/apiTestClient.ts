/**
 * A minimal HTTP client for INTEGRATION tests only — talks directly to a
 * live instance of the real API (default http://localhost:3000/api), not
 * through the frontend's apiClient.ts (which resolves relative URLs against
 * a browser origin that doesn't exist in a Node test process).
 *
 * Node's native fetch does not maintain a cookie jar across separate calls
 * the way a browser does, so this client captures Set-Cookie manually and
 * replays it — this is what lets login() -> recordReview() behave like a
 * real authenticated browser session.
 */

const BASE = process.env.INTEGRATION_API_URL || 'http://localhost:3000/api';

export class IntegrationApiClient {
  private cookie: string | null = null;

  async isReachable(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE.replace(/\/api$/, '')}/ready`);
      if (!res.ok) return false;
      const body = await res.json();
      return body.status === 'ready';
    } catch {
      return false;
    }
  }

  private async request(path: string, init: RequestInit = {}): Promise<{ status: number; body: any }> {
    const headers = new Headers(init.headers);
    if (this.cookie) headers.set('Cookie', this.cookie);

    const res = await fetch(`${BASE}${path}`, { ...init, headers });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      // Keep only the cookie pair itself (strip attributes like Path/HttpOnly).
      this.cookie = setCookie.split(';')[0];
    }

    let body: any = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    return { status: res.status, body };
  }

  async login(email: string, password: string) {
    const { status, body } = await this.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return { status, body };
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async me() {
    return this.request('/auth/me');
  }

  async createCase(fields: Record<string, string>, photo?: { buffer: Buffer; filename: string; mimeType: string }) {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.set(k, v);
    if (photo) {
      form.set('photo', new Blob([Uint8Array.from(photo.buffer)], { type: photo.mimeType }), photo.filename);
    }
    return this.request('/observations', { method: 'POST', body: form });
  }

  async getCase(caseId: string) {
    return this.request(`/observations/${encodeURIComponent(caseId)}`);
  }

  async listCases(query = '') {
    return this.request(`/observations${query}`);
  }

  async review(caseId: string, action: string, notes: string, extra: Record<string, string> = {}) {
    return this.request(`/observations/${encodeURIComponent(caseId)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes, ...extra }),
    });
  }

  async nearby(lng: number, lat: number, radiusMeters = 300) {
    return this.request(`/observations/nearby?lng=${lng}&lat=${lat}&radiusMeters=${radiusMeters}`);
  }

  async fetchFile(fileUrl: string): Promise<{ status: number; buffer: Buffer; headers: Headers }> {
    const origin = BASE.replace(/\/api$/, '');
    const res = await fetch(`${origin}${fileUrl}`);
    const arrayBuffer = await res.arrayBuffer();
    return { status: res.status, buffer: Buffer.from(arrayBuffer), headers: res.headers };
  }
}
