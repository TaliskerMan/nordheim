import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Contacts Table
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT,
      lastName TEXT,
      title TEXT,
      function TEXT,
      companyName TEXT,
      workEmail TEXT,
      personalEmail TEXT,
      phoneNumber TEXT,
      products TEXT,
      escalationContact TEXT DEFAULT 'N',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

        // Users Table (Simple auth)
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT, -- In a real app, hash this!
      name TEXT
    )`);

        // Create default user if not exists
        db.get("SELECT * FROM users WHERE email = ?", ["admin@example.com"], (err, row) => {
            if (!row) {
                db.run("INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
                    ["admin@example.com", "password", "Admin User"]);
                console.log("Default admin user created: admin@example.com / password");
            }
        });
    });
}

export default db;
