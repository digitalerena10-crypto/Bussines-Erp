const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired } = require('../utils/validators');

class InvoiceController {
    /**
     * GET /api/sales/invoices
     */
    static async getInvoices(req, res, next) {
        try {
            const result = await pool.query(`
        SELECT 
          i.id, i.invoice_number, i.status, i.grand_total, i.created_at,
          c.name as customer_name
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        ORDER BY i.created_at DESC
        LIMIT 50
      `);

            res.json({ success: true, count: result.rows.length, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/sales/invoices
     */
    static async createInvoice(req, res, next) {
        const client = await pool.connect();
        try {
            const { customer_id, sales_order_id, branch_id, items, status, notes, tax_amount, discount_amount, shipping_amount } = req.body;
            const user_id = req.user.id;

            const required = validateRequired(req.body, ['customer_id', 'items']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            if (!Array.isArray(items) || items.length === 0) {
                throw ApiError.badRequest('Invoice must contain at least one item');
            }

            await client.query('BEGIN');

            let subtotal = 0;
            const processedItems = [];

            for (const item of items) {
                const qty = parseFloat(item.quantity);
                const price = parseFloat(item.unit_price);
                const rowSubtotal = qty * price;
                subtotal += rowSubtotal;

                processedItems.push({
                    product_id: item.product_id || null,
                    description: item.description || 'Custom Item',
                    quantity: qty,
                    unit_price: price,
                    subtotal: rowSubtotal
                });
            }

            const tax = parseFloat(tax_amount) || 0;
            const discount = parseFloat(discount_amount) || 0;
            const shipping = parseFloat(shipping_amount) || 0;
            const grandTotal = subtotal + tax + shipping - discount;

            const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const invoiceNumber = `INV-${datePrefix}-${randomSuffix}`;

            const invoiceRes = await client.query(
                `INSERT INTO invoices
                (invoice_number, customer_id, sales_order_id, branch_id, status, subtotal, tax_amount, discount_amount, shipping_amount, grand_total, notes, created_by)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING * `,
                [invoiceNumber, customer_id, sales_order_id || null, branch_id || 1, status || 'unpaid', subtotal, tax, discount, shipping, grandTotal, notes || null, user_id]
            );

            const invoiceId = invoiceRes.rows[0].id;

            for (const item of processedItems) {
                await client.query(
                    `INSERT INTO invoice_items
                (invoice_id, product_id, description, quantity, unit_price, subtotal)
            VALUES($1, $2, $3, $4, $5, $6)`,
                    [invoiceId, item.product_id, item.description, item.quantity, item.unit_price, item.subtotal]
                );
            }

            // Update customer balance (credit_limit used as a mock balance here or create a new field if it existed)
            await client.query(
                `UPDATE customers SET credit_limit = credit_limit - $1 WHERE id = $2`,
                [grandTotal, customer_id]
            );

            // Add ledger transaction for Accounts Receivable
            await client.query(
                `INSERT INTO transactions(transaction_date, description, amount, debit_account_name, credit_account_name)
            VALUES($1, $2, $3, $4, $5)`,
                [new Date().toISOString(), `Invoice ${invoiceNumber}`, grandTotal, 'Accounts Receivable', 'Sales Revenue']
            );

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Invoice created successfully',
                data: invoiceRes.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    }
}

module.exports = InvoiceController;
