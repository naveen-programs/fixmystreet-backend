const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function initDB() {
  const db = await open({
    filename: "./potholes.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS potholes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT,
      description TEXT,
      latitude REAL,
      longitude REAL,
      status TEXT DEFAULT 'Pending',
      photoPath TEXT
    )
  `);

  return db;
}

module.exports = initDB();
