import { pool } from './pool.js';

async function reset() {
  await pool.query('drop schema public cascade');
  await pool.query('create schema public');
  console.log('[reset] skema public dibuat ulang');
  await pool.end();
}

reset().catch(async (error) => {
  console.error('[reset] gagal:', error.message);
  await pool.end();
  process.exit(1);
});
