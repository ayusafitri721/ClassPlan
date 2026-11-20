import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');

dotenv.config({ path: path.join(root, '.env') });

const isProduction = process.env.NODE_ENV === 'production';

function required(name, fallback) {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) {
    throw new Error(`Variabel lingkungan ${name} wajib diisi di produksi`);
  }
  console.warn(`[env] ${name} belum diisi, memakai nilai pengembangan`);
  return fallback;
}

const jwtSecret = required('JWT_SECRET', 'classplan-development-secret-32-characters');

if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET minimal 32 karakter');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction,
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required(
    'DATABASE_URL',
    'postgres://classplan:classplan@localhost:5432/classplan'
  ),
  pgSslMode: process.env.PGSSLMODE ?? 'disable',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME ?? 'Administrator',
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@classplan.local',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'classplan123',
  },
};
