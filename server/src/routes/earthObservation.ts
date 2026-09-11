import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../lib/rbac.js';
import { searchSentinel2Scenes } from '../lib/stac.js';

export const earthObservationRouter = Router();

const searchSchema = z.object({
  bbox: z.string().transform((value, ctx) => {
    const parts = value.split(',').map(Number);
    if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'bbox must contain four comma-separated numbers' });
      return z.NEVER;
    }
    if (parts[0] < -180 || parts[2] > 180 || parts[1] < -90 || parts[3] > 90 || parts[0] >= parts[2] || parts[1] >= parts[3]) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'bbox coordinates are invalid or not ordered west,south,east,north' });
      return z.NEVER;
    }
    return parts as [number, number, number, number];
  }),
  datetime: z.string().max(100).optional(),
  maxCloudCover: z.coerce.number().min(0).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

earthObservationRouter.get('/sentinel-2/search', requireAuth, requireRole('REVIEWER', 'ADMIN'), async (req, res, next) => {
  const parsed = searchSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation_failed', message: parsed.error.issues.map((issue) => issue.message).join('; '), requestId: req.id });
  }
  try {
    const scenes = await searchSentinel2Scenes(parsed.data);
    res.json({ provider: scenes[0]?.source || { provider: 'Element84 Earth Search', catalogUrl: process.env.STAC_CATALOG_URL || 'https://earth-search.aws.element84.com/v1' }, query: parsed.data, scenes });
  } catch (error) {
    return res.status(503).json({
      error: 'earth_observation_unavailable',
      message: error instanceof Error ? error.message : 'Sentinel-2 discovery failed',
      retryable: true,
      requestId: req.id,
    });
  }
});
