// Simple SQL migrations runner
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function ensureMigrationsTable() {
  await db.query(`CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );`);
}

async function getApplied() {
  const res = await db.query('SELECT filename FROM migrations');
  return new Set(res.rows.map(r => r.filename));
}

async function applyMigration(filePath, filename) {
  const sql = fs.readFileSync(filePath, { encoding: 'utf8' });
  console.log('Applying', filename);
  await db.query(sql);
  await db.query('INSERT INTO migrations(filename) VALUES($1)', [filename]);
  console.log('Applied', filename);
}

async function run() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found, skipping');
      process.exit(0);
    }
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    await ensureMigrationsTable();
    const applied = await getApplied();
    for (const f of files) {
      if (!applied.has(f)) {
        await applyMigration(path.join(migrationsDir, f), f);
      } else {
        console.log('Skipping', f);
      }
    }
    console.log('Migrations complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
