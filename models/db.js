const Database = require("better-sqlite3");
const path = require("path");

// Use Render Disk (/data) if available, otherwise local
const dbPath = process.env.DB_PATH || path.resolve(__dirname, "../potholes.db");
const db = new Database(dbPath);

// Create the potholes table if it doesn’t exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS potholes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT,
    description TEXT,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'Pending',
    photoPath TEXT
  )
`).run();

console.log("✅ Connected to SQLite database at", dbPath);

module.exports = db;
