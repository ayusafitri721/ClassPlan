import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

// bigint (int8) dikembalikan sebagai number karena seluruh ID di aplikasi ini kecil.
pg.types.setTypeParser(20, (value) => (value === null ? null : Number(value)));

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.pgSslMode === 'require' ? { rejectUnauthorized: false } : false,
  max: 10,
});

pool.on('error', (error) => {
  console.error('[db] koneksi idle bermasalah:', error.message);
});

export function query(text, params) {
  return pool.query(text, params);
}

export async function withTransaction(handler) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await handler(client);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}
