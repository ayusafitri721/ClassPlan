import { env } from './env.js';

export const SESSION_COOKIE = 'cp_session';

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
};

export const clearCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
  path: '/',
};
