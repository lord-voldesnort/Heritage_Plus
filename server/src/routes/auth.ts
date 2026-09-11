import { Router } from 'express';
import { z } from 'zod';
import { attemptLogin } from '../lib/auth.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'validation_failed', message: 'A valid email and password are required.', requestId: req.id });
    }

    const result = await attemptLogin(parsed.data.email, parsed.data.password);

    if (!result.ok) {
      const messages: Record<string, string> = {
        invalid_credentials: 'Incorrect email or password.',
        account_locked: 'Too many failed attempts. This account is temporarily locked — try again in 15 minutes.',
        account_inactive: 'This account has been deactivated. Contact an administrator.',
      };
      return res.status(401).json({ error: result.reason, message: messages[result.reason], requestId: req.id });
    }

    // Regenerate the session on privilege change to prevent session fixation.
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.user = result.user;
      res.json({ user: result.user });
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('heritage.sid');
    res.json({ ok: true });
  });
});

authRouter.get('/me', (req, res) => {
  res.json({ user: req.session.user || null });
});
