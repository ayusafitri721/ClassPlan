import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../db/pool.js';
import { env } from '../../config/env.js';
import { AppError, unauthorized } from '../../utils/errors.js';

const DUMMY_HASH = bcrypt.hashSync('classplan-placeholder-password', 10);

export async function login(email, password) {
  const { rows } = await query(
    `select id, name, email, password_hash, role
       from users
      where lower(email) = lower($1)`,
    [email]
  );

  const user = rows[0];
  const passwordMatches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email atau kata sandi salah');
  }

  const token = jwt.sign(
    { sub: String(user.id), role: user.role, name: user.name },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function getCurrentUser(id) {
  const { rows } = await query(
    'select id, name, email, role from users where id = $1',
    [id]
  );
  if (!rows[0]) throw unauthorized();
  return rows[0];
}
