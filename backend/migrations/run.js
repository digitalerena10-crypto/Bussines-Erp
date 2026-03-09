const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const logger = require('../utils/logger');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const runMigrations = async () => {
    logger.info('🚀 Starting database migrations...');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Read and execute 01_initial_schema.sql
        const schemaPath = path.join(__dirname, '01_initial_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        logger.info('Executing initial schema...');
        await client.query(schemaSql);
        logger.info('✅ Initial schema applied successfully.');

        // Read and execute 02_seed_data.sql
        const seedPath = path.join(__dirname, '02_seed_data.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        logger.info('Executing seed data...');
        await client.query(seedSql);
        logger.info('✅ Seed data applied successfully.');

        await client.query('COMMIT');
        logger.info('🎉 All migrations completed successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`❌ Migration failed: ${error.message}`);
        console.error(error);
    } finally {
        client.release();
        pool.end();
    }
};

runMigrations();
