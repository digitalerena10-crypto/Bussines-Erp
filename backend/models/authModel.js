const db = require('../config/db');

/**
 * Handle database queries for Authentication
 */
class AuthModel {
    /**
     * Find a user by email, including their role and permissions
     */
    static async findUserByEmail(email) {
        const sql = `
      SELECT 
        u.id, u.email, u.password_hash, u.first_name, u.last_name, 
        u.is_active, u.role_id, u.branch_id,
        r.name as role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;
        const result = await db.query(sql, [email]);
        return result.rows[0];
    }

    /**
     * Find a user by ID
     */
    static async findUserById(id) {
        const sql = `
      SELECT id, email, first_name, last_name, is_active, role_id, branch_id
      FROM users
      WHERE id = $1
    `;
        const result = await db.query(sql, [id]);
        return result.rows[0];
    }

    /**
     * Get all permissions for a specific role
     */
    static async getRolePermissions(roleId) {
        const sql = `
      SELECT p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
    `;
        const result = await db.query(sql, [roleId]);
        return result.rows.map(row => row.name);
    }

    /**
     * Create a new user
     */
    static async createUser(userData) {
        const { email, passwordHash, firstName, lastName, roleId, branchId, phone } = userData;
        const sql = `
      INSERT INTO users (email, password_hash, first_name, last_name, role_id, branch_id, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, first_name, last_name, is_active, created_at
    `;
        const values = [email, passwordHash, firstName, lastName, roleId, branchId, phone];
        const result = await db.query(sql, values);
        return result.rows[0];
    }

    /**
     * Update user last login timestamp
     */
    static async updateLastLogin(userId) {
        const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`;
        await db.query(sql, [userId]);
    }
}

module.exports = AuthModel;
