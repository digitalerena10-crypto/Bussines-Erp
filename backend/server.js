const express = require('express');
const path = require('path');
const cors = require('cors');

// ─── Catch-all for ANY uncaught crash ────────────────────────────────
process.on('uncaughtException', (err) => {
    console.error('💀 UNCAUGHT EXCEPTION:', err.message);
    console.error(err.stack);
});
process.on('unhandledRejection', (reason) => {
    console.error('💀 UNHANDLED REJECTION:', reason);
});

const app = express();

// ═══════════════════════════════════════════════════════════════════════
// STEP 1: CORS — MUST be the VERY FIRST middleware (before everything)
// ═══════════════════════════════════════════════════════════════════════

// ─── TEMP DEBUG CORS (Uncomment this line AND comment out the block below to test)
// app.use(cors());

const corsOptions = {
    origin: 'https://bussines-erp-s6ea.vercel.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ═══════════════════════════════════════════════════════════════════════
// STEP 2: Body Parsing — SECOND middleware
// ═══════════════════════════════════════════════════════════════════════
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ═══════════════════════════════════════════════════════════════════════
// STEP 3: Health check (BEFORE any potentially crashing middleware)
// This guarantees Railway sees the app as alive even if routes crash.
// ═══════════════════════════════════════════════════════════════════════
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API running',
        service: 'Kinetic Vault ERP Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// ═══════════════════════════════════════════════════════════════════════
// STEP 4: Load optional middleware safely (any crash here won't kill app)
// ═══════════════════════════════════════════════════════════════════════
let logger, routes, errorHandler, apiLimiter;

try {
    logger = require('./utils/logger');
    console.log('✅ Logger loaded');
} catch (e) {
    console.error('⚠️ Logger failed to load:', e.message);
    logger = { info: console.log, warn: console.warn, error: console.error, debug: console.log };
}

try {
    const helmet = require('helmet');
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
    }));
    console.log('✅ Helmet loaded');
} catch (e) {
    console.warn('⚠️ Helmet skipped:', e.message);
}

try {
    const compression = require('compression');
    app.use(compression());
    console.log('✅ Compression loaded');
} catch (e) {
    console.warn('⚠️ Compression skipped:', e.message);
}

// Static files for uploads
const uploadsPath = process.env.NODE_ENV === 'production'
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, 'uploads');
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(uploadsPath));

// Rate limiter
try {
    const rl = require('./middlewares/rateLimiter');
    apiLimiter = rl.apiLimiter;
    app.use('/api', apiLimiter);
    console.log('✅ Rate limiter loaded');
} catch (e) {
    console.warn('⚠️ Rate limiter skipped:', e.message);
}

// Request logging
app.use((req, res, next) => {
    if (logger && logger.info) {
        logger.info(`${req.method} ${req.originalUrl}`, { ip: req.ip });
    }
    next();
});

// ═══════════════════════════════════════════════════════════════════════
// STEP 5: API Routes — THIRD (after CORS and body parsing)
// ═══════════════════════════════════════════════════════════════════════
try {
    routes = require('./routes');
    app.use('/api', routes);
    console.log('✅ API routes loaded');
} catch (e) {
    console.error('❌ Routes failed to load:', e.message);
    console.error(e.stack);
    // Fallback route so we know the server is alive
    app.use('/api', (req, res) => {
        res.status(500).json({
            success: false,
            message: 'Routes failed to initialize: ' + e.message
        });
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// Global error handler
try {
    errorHandler = require('./middlewares/errorHandler');
    app.use(errorHandler);
} catch (e) {
    app.use((err, req, res, _next) => {
        console.error('Error:', err.message);
        res.status(500).json({ success: false, message: err.message });
    });
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 6: Seed admin user (non-blocking, will never crash server)
// ═══════════════════════════════════════════════════════════════════════
const seedAdmin = async () => {
    try {
        const bcrypt = require('bcryptjs');
        const db = require('./config/db');
        const roleRes = await db.query("SELECT id FROM roles WHERE name = 'Super Admin'");
        if (roleRes.rows.length === 0) return;
        const branchRes = await db.query("SELECT id FROM branches LIMIT 1");
        if (branchRes.rows.length === 0) return;
        const existing = await db.query("SELECT id FROM users WHERE email = $1", ['admin@company.com']);
        if (existing.rows.length > 0) {
            console.log('✅ Admin user exists.');
            return;
        }
        const hash = await bcrypt.hash('password123', 10);
        await db.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role_id, branch_id) VALUES ($1,$2,$3,$4,$5,$6)`,
            ['admin@company.com', hash, 'Super', 'Admin', roleRes.rows[0].id, branchRes.rows[0].id]
        );
        console.log('🎉 Default admin created: admin@company.com / password123');
    } catch (err) {
        console.warn(`Admin seed skipped: ${err.message}`);
    }
};

// ═══════════════════════════════════════════════════════════════════════
// STEP 7: START SERVER — This MUST succeed. Port from process.env.PORT.
// ═══════════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;

console.log(`🔧 Attempting to start server on port ${PORT}...`);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ERP Server running on port ${PORT}`);
    console.log(`📡 API available at http://0.0.0.0:${PORT}/api`);
    console.log(`🌍 Health check: http://0.0.0.0:${PORT}/`);

    // Seed admin AFTER server is listening (non-blocking)
    seedAdmin().catch(() => {});
});

module.exports = app;
