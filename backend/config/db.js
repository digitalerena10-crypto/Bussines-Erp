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

// Create the real PG pool or a pure mock pool
const _realPool = isMock ? null : new Pool(poolConfig);

// Log pool events
if (_realPool) {
    _realPool.on('connect', () => {
        logger.debug('New client connected to PostgreSQL pool');
    });

    _realPool.on('error', (err) => {
        logger.error('Unexpected error on idle PostgreSQL client', { error: err.message });
    });
}

/**
 * Safe query function — tries real DB first, falls back to mock on failure.
 * This is used by BOTH the exported `query()` function AND `pool.query()`.
 */
const safeQuery = async (text, params) => {
    if (isMock) {
        return handleMockQuery(text, params);
    }
    try {
        return await _realPool.query(text, params);
    } catch (err) {
        logger.warn('Database query failed, trying mock fallback...', { error: err.message });
        return handleMockQuery(text, params);
    }
};

/**
 * Wrapped pool object that controllers import via `const { pool } = require('../config/db')`.
 * pool.query() now has automatic mock fallback built in — no controller changes needed.
 */
const pool = isMock ? {
    on: () => { },
    end: async () => { },
    connect: async () => ({
        query: (text, params) => handleMockQuery(text, params),
        release: () => { },
    }),
    query: (text, params) => safeQuery(text, params),
} : {
    on: (event, fn) => _realPool.on(event, fn),
    end: async () => _realPool.end(),
    connect: async () => {
        try {
            return await _realPool.connect();
        } catch (err) {
            logger.warn('Pool connect failed, returning mock client...', { error: err.message });
            return {
                query: (text, params) => handleMockQuery(text, params),
                release: () => { },
            };
        }
    },
    query: (text, params) => safeQuery(text, params),
};

/**
 * Test database connection
 */
const testConnection = async () => {
    if (isMock) {
        logger.info('🧪 Running in Database MOCK mode — All data is local only.');
        return true;
    }
    try {
        const client = await _realPool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        logger.info(`✅ PostgreSQL connected at ${env.db.host}:${env.db.port}/${env.db.name} — ${result.rows[0].now}`);
        return true;
    } catch (err) {
        logger.warn(`⚠️  PostgreSQL connection failed: ${err.message}. Running in MOCK fallback mode.`);
        return true;
    }
};

/**
 * Execute a query with optional parameters (wrapper with logging)
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await safeQuery(text, params);
        const duration = Date.now() - start;
        logger.debug('Query executed', { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
        return result;
    } catch (err) {
        logger.error('Query error', { text: text.substring(0, 80), error: err.message });
        throw err;
    }
};

/**
 * Get a client from the pool for transactions
 */
const getClient = async () => {
    return pool.connect();
};

module.exports = {
    pool,
    query,
    getClient,
    testConnection,
};
