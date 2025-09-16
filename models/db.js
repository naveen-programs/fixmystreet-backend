const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.resolve(__dirname, "../potholes.db");
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

console.log("✅ Connected to SQLite database");

module.exports = db;
