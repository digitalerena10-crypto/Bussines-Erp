const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired } = require('../utils/validators');

class CategoryController {
    /**
     * GET /api/categories
     * Get all product categories (can be nested/hierarchical)
     */
    static async getCategories(req, res, next) {
        try {
            const result = await pool.query(`
        SELECT id, name, description, parent_id, is_active, created_at 
        FROM product_categories 
        WHERE is_active = true
        ORDER BY name ASC
      `);

            res.json({ success: true, count: result.rows.length, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/categories
     * Create a new category 
     */
    static async createCategory(req, res, next) {
        try {
            const { name, description, parent_id } = req.body;

            const required = validateRequired(req.body, ['name']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            // Check if parent_id exists if provided
            if (parent_id) {
                const parentCheck = await pool.query('SELECT id FROM product_categories WHERE id = $1', [parent_id]);
                if (parentCheck.rows.length === 0) {
                    throw ApiError.badRequest('Parent category does not exist');
                }
            }

            const result = await pool.query(
                `INSERT INTO product_categories (name, description, parent_id) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
                [name, description, parent_id || null]
            );

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            if (error.code === '23505') { // unique_violation
                next(ApiError.conflict('Category with this name already exists'));
            } else {
                next(error);
            }
        }
    }
}

module.exports = CategoryController;
