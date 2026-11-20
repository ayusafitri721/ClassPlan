import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginSchema } from '@classplan/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  clearCookieOptions,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '../../config/auth.js';
import { getCurrentUser, login } from './auth.service.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_ATTEMPTS',
      message: 'Terlalu banyak percobaan masuk. Coba lagi beberapa menit lagi.',
    },
  },
});

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { token, user } = await login(req.body.email, req.body.password);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
    res.json({ user });
  })
);

router.post('/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, clearCookieOptions);
  res.status(204).end();
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.user.id);
    res.json({ user });
  })
);

export default router;
