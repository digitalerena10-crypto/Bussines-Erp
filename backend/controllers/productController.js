const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired } = require('../utils/validators');

class ProductController {
    /**
     * GET /api/products
     * Get all products with filters
     */
    static async getProducts(req, res, next) {
        try {
            const { category_id, search } = req.query;

            let query = `
        SELECT 
          p.id, p.sku, p.name, p.description, p.base_price, p.unit_of_measure, 
          p.min_stock_level, p.is_active,
          c.name as category_name,
          s.name as supplier_name
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.is_active = true
      `;
            const values = [];
            let paramIndex = 1;

            if (category_id) {
                query += ` AND p.category_id = $${paramIndex}`;
                values.push(category_id);
                paramIndex++;
            }

            if (search) {
                query += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
                values.push(`%${search}%`);
                paramIndex++;
            }

            query += ` ORDER BY p.name ASC`;

            const result = await pool.query(query, values);

            res.json({ success: true, count: result.rows.length, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/products/:id
     * Get a single product
     */
    static async getProductById(req, res, next) {
        try {
            const { id } = req.params;

            const result = await pool.query(`
        SELECT 
          p.*,
          c.name as category_name,
          s.name as supplier_name
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.id = $1
      `, [id]);

            if (result.rows.length === 0) {
                throw ApiError.notFound('Product not found');
            }

            res.json({ success: true, data: result.rows[0] });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/products
     * Create a new product
     */
    static async createProduct(req, res, next) {
        const client = await pool.connect();
        try {
            let {
                sku, name, description, category_id, supplier_id,
                base_price, cost_price, tax_rate, brand, barcode,
                is_active = true, image_url,
                unit_of_measure, min_stock_level, stock_quantity = 0
            } = req.body;
            const initialStockQty = Number(stock_quantity) || 0;

            const required = validateRequired(req.body, ['name', 'base_price']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            // Generate SKU if empty
            if (!sku || sku.trim() === '') {
                const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                const prefix = name ? name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X') : 'PRD';
                sku = `${prefix}-${Date.now().toString().slice(-4)}-${randomPart}`;
            }

            await client.query('BEGIN');

            const result = await client.query(
                `INSERT INTO products 
          (sku, name, description, category_id, supplier_id, base_price, cost_price, tax_rate, brand, barcode, is_active, image_url, unit_of_measure, min_stock_level) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
         RETURNING *`,
                [sku, name, description || null, category_id || null, supplier_id || null, base_price, cost_price || 0, tax_rate || 0, brand || null, barcode || null, is_active, image_url || null, unit_of_measure || 'pcs', min_stock_level || 0]
            );

            const productId = result.rows[0].id;
            let branchId = req.user?.branchId || req.user?.branch_id || null;
            if (!branchId) {
                const branchResult = await client.query(
                    'SELECT id FROM branches ORDER BY created_at ASC LIMIT 1'
                );
                branchId = branchResult.rows[0]?.id || null;
            }

            // Insert initial stock only when both quantity and branch are available
            if (initialStockQty > 0 && branchId) {
                await client.query(
                    `INSERT INTO inventory (product_id, branch_id, quantity) VALUES ($1, $2, $3) RETURNING *`,
                    [productId, branchId, initialStockQty]
                );
            }

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23505') { // unique_violation
                next(ApiError.conflict('Product with this SKU already exists'));
            } else {
                next(error);
            }
        } finally {
            client.release();
        }
    }

    /**
     * PUT /api/products/:id
     * Update an existing product
     */
    static async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const {
                sku, name, description, category_id, supplier_id,
                base_price, cost_price, tax_rate, brand, barcode,
                is_active = true, image_url, unit_of_measure, min_stock_level,
                stock_quantity
            } = req.body;
            const updatedStockQty = stock_quantity !== undefined ? Number(stock_quantity) : null;

            const required = validateRequired(req.body, ['name', 'base_price']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            const existing = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
            if (existing.rows.length === 0) {
                throw ApiError.notFound('Product not found');
            }

            const result = await pool.query(
                `UPDATE products
         SET sku = $1,
             name = $2,
             description = $3,
             category_id = $4,
             supplier_id = $5,
             base_price = $6,
             cost_price = $7,
             tax_rate = $8,
             brand = $9,
             barcode = $10,
             is_active = $11,
             image_url = $12,
             unit_of_measure = $13,
             min_stock_level = $14
         WHERE id = $15
         RETURNING *`,
                [
                    sku,
                    name,
                    description || null,
                    category_id || null,
                    supplier_id || null,
                    base_price,
                    cost_price || 0,
                    tax_rate || 0,
                    brand || null,
                    barcode || null,
                    is_active,
                    image_url || null,
                    unit_of_measure || 'pcs',
                    min_stock_level || 0,
                    id
                ]
            );
            
            // Handle stock update if quantity is provided
            if (updatedStockQty !== null) {
                let branchId = req.user?.branchId || req.user?.branch_id || null;
                if (!branchId) {
                    const branchRes = await pool.query('SELECT id FROM branches ORDER BY created_at ASC LIMIT 1');
                    branchId = branchRes.rows[0]?.id || '1';
                }

                await pool.query(`
                    INSERT INTO inventory (product_id, branch_id, quantity)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (product_id, branch_id)
                    DO UPDATE SET 
                        quantity = $3,
                        last_updated = CURRENT_TIMESTAMP
                `, [id, branchId, updatedStockQty]);
            }

            res.json({
                success: true,
                message: 'Product updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            if (error.code === '23505') {
                next(ApiError.conflict('Product with this SKU already exists'));
            } else {
                next(error);
            }
        }
    }

    /**
     * DELETE /api/products/:id
     * Soft-delete a product
     */
    static async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;

            const result = await pool.query(
                `UPDATE products
         SET is_active = false
         WHERE id = $1
         RETURNING id, name`,
                [id]
            );

            if (result.rows.length === 0) {
                throw ApiError.notFound('Product not found');
            }

            res.json({
                success: true,
                message: 'Product deleted successfully',
                data: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProductController;
