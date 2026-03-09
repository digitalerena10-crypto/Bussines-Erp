const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired } = require('../utils/validators');

class SalesOrderController {
    /**
     * GET /api/sales/orders
     */
    static async getOrders(req, res, next) {
        try {
            const result = await pool.query(`
        SELECT 
          so.id, so.order_number, so.status, so.total_amount, so.created_at,
          c.name as customer_name,
          u.first_name as sales_rep_first_name, u.last_name as sales_rep_last_name
        FROM sales_orders so
        LEFT JOIN customers c ON so.customer_id = c.id
        LEFT JOIN users u ON so.created_by = u.id
        ORDER BY so.created_at DESC
        LIMIT 50
      `);

            res.json({ success: true, count: result.rows.length, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/sales/orders/:id
     * Get full order with items
     */
    static async getOrderById(req, res, next) {
        try {
            const { id } = req.params;

            // Get order header
            const orderResult = await pool.query(`
        SELECT 
          so.*,
          c.name as customer_name, c.email as customer_email, c.address as customer_address,
          b.name as branch_name
        FROM sales_orders so
        LEFT JOIN customers c ON so.customer_id = c.id
        LEFT JOIN branches b ON so.branch_id = b.id
        WHERE so.id = $1
      `, [id]);

            if (orderResult.rows.length === 0) {
                throw ApiError.notFound('Sales order not found');
            }

            // Get order items
            const itemsResult = await pool.query(`
        SELECT 
          soi.*,
          p.name as product_name, p.sku
        FROM sales_order_items soi
        JOIN products p ON soi.product_id = p.id
        WHERE soi.sales_order_id = $1
      `, [id]);

            const order = orderResult.rows[0];
            order.items = itemsResult.rows;

            res.json({ success: true, data: order });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/sales/orders
     * Create a new sales order transactionally
     */
    static async createOrder(req, res, next) {
        const client = await pool.connect();

        try {
            const { customer_id, branch_id, items, status, notes } = req.body;
            const user_id = req.user.id;

            const required = validateRequired(req.body, ['customer_id', 'branch_id', 'items']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            if (!Array.isArray(items) || items.length === 0) {
                throw ApiError.badRequest('Order must contain at least one item');
            }

            await client.query('BEGIN');

            // 1. Calculate total amount and prepare items
            let totalAmount = 0;
            const processedItems = [];

            for (const item of items) {
                if (!item.product_id || !item.quantity || !item.unit_price) {
                    throw ApiError.badRequest('Each item must have product_id, quantity, and unit_price');
                }

                const qty = parseFloat(item.quantity);
                const price = parseFloat(item.unit_price);
                const subtotal = qty * price;
                totalAmount += subtotal;

                processedItems.push({
                    product_id: item.product_id,
                    quantity: qty,
                    unit_price: price,
                    subtotal: subtotal
                });
            }

            // 2. Generate unique order number (e.g., SO-20231025-XXXX)
            const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const orderNumber = `SO-${datePrefix}-${randomSuffix}`;

            // 3. Create Sales Order header
            const orderRes = await client.query(
                `INSERT INTO sales_orders 
          (order_number, customer_id, branch_id, status, total_amount, tax_amount, discount_amount, net_amount, notes, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING *`,
                [orderNumber, customer_id, branch_id, status || 'draft', totalAmount, 0, 0, totalAmount, notes || null, user_id]
            );

            const orderId = orderRes.rows[0].id;

            // 4. Create Sales Order Items and Reduce Inventory
            for (const item of processedItems) {
                await client.query(
                    `INSERT INTO sales_order_items 
            (sales_order_id, product_id, quantity, unit_price, subtotal) 
           VALUES ($1, $2, $3, $4, $5)`,
                    [orderId, item.product_id, item.quantity, item.unit_price, item.subtotal]
                );

                // Reduce inventory correctly based on the sold quantity
                await client.query(
                    `UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2 AND branch_id = $3`,
                    [item.quantity, item.product_id, branch_id]
                );
            }

            // 5. Add ledger transaction for the sale
            await client.query(
                `INSERT INTO transactions (transaction_date, description, amount, debit_account_name, credit_account_name) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [new Date().toISOString(), `Sales Order ${orderNumber}`, totalAmount, 'Accounts Receivable', 'Sales Revenue']
            );

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Sales order created successfully',
                data: orderRes.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    }
}

module.exports = SalesOrderController;
