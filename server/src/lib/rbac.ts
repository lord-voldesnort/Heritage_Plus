import type { NextFunction, Request, Response } from 'express';
import type { AuthUser } from './auth.js';
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: AuthUser;
  }
}

/** Require any authenticated user (REVIEWER or ADMIN). */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Sign in to perform this action.', requestId: req.id });
  }
  next();
}

/** Require one of the given roles. Call after requireAuth. */
export function requireRole(...roles: Array<'REVIEWER' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ error: 'unauthenticated', message: 'Sign in to perform this action.', requestId: req.id });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'forbidden', message: `This action requires one of: ${roles.join(', ')}.`, requestId: req.id });
    }
    next();
  };
}
