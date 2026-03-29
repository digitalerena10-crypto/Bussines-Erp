const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired, isValidEmail } = require('../utils/validators');

class BranchController {
    /**
     * GET /api/branches
     */
    static async getBranches(req, res, next) {
        try {
            const result = await pool.query(`
        SELECT id, name, address, phone, email, is_active 
        FROM branches 
        WHERE is_active = true
        ORDER BY name ASC
      `);

            res.json({ success: true, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/branches
     */
    static async createBranch(req, res, next) {
        try {
            const { name, address, phone, email } = req.body;

            const required = validateRequired(req.body, ['name', 'address']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing fields: ${required.missing.join(', ')}`);
            }

            if (email && !isValidEmail(email)) {
                throw ApiError.badRequest('Invalid email format');
            }

            const result = await pool.query(
                `INSERT INTO branches (name, address, phone, email) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, address, phone, email, is_active`,
                [name, address, phone, email]
            );

            res.status(201).json({
                success: true,
                message: 'Branch created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BranchController;
