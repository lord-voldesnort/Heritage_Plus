import type { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { logger } from './logger.js';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'not_found', message: `No route: ${req.method} ${req.path}`, requestId: req.id });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.id;

  if (err instanceof MulterError) {
    logger.warn({ requestId, err }, 'upload rejected');
    return res.status(413).json({ error: 'upload_error', message: err.message, requestId });
  }

  const message = err instanceof Error ? err.message : 'Unknown error';
  logger.error({ requestId, err, path: req.path, method: req.method }, 'unhandled request error');

  // Never fabricate a success response on failure. Return a structured,
  // user-safe error with a request ID for support/log correlation, and log
  // the full detail server-side.
  res.status(500).json({
    error: 'internal_error',
    message: 'An unexpected error occurred. If this persists, report it with the request ID below.',
    requestId,
  });
}
