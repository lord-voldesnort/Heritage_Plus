import { describe, expect, it, vi } from 'vitest';
import { requireAuth, requireRole } from './rbac.js';

function responseMock() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
}

describe('RBAC middleware', () => {
  it('rejects anonymous requests with 401', () => {
    const req = { session: {}, id: 'req-anon' } as any;
    const res = responseMock();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'unauthenticated', requestId: 'req-anon' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('allows an authenticated reviewer through requireAuth', () => {
    const req = { session: { user: { userId: 'u1', email: 'reviewer@example.test', displayName: 'Reviewer', role: 'REVIEWER' } } } as any;
    const res = responseMock();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects an authenticated reviewer when an admin role is required', () => {
    const req = { session: { user: { userId: 'u1', email: 'reviewer@example.test', displayName: 'Reviewer', role: 'REVIEWER' } }, id: 'req-reviewer' } as any;
    const res = responseMock();
    const next = vi.fn();

    requireRole('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'forbidden', requestId: 'req-reviewer' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('allows an authenticated admin through an admin-only role check', () => {
    const req = { session: { user: { userId: 'u2', email: 'admin@example.test', displayName: 'Admin', role: 'ADMIN' } } } as any;
    const res = responseMock();
    const next = vi.fn();

    requireRole('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
