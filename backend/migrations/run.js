const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const runMigrations = async () => {
    const dbUrl = process.env.DATABASE_URL;
    const hasDbParams = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

    if (!dbUrl && !hasDbParams) {
        console.log('⚠️  No DATABASE_URL or DB_HOST set — skipping migrations (dev/mock mode).');
        process.exit(0);
    }

    console.log('🚀 Starting database migrations...');

    const poolConfig = dbUrl
        ? { connectionString: dbUrl }
        : {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        };

    if (process.env.NODE_ENV === 'production') {
        poolConfig.ssl = { rejectUnauthorized: false };
    }

    poolConfig.connectionTimeoutMillis = 10000;

    const pool = new Pool(poolConfig);

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
