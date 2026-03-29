const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired } = require('../utils/validators');

class InventoryController {
    /**
     * GET /api/inventory
     * Get current stock levels per branch
     */
    static async getInventory(req, res, next) {
        try {
            const { branch_id, product_id } = req.query;

            let query = `
        SELECT 
          i.id, i.quantity, i.last_updated,
          p.id as product_id, p.sku, p.name as product_name, p.min_stock_level,
          b.id as branch_id, b.name as branch_name
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        JOIN branches b ON i.branch_id = b.id
        WHERE 1=1
      `;
            const values = [];
            let paramIndex = 1;

            if (branch_id) {
                query += ` AND i.branch_id = $${paramIndex}`;
                values.push(branch_id);
                paramIndex++;
            }

            if (product_id) {
                query += ` AND i.product_id = $${paramIndex}`;
                values.push(product_id);
                paramIndex++;
            }

            query += ` ORDER BY p.name ASC, b.name ASC`;

            const result = await pool.query(query, values);

            res.json({ success: true, count: result.rows.length, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/inventory/movement
     * Record a stock movement (in, out, transfer, adjustment)
     */
    static async recordMovement(req, res, next) {
        const client = await pool.connect();

        try {
            const { product_id, branch_id, movement_type, quantity, reference_type, reference_id, notes } = req.body;
            const user_id = req.user.id; // From auth middleware

            const required = validateRequired(req.body, ['product_id', 'branch_id', 'movement_type', 'quantity']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            if (!['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'].includes(movement_type)) {
                throw ApiError.badRequest('Invalid movement_type');
            }

            const qty = parseFloat(quantity);
            if (isNaN(qty) || qty <= 0) {
                throw ApiError.badRequest('Quantity must be a positive number');
            }

            await client.query('BEGIN');

            // 1. Record the movement log
            const movementResult = await client.query(
                `INSERT INTO stock_movements 
          (product_id, branch_id, movement_type, quantity, reference_type, reference_id, notes, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
                [product_id, branch_id, movement_type, qty, reference_type || null, reference_id || null, notes || null, user_id]
            );

            // 2. Determine quantity modifier for the ledger
            let quantityChange = qty;
            if (movement_type === 'OUT') {
                quantityChange = -qty;
            } else if (movement_type === 'ADJUSTMENT' && notes?.toLowerCase().includes('negative')) { // simplistic adjustment logic for demo
                quantityChange = -qty;
            }

            // 3. Upsert inventory levels
            const inventoryResult = await client.query(`
        INSERT INTO inventory (product_id, branch_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id, branch_id) 
        DO UPDATE SET 
          quantity = inventory.quantity + EXCLUDED.quantity,
          last_updated = CURRENT_TIMESTAMP
        RETURNING *
      `, [product_id, branch_id, quantityChange]);

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Stock movement recorded successfully',
                data: {
                    movement: movementResult.rows[0],
                    new_stock_level: inventoryResult.rows[0]
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    }
}

module.exports = InventoryController;
