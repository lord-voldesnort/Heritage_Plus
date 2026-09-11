import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { rateLimit } from 'express-rate-limit';
import { checkDbHealth, pool } from './db/pool.js';
import { requestIdMiddleware } from './lib/requestId.js';
import { errorHandler, notFoundHandler } from './lib/errorHandler.js';
import { logger } from './lib/logger.js';
import { sitesRouter } from './routes/sites.js';
import { observationsRouter } from './routes/observations.js';
import { evidenceRouter } from './routes/evidence.js';
import { devRouter } from './routes/dev.js';
import { authRouter } from './routes/auth.js';
import { earthObservationRouter } from './routes/earthObservation.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());

let SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  if (NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production. Generate one with: openssl rand -base64 48');
  }
  // Dev-only fallback so `npm run dev` works out of the box; sessions won't
  // survive a server restart, which is fine for local development.
  SESSION_SECRET = 'dev-only-insecure-secret-do-not-use-in-production';
  logger.warn('SESSION_SECRET not set — using an insecure dev-only default. Set it in .env for anything beyond local dev.');
}

app.disable('x-powered-by');
app.use(requestIdMiddleware);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    strictTransportSecurity: NODE_ENV === 'production' ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
    crossOriginResourcePolicy: { policy: 'same-site' },
  })
);
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(self), microphone=()');
  next();
});
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => (req as express.Request).id,
    customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Sessions are stored in Postgres (not memory), so they survive server
// restarts and can be genuinely invalidated by deleting the row — not just
// by an in-memory flag that resets on deploy.
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({ pool, tableName: 'user_sessions', createTableIfMissing: true }),
    name: 'heritage.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    },
  })
);

// Global API rate limit — generous for a ~5-user deployment, but present.
app.use(
  '/api/',
  rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'rate_limited', message: 'Too many requests. Please slow down.' },
  })
);
// Tighter limit on writes specifically.
const writeLimiter = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false });
app.use('/api/observations', (req, res, next) => (req.method === 'POST' ? writeLimiter(req, res, next) : next()));

// Strict brute-force protection on login, independent of the global limiter.
const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited', message: 'Too many login attempts. Try again in 15 minutes.' },
});
app.use('/api/auth/login', loginLimiter);

// --------------------------------------------------------------------------
// Health / readiness. /ready must NOT report ready if the database is down —
// a health check that lies about dependency status is worse than no check.
// --------------------------------------------------------------------------
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'heritage-pulse-api' }));

app.get('/ready', async (_req, res) => {
  const db = await checkDbHealth();
  const ready = db.ok;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', dependencies: { postgres: db } });
});

app.get('/metrics', async (_req, res) => {
  try {
    const poolStats = { total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount };
    const counts = await pool.query(
      `SELECT current_status, COUNT(*)::int AS count FROM observation_records GROUP BY current_status`
    );
    res.json({ dbPool: poolStats, casesByStatus: Object.fromEntries(counts.rows.map((r) => [r.current_status, r.count])) });
  } catch (err) {
    res.status(503).json({ error: 'metrics_unavailable', message: err instanceof Error ? err.message : 'unknown' });
  }
});

app.use('/api/sites', sitesRouter);
app.use('/api/observations', observationsRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/earth-observation', earthObservationRouter);
app.use('/api/dev', devRouter);
app.use('/api/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT, corsOrigin: CORS_ORIGIN, env: process.env.NODE_ENV || 'development' }, 'heritage-pulse-api listening');
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing DB pool');
  await pool.end();
  process.exit(0);
});
