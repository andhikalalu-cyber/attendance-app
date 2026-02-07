const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Check if Supabase is configured
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let db = null;
let useSupabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY;

if (useSupabase) {
  const { createClient } = require('@supabase/supabase-js');
  exports.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
} else {
  // Initialize SQLite database (cross-platform tmp directory)
  const os = require('os');
  const tmpDir = os.tmpdir();
  const dataDir = path.join(tmpDir, 'attendance-app');
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    console.warn('Could not create data dir, falling back to project folder', e.message);
  }
  const dbPath = path.join(dataDir, 'attendance.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('DB open error:', err);
  });
  
  // Ensure table exists
  db.run(
    `CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )`,
    (err) => {
      if (err) console.error('Table create error:', err);
    }
  );
}

exports.getDB = () => db;
exports.useSupabase = () => useSupabase;
exports.getSupabase = () => useSupabase ? exports.supabase : null;

// Promisified SQLite helpers
exports.dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

exports.dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

exports.dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};
