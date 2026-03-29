const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const env = require('./config/env');
const logger = require('./utils/logger');
const { testConnection } = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');

const app = express();

// ─── Optimization & Security ────────────────────────────────────────
app.use(compression());
app.use(helmet({
    contentSecurityPolicy: env.nodeEnv === 'production',
    crossOriginEmbedderPolicy: env.nodeEnv === 'production',
    crossOriginResourcePolicy: false
}));

// ─── CORS ───────────────────────────────────────────────────────────
app.use(
    cors({
        origin: env.corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ─── Body Parsing ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ───────────────────────────────────────────────────
app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, 'uploads')));

// ─── Rate Limiting ──────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Request Logging ────────────────────────────────────────────────
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
    });
    next();
});

// ─── Health Check (Railway + Browser verification) ──────────────
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Kinetic Vault ERP Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// ─── API Routes ─────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 Handler ────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});

// ─── Global Error Handler ───────────────────────────────────────────
app.use(errorHandler);

// ─── Seed Admin User (inline, non-blocking) ─────────────────────────
const seedAdmin = async () => {
    const bcrypt = require('bcryptjs');
    const db = require('./config/db');
    try {
        const roleRes = await db.query("SELECT id FROM roles WHERE name = 'Super Admin'");
        if (roleRes.rows.length === 0) return;
        const branchRes = await db.query("SELECT id FROM branches LIMIT 1");
        if (branchRes.rows.length === 0) return;
        const existing = await db.query("SELECT id FROM users WHERE email = $1", ['admin@company.com']);
        if (existing.rows.length > 0) {
            logger.info('✅ Admin user exists.');
            return;
        }
        const hash = await bcrypt.hash('password123', 10);
        await db.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role_id, branch_id) VALUES ($1,$2,$3,$4,$5,$6)`,
            ['admin@company.com', hash, 'Super', 'Admin', roleRes.rows[0].id, branchRes.rows[0].id]
        );
        logger.info('🎉 Default admin created: admin@company.com / password123');
    } catch (err) {
        logger.warn(`Admin seed skipped: ${err.message}`);
    }
};

// ─── Start Server ───────────────────────────────────────────────────
const startServer = async () => {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
        logger.warn('⚠️  Server starting without database connection. Some features may not work.');
    }

    // Seed admin user (non-blocking, won't crash server)
    seedAdmin().catch(() => {});

    app.listen(env.port, '0.0.0.0', () => {
        logger.info(`🚀 ERP Server running on port ${env.port} in ${env.nodeEnv} mode`);
        logger.info(`📡 API available at http://0.0.0.0:${env.port}/api`);
    });
};

startServer().catch((err) => {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
});

module.exports = app;
