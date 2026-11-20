import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(here, '../migrations');

async function run() {
  await pool.query(`
    create table if not exists schema_migrations (
      version    text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const { rows } = await pool.query('select version from schema_migrations');
  const applied = new Set(rows.map((row) => row.version));

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] sudah diterapkan: ${file}`);
      continue;
    }

    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query('insert into schema_migrations (version) values ($1)', [file]);
      await client.query('commit');
      console.log(`[migrate] diterapkan: ${file}`);
    } catch (error) {
      await client.query('rollback');
      console.error(`[migrate] gagal: ${file}`);
      throw error;
    } finally {
      client.release();
    }
  }
}

run()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error(error.message);
    await pool.end();
    process.exit(1);
  });
