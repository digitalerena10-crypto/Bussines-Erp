const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired } = require('../utils/validators');

class TransactionController {
    /**
     * GET /api/accounting/transactions
     */
    static async getTransactions(req, res, next) {
        try {
            const result = await pool.query(`
        SELECT 
          t.id, t.transaction_date, t.description, t.reference_type, t.reference_id,
          t.amount, t.debit_account_id, t.credit_account_id,
          da.name as debit_account_name, ca.name as credit_account_name
        FROM transactions t
        LEFT JOIN accounts da ON t.debit_account_id = da.id
        LEFT JOIN accounts ca ON t.credit_account_id = ca.id
        ORDER BY t.transaction_date DESC, t.id DESC
        LIMIT 100
      `);

            res.json({ success: true, count: result.rows.length, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/accounting/transactions
     * Create a manual journal entry (double-entry transaction)
     */
    static async createTransaction(req, res, next) {
        const client = await pool.connect();

        try {
            const {
                transaction_date, description, amount,
                debit_account_id, credit_account_id,
                reference_type, reference_id
            } = req.body;
            const user_id = req.user.id;

            const required = validateRequired(req.body, ['transaction_date', 'amount', 'debit_account_id', 'credit_account_id']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            const amt = parseFloat(amount);
            if (isNaN(amt) || amt <= 0) {
                throw ApiError.badRequest('Amount must be positive');
            }

            await client.query('BEGIN');

            // 1. Create Transaction record
            const result = await client.query(
                `INSERT INTO transactions 
          (transaction_date, description, amount, debit_account_id, credit_account_id, reference_type, reference_id, created_by) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
                [transaction_date, description, amt, debit_account_id, credit_account_id, reference_type || 'manual', reference_id || null, user_id]
            );

            // 2. Update account balances (Note: In a full ERP, we might use a separate account_balances table for speed)
            // Here we rely on the transactions table as the source of truth for simplicity in this dev phase.

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Transaction recorded successfully',
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    }
}

module.exports = TransactionController;
