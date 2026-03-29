const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired } = require('../utils/validators');

class RoleController {
    /**
     * GET /api/roles
     * Get all available roles
     */
    static async getRoles(req, res, next) {
        try {
            const result = await pool.query(`
        SELECT id, name, description, is_active, created_at 
        FROM roles 
        ORDER BY created_at ASC
      `);

            res.json({ success: true, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/roles/permissions
     * Get all system permissions grouped by module
     */
    static async getPermissions(req, res, next) {
        try {
            const result = await pool.query(`
        SELECT id, name, description, module 
        FROM permissions 
        ORDER BY module ASC, name ASC
      `);

            // Group by module
            const grouped = result.rows.reduce((acc, perm) => {
                if (!acc[perm.module]) acc[perm.module] = [];
                acc[perm.module].push(perm);
                return acc;
            }, {});

            res.json({ success: true, data: grouped });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/roles
     * Create a new custom role
     */
    static async createRole(req, res, next) {
        try {
            const { name, description, permissions } = req.body;

            const required = validateRequired(req.body, ['name']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            await pool.query('BEGIN');

            // Create role
            const roleResult = await pool.query(
                `INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id, name, description`,
                [name, description]
            );

            const roleId = roleResult.rows[0].id;

            // Assign permissions if provided
            if (Array.isArray(permissions) && permissions.length > 0) {
                for (const permId of permissions) {
                    await pool.query(
                        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                        [roleId, permId]
                    );
                }
            }

            await pool.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Role created successfully',
                data: roleResult.rows[0]
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            if (error.code === '23505') {
                next(ApiError.conflict('Role with this name already exists'));
            } else {
                next(error);
            }
        }
    }
}

module.exports = RoleController;
