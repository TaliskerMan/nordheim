import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import https from 'https';
import http from 'http';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

app.use(cors());
app.use(express.json());

// Serve Static Files (File Uploads)
const uploadDir = path.join(__dirname, '../data/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/storage/imports', express.static(uploadDir));

// Multer Setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage: storage });

// API: Contacts
app.get('/api/contacts', (req, res) => {
    db.all("SELECT * FROM contacts ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, error: null });
    });
});

app.post('/api/contacts', (req, res) => {
    const { firstName, lastName, title, function: func, companyName, workEmail, personalEmail, phoneNumber, products, escalationContact } = req.body;
    const sql = `INSERT INTO contacts (firstName, lastName, title, function, companyName, workEmail, personalEmail, phoneNumber, products, escalationContact) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [firstName, lastName, title, func, companyName, workEmail, personalEmail, phoneNumber, products, escalationContact || 'N'];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get("SELECT * FROM contacts WHERE id = ?", [this.lastID], (err, row) => {
            res.json({ data: row, error: null });
        });
    });
});

app.put('/api/contacts/:id', (req, res) => {
    const { firstName, lastName, title, function: func, companyName, workEmail, personalEmail, phoneNumber, products, escalationContact } = req.body;
    const sql = `UPDATE contacts SET firstName = COALESCE(?, firstName), lastName = COALESCE(?, lastName), 
                 title = COALESCE(?, title), function = COALESCE(?, function), companyName = COALESCE(?, companyName),
                 workEmail = COALESCE(?, workEmail), personalEmail = COALESCE(?, personalEmail), 
                 phoneNumber = COALESCE(?, phoneNumber), products = COALESCE(?, products),
                 escalationContact = COALESCE(?, escalationContact), updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;
    const params = [firstName, lastName, title, func, companyName, workEmail, personalEmail, phoneNumber, products, escalationContact, req.params.id];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Contact not found" });

        db.get("SELECT * FROM contacts WHERE id = ?", [req.params.id], (err, row) => {
            res.json({ data: row, error: null });
        });
    });
});

app.delete('/api/contacts/:id', (req, res) => {
    db.run("DELETE FROM contacts WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ error: null });
    });
});

// API: Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const publicUrl = `/storage/imports/${req.file.filename}`;
    res.json({ data: { publicUrl }, error: null });
});

// API: Auth (Simplified)
app.get('/api/auth/me', (req, res) => {
    // For this local version, we'll simulate a logged-in user if the client sends a dummy token,
    // or properly check a real session. For simplicity/demo:
    // If 'Authorization' header is present, return the admin user.
    const token = req.headers.authorization;
    if (token) {
        db.get("SELECT id, email, name FROM users WHERE id = 1", [], (err, row) => {
            res.json(row);
        });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ error: "Invalid credentials" });

        // Return a dummy token
        res.json({
            user: { id: row.id, email: row.email, name: row.name },
            access_token: "local-dummy-token-123",
            error: null
        });
    });
});

// Serve Frontend (Production)
// In development, Vite runs mostly on its own port, but in production Docker this server serves the static files.
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
    });
}

const sslEnabled = process.env.SSL_ENABLED === 'true';
const sslOptions = {};

if (sslEnabled) {
    try {
        const certPath = process.env.SSL_CERT_PATH || './certs/cert.pem';
        const keyPath = process.env.SSL_KEY_PATH || './certs/key.pem';

        if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
            sslOptions.key = fs.readFileSync(keyPath);
            sslOptions.cert = fs.readFileSync(certPath);
        } else {
            console.warn("SSL enabled but cert files not found. Falling back to HTTP.");
            // process.env.SSL_ENABLED = 'false'; // Keep as is to show error? or fallback?
            // Fallback implies we change behavior. Let's just create HTTP server if certs missing.
        }
    } catch (e) {
        console.error("Error loading SSL certs:", e);
    }
}

if (sslEnabled && sslOptions.key && sslOptions.cert) {
    https.createServer(sslOptions, app).listen(PORT, () => {
        console.log(`Secure Server running on port ${PORT} (SLL)`);
    });
} else {
    http.createServer(app).listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
// app.listen Replaced by http/https.createServer
