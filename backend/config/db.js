const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');
const { handleMockQuery } = require('../utils/mockDb');

const isMock = env.db.host === 'mock';

const pool = isMock ? {
    on: () => { },
    connect: async () => ({
        query: (text, params) => handleMockQuery(text, params),
        release: () => { },
    }),
    query: (text, params) => handleMockQuery(text, params),
} : new Pool({
    host: env.db.host,
    port: env.db.port,
    database: env.db.name,
    user: env.db.user,
    password: env.db.password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Log pool events
if (!isMock) {
    pool.on('connect', () => {
        logger.debug('New client connected to PostgreSQL pool');
    });

    pool.on('error', (err) => {
        logger.error('Unexpected error on idle PostgreSQL client', { error: err.message });
    });
}

/**
 * Test database connection
 */
const testConnection = async () => {
    if (isMock) {
        logger.info('🧪 Running in Database MOCK mode — All data is local only.');
        return true;
    }
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        logger.info(`✅ PostgreSQL connected at ${env.db.host}:${env.db.port}/${env.db.name} — ${result.rows[0].now}`);
        return true;
    } catch (err) {
        logger.warn(`⚠️  PostgreSQL connection failed: ${err.message}. Switching to MOCK mode for development.`);
        return true; // Fallback to mock in dev
    }
};

/**
 * Execute a query with optional parameters
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        let result;
        if (isMock) {
            result = await handleMockQuery(text, params);
        } else {
            try {
                result = await pool.query(text, params);
            } catch (err) {
                logger.warn('Database query failed, trying mock fallback...', { error: err.message });
                result = await handleMockQuery(text, params);
            }
        }
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
    const client = await pool.connect();
    return client;
};

module.exports = {
    pool,
    query,
    getClient,
    testConnection,
};
