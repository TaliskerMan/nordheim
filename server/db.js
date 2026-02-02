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

        // Users Table (Updated for RBAC)
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT, -- Hash this!
      name TEXT,
      role TEXT DEFAULT 'viewer' -- 'admin' or 'viewer'
    )`);

        // Audit Logs Table
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'IMPORT'
            entity_type TEXT, -- 'contact', 'user', 'license'
            entity_id INTEGER,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Licenses Table
        db.run(`CREATE TABLE IF NOT EXISTS licenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT,
            technical_contact TEXT,
            technical_email TEXT,
            business_contact TEXT,
            business_email TEXT,
            generated_key TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER
        )`);

        // Create default user if not exists
        db.get("SELECT * FROM users WHERE email = ?", ["admin@example.com"], (err, row) => {
            if (!row) {
                // Default password 'password' hash will be handled in auth logic or manually set here 
                // For now we will insert plaintext and migrate or hash in index.js login
                // Ideally we hash here directly if we have bcrypt, but db.js doesn't import it yet.
                // We'll set role='admin'
                db.run("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
                    ["admin@example.com", "password", "Admin User", "admin"]);
                console.log("Default admin user created: admin@example.com / password (admin)");
            } else {
                // Ensure existing admin has role
                if (!row.role) {
                    db.run("UPDATE users SET role = 'admin' WHERE id = ?", [row.id]);
                }
            }
        });
    });
}

export default db;
