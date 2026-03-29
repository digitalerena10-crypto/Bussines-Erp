const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const logger = require('../utils/logger');

const seedAdminUser = async () => {
    logger.info('Starting Admin user seed process...');

    try {
        // Find Super Admin role
        const roleResult = await pool.query("SELECT id FROM roles WHERE name = 'Super Admin'");
        if (roleResult.rows.length === 0) {
            logger.warn('Super Admin role not found. Skipping seed — run migrations first.');
            return;
        }
        const roleId = roleResult.rows[0].id;

        // Find HQ branch
        const branchResult = await pool.query("SELECT id FROM branches LIMIT 1");
        if (branchResult.rows.length === 0) {
            logger.warn('No branch found. Skipping seed — run migrations first.');
            return;
        }
        const branchId = branchResult.rows[0].id;

        // Check if admin already exists
        const adminEmail = 'admin@company.com';
        const existingAdmin = await pool.query("SELECT id FROM users WHERE email = $1", [adminEmail]);

        if (existingAdmin.rows.length > 0) {
            logger.info('✅ Default admin user already exists.');
            return;
        }

        // Create new admin user
        const passwordHash = await bcrypt.hash('password123', 10);

        await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role_id, branch_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [adminEmail, passwordHash, 'Super', 'Admin', roleId, branchId]
        );

        logger.info('🎉 Default admin user created successfully!');
        logger.info('Email: admin@company.com');
        logger.info('Password: password123');

    } catch (error) {
        logger.error(`❌ Failed to seed admin user: ${error.message}`);
    } finally {
        await pool.end();
        process.exit(0);
    }
};

seedAdminUser();
