import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`[api] berjalan di http://localhost:${env.port}`);
});

async function shutdown(signal) {
  console.log(`[api] ${signal} diterima, menutup server`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
