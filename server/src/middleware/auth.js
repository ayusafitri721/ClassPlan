import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { SESSION_COOKIE } from '../config/auth.js';
import { forbidden, unauthorized } from '../utils/errors.js';

export function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    next(unauthorized('Silakan masuk terlebih dahulu'));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: Number(payload.sub),
      name: payload.name,
      role: payload.role,
    };
    next();
  } catch {
    next(unauthorized());
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      next(forbidden());
      return;
    }
    next();
  };
}
