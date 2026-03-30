const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const runMigrations = async () => {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.log('⚠️  No DATABASE_URL set — skipping migrations (dev/mock mode).');
        process.exit(0);
    }

    console.log('🚀 Starting database migrations...');
    console.log(`📡 Connecting to: ${dbUrl.replace(/:[^:@]+@/, ':***@')}`);

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 10000,
    });

    let client;
    try {
        client = await pool.connect();
        console.log('✅ Connected to PostgreSQL.');

        await client.query('BEGIN');

        // Read and execute 01_initial_schema.sql
        const schemaPath = path.join(__dirname, '01_initial_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log('Executing initial schema...');
        await client.query(schemaSql);
        console.log('✅ Initial schema applied successfully.');

        // Read and execute 02_seed_data.sql
        const seedPath = path.join(__dirname, '02_seed_data.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        console.log('Executing seed data...');
        await client.query(seedSql);
        console.log('✅ Seed data applied successfully.');

        await client.query('COMMIT');
        console.log('🎉 All migrations completed successfully!');

    } catch (error) {
        if (client) {
            try { await client.query('ROLLBACK'); } catch (_) {}
        }
        console.error(`❌ Migration failed: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (client) client.release();
        await pool.end();
    }
};

runMigrations();
