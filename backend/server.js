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

// ─── Start Server ───────────────────────────────────────────────────
const startServer = async () => {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
        logger.warn('⚠️  Server starting without database connection. Some features may not work.');
    }

    app.listen(env.port, () => {
        logger.info(`🚀 ERP Server running on port ${env.port} in ${env.nodeEnv} mode`);
        logger.info(`📡 API available at http://localhost:${env.port}/api`);
    });
};

startServer().catch((err) => {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
});

module.exports = app;
