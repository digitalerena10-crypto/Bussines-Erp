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
            const { name, description, parent_id, is_active } = req.body;

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
                `INSERT INTO product_categories (name, description, parent_id, is_active) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
                [name, description, parent_id || null, is_active !== undefined ? is_active : true]
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

    /**
     * PUT /api/categories/:id
     * Update an existing category
     */
    static async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const { name, description, parent_id, is_active } = req.body;

            const required = validateRequired(req.body, ['name']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            // Check if parent_id exists if provided
            if (parent_id) {
                if (parent_id === id) {
                    throw ApiError.badRequest('A category cannot be its own parent');
                }
                const parentCheck = await pool.query('SELECT id FROM product_categories WHERE id = $1', [parent_id]);
                if (parentCheck.rows.length === 0) {
                    throw ApiError.badRequest('Parent category does not exist');
                }
            }

            const result = await pool.query(
                `UPDATE product_categories 
                 SET name = $1, description = $2, parent_id = $3, is_active = $4 
                 WHERE id = $5 
                 RETURNING *`,
                [name, description, parent_id || null, is_active !== undefined ? is_active : true, id]
            );

            if (result.rows.length === 0) {
                throw ApiError.notFound('Category not found');
            }

            res.json({
                success: true,
                message: 'Category updated successfully',
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

    /**
     * DELETE /api/categories/:id
     * Delete a category
     */
    static async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;

            // Check if category is used by products
            const productsCheck = await pool.query('SELECT id FROM products WHERE category_id = $1 LIMIT 1', [id]);
            if (productsCheck.rows.length > 0) {
                throw ApiError.badRequest('Cannot delete category: It is currently used by one or more products');
            }

            // Check if category has child categories
            const childrenCheck = await pool.query('SELECT id FROM product_categories WHERE parent_id = $1 LIMIT 1', [id]);
            if (childrenCheck.rows.length > 0) {
                throw ApiError.badRequest('Cannot delete category: It has child categories');
            }

            const result = await pool.query(
                'DELETE FROM product_categories WHERE id = $1 RETURNING id',
                [id]
            );

            if (result.rows.length === 0) {
                throw ApiError.notFound('Category not found');
            }

            res.json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CategoryController;
