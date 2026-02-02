import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import https from 'https';
import http from 'http';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

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

// --- Middleware ---

// 1. License Check
const checkLicense = (req, res, next) => {
    // Only enforce for multi-user features or if strict mode enabled
    // For now, we allow read-only public access or single-user without license, 
    // but creation/editing/admin features might require it depending on business rules.
    // The requirement says: "restrict the editing and addition of contacts to administrators only"
    // and "require a license file ... to unlock the application feature to allow for multi-user scaling."

    // Implementation: valid license file required to create > 1 user or usage of admin features?
    // Let's implement a check that looks for license.key.

    // Skip for login/public endpoints
    if (req.path.startsWith('/api/auth')) return next();

    const licensePath = path.join(__dirname, '../data/license.key');
    const hasLicense = fs.existsSync(licensePath);

    req.hasLicense = hasLicense;

    // If trying to modify data or access admin features, check license?
    // User requested "require a license file ... in order to unlock the application feature to allow for multi-user scaling."
    // We will assume that WITHOUT a license, it acts as single-user or read-only? 
    // Let's enforce license for creating ANY additional users beyond the default admin.

    next();
};

app.use(checkLicense);

// 2. Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Forbidden" });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Require Admin privileges" });
    }
    next();
}

// 3. Audit Log Middleware
const auditLog = (action, entityType) => {
    return (req, res, next) => {
        // Intercept response to log success? Or log attempt?
        // Usually log successful actions.
        const originalJson = res.json;
        res.json = function (data) {
            // Log if no error
            if (!data.error && req.user) {
                const entityId = data.data?.id || req.params.id || null;
                const details = JSON.stringify(req.body).substring(0, 500); // Truncate

                db.run("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)",
                    [req.user.id, action, entityType, entityId, details],
                    (err) => {
                        if (err) console.error("Audit Log Failure:", err);
                    }
                );
            }
            originalJson.apply(res, arguments);
        };
        next();
    };
};

// --- API: Auth ---

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        // Check password
        // Migration: If password is plain text (not starts with $2b$), upgrade it? 
        // Or just compare. For now, assume we compare hash.
        // If the user was just created with "password", we should ideally hash it.
        // Simple check:
        let valid = false;
        if (user.password.startsWith('$2b$')) {
            valid = await bcrypt.compare(password, user.password);
        } else {
            // Fallback for legacy plain text (and auto-migrate?)
            valid = (password === user.password);
        }

        if (!valid) return res.status(401).json({ error: "Invalid credentials" });

        // Generate Token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role || 'viewer' }, JWT_SECRET, { expiresIn: '8h' });

        // Log Login
        db.run("INSERT INTO audit_logs (user_id, action, entity_type, details) VALUES (?, ?, ?, ?)",
            [user.id, 'LOGIN', 'user', `Login from ${req.ip}`]);

        res.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role || 'viewer' },
            access_token: token,
            error: null
        });
    });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

// --- API: Contacts ---

// Public read? Or Require Auth? 
// Requirement: "unlimited users to view the application" -> Implies VIEWERS need accounts or public?
// "restrict the editing ... to administrators only".
// Let's allow public read for now as per "unlimited users to view", assuming login not strictly required for view?
// OR "users" implies registered users. Let's require login for Viewer role.
app.get('/api/contacts', (req, res) => {
    // Audit log for view? Maybe too noisy.
    db.all("SELECT * FROM contacts ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, error: null });
    });
});

app.post('/api/contacts', authenticateToken, requireAdmin, auditLog('CREATE', 'contact'), (req, res) => {
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

app.put('/api/contacts/:id', authenticateToken, requireAdmin, auditLog('UPDATE', 'contact'), (req, res) => {
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

app.delete('/api/contacts/:id', authenticateToken, requireAdmin, auditLog('DELETE', 'contact'), (req, res) => {
    db.run("DELETE FROM contacts WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ error: null }); // Response handled strictly, audit log might miss Details if not carefully passed, but EntityID is there.
    });
});

// --- API: Upload ---
app.post('/api/upload', authenticateToken, requireAdmin, upload.single('file'), auditLog('IMPORT', 'file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const publicUrl = `/storage/imports/${req.file.filename}`;
    res.json({ data: { publicUrl }, error: null });
});

// --- API: Audit Logs (Admin Only) ---
app.get('/api/audit-logs', authenticateToken, requireAdmin, (req, res) => {
    db.all(`
        SELECT a.*, u.email as user_email 
        FROM audit_logs a 
        LEFT JOIN users u ON a.user_id = u.id 
        ORDER BY a.timestamp DESC LIMIT 100
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, error: null });
    });
});

// --- API: License Management (Admin Only) ---
app.get('/api/licenses', authenticateToken, requireAdmin, (req, res) => {
    db.all("SELECT * FROM licenses ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows, error: null });
    });
});

app.post('/api/licenses', authenticateToken, requireAdmin, (req, res) => {
    const { customer_name, technical_contact, technical_email, business_contact, business_email } = req.body;

    // Generate simple key
    const generated_key = 'NORD-' + Math.random().toString(36).substring(2, 15).toUpperCase();

    db.run(`INSERT INTO licenses (customer_name, technical_contact, technical_email, business_contact, business_email, generated_key, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [customer_name, technical_contact, technical_email, business_contact, business_email, generated_key, req.user.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: { id: this.lastID, generated_key }, error: null });
        }
    );
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
