const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');

class UserController {
    /**
     * GET /api/users
     * Get all users (Admin only)
     */
    static async getUsers(req, res, next) {
        try {
            const result = await pool.query(`
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.last_login,
          r.name as role_name,
          b.name as branch_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN branches b ON u.branch_id = b.id
        ORDER BY u.created_at DESC
      `);

            res.json({ success: true, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/users/:id
     */
    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;

            const result = await pool.query(`
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at,
          r.id as role_id, r.name as role_name,
          b.id as branch_id, b.name as branch_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN branches b ON u.branch_id = b.id
        WHERE u.id = $1
      `, [id]);

            if (result.rows.length === 0) {
                throw ApiError.notFound('User not found');
            }

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
