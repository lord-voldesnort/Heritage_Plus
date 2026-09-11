import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../lib/rbac.js';

export const devRouter = Router();

const enabled = process.env.ENABLE_DEMO_SEED_ROUTES === 'true' && process.env.NODE_ENV !== 'production';

// Even in a non-production environment this endpoint permanently deletes
// persisted rows. The environment flag remains a second safety boundary, but
// anonymous callers and ordinary reviewers must not be able to invoke it.
devRouter.post('/reset-demo', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  if (!enabled) {
    return res.status(403).json({
      error: 'disabled',
      message: 'Demo-seed routes are disabled. Set ENABLE_DEMO_SEED_ROUTES=true in a non-production environment to use this.',
      requestId: req.id,
    });
  }
  try {
    // is_demo_scenario cases only — never touches real reported observations.
    const result = await pool.query(`DELETE FROM observation_records WHERE is_demo_scenario = TRUE RETURNING case_id`);
    res.json({ deletedCaseIds: result.rows.map((r) => r.case_id) });
  } catch (err) {
    next(err);
  }
});
