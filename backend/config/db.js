const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');
const { handleMockQuery } = require('../utils/mockDb');

const isMock = env.db.host === 'mock';

const poolConfig = env.db.connectionString
    ? { connectionString: env.db.connectionString }
    : {
        host: env.db.host,
        port: env.db.port,
        database: env.db.name,
        user: env.db.user,
        password: env.db.password,
    };

if (env.nodeEnv === 'production') {
    poolConfig.ssl = { rejectUnauthorized: false };
}

poolConfig.max = 20;
poolConfig.idleTimeoutMillis = 30000;
poolConfig.connectionTimeoutMillis = 5000;

// ─── Internal real PG pool (never exported directly) ─────────────────
const _realPool = isMock ? null : new Pool(poolConfig);

if (_realPool) {
    _realPool.on('connect', () => logger.debug('New PG client connected'));
    _realPool.on('error', (err) => logger.error('Idle PG client error', { error: err.message }));
}

// ─── Safe query: tries real DB, falls back to mock ───────────────────
const safeQuery = async (text, params) => {
    if (isMock) return handleMockQuery(text, params);
    
    if (env.nodeEnv === 'production') {
        return await _realPool.query(text, params);
    }

    try {
        return await _realPool.query(text, params);
    } catch (err) {
        logger.warn(`DB query failed → mock fallback`, { error: err.message });
        return handleMockQuery(text, params);
    }
};

// ─── Create a mock client (for when real connect fails) ──────────────
const createMockClient = () => ({
    query: (text, params) => handleMockQuery(text, params),
    release: () => { },
});

// ─── Wrap a real PG client so its .query() also has mock fallback ─────
const wrapClient = (realClient) => ({
    query: async (text, params) => {
        if (env.nodeEnv === 'production') {
            return await realClient.query(text, params);
        }
        try {
            return await realClient.query(text, params);
        } catch (err) {
            logger.warn(`Client query failed → mock fallback`, { error: err.message });
            return handleMockQuery(text, params);
        }
    },
    release: () => realClient.release(),
});

// ─── Exported pool object ────────────────────────────────────────────
// Every controller that does `const { pool } = require('../config/db')`
// and then calls pool.query() or pool.connect() is now safe.
const pool = {
    on: (event, fn) => _realPool ? _realPool.on(event, fn) : undefined,
    end: async () => _realPool ? _realPool.end() : undefined,
    query: (text, params) => safeQuery(text, params),
    connect: async () => {
        if (isMock) return createMockClient();
        try {
            const realClient = await _realPool.connect();
            return wrapClient(realClient);
        } catch (err) {
            if (env.nodeEnv === 'production') throw err;
            logger.warn(`Pool connect failed → mock client`, { error: err.message });
            return createMockClient();
        }
    },
};

// ─── Test connection ─────────────────────────────────────────────────
const testConnection = async () => {
    if (isMock) {
        logger.info('🧪 Running in MOCK mode — all data is local only.');
        return true;
    }
    try {
        const client = await _realPool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        logger.info(`✅ PostgreSQL connected — ${result.rows[0].now}`);
        return true;
    } catch (err) {
        logger.warn(`⚠️ PostgreSQL unavailable: ${err.message}. Using MOCK fallback.`);
        return true;
    }
};

// ─── Query wrapper with logging ──────────────────────────────────────
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await safeQuery(text, params);
        const duration = Date.now() - start;
        logger.debug('Query OK', { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
        return result;
    } catch (err) {
        logger.error('Query error', { text: text.substring(0, 80), error: err.message });
        throw err;
    }
};

// ─── Get client (same as pool.connect) ───────────────────────────────
const getClient = async () => pool.connect();

module.exports = { pool, query, getClient, testConnection };
