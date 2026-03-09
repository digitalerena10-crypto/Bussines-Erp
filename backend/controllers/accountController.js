const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired } = require('../utils/validators');

class AccountController {
    /**
     * GET /api/accounting/accounts
     * Get Chart of Accounts
     */
    static async getAccounts(req, res, next) {
        try {
            const result = await pool.query(`
        SELECT * FROM accounts 
        WHERE is_active = true 
        ORDER BY code ASC
      `);

            res.json({ success: true, count: result.rows.length, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/accounting/accounts
     * Create a new account in COA
     */
    static async createAccount(req, res, next) {
        try {
            const { code, name, type, category, parent_id, description } = req.body;

            const required = validateRequired(req.body, ['code', 'name', 'type', 'category']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            const result = await pool.query(
                `INSERT INTO accounts (code, name, type, category, parent_id, description) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
                [code, name, type, category, parent_id || null, description || null]
            );

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            if (error.code === '23505') {
                next(ApiError.conflict('Account with this code already exists'));
            } else {
                next(error);
            }
        }
    }

    /**
     * POST /api/accounting/journals
     * Create a manual journal entry
     */
    static async createJournalEntry(req, res, next) {
        const client = await pool.connect();
        try {
            const { date, reference, description, lines } = req.body;
            const user_id = req.user.id;

            const required = validateRequired(req.body, ['date', 'description', 'lines']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            if (!Array.isArray(lines) || lines.length < 2) {
                throw ApiError.badRequest('A journal entry must have at least two lines');
            }

            // Validate Debit = Credit
            let totalDebit = 0;
            let totalCredit = 0;
            lines.forEach(line => {
                totalDebit += parseFloat(line.debit) || 0;
                totalCredit += parseFloat(line.credit) || 0;
            });

            // Rounding to 2 decimal places to avoid floating point issues
            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                throw ApiError.badRequest(`Debits (${totalDebit}) must equal Credits (${totalCredit})`);
            }

            await client.query('BEGIN');

            const entryRes = await client.query(
                `INSERT INTO journal_entries (entry_date, reference_number, description, total_amount, created_by) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [date, reference || null, description, totalDebit, user_id]
            );
            const entryId = entryRes.rows[0].id;

            for (const line of lines) {
                await client.query(
                    `INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [entryId, line.account_id, parseFloat(line.debit) || 0, parseFloat(line.credit) || 0, line.description || null]
                );

                // For the mock, also insert into transactions log so it appears in standard ledger views
                const amount = (parseFloat(line.debit) || 0) > 0 ? parseFloat(line.debit) : parseFloat(line.credit);
                const debitAccount = (parseFloat(line.debit) || 0) > 0 ? line.account_name : null;
                const creditAccount = (parseFloat(line.credit) || 0) > 0 ? line.account_name : null;

                if (amount > 0) {
                    await client.query(
                        `INSERT INTO transactions (transaction_date, description, amount, debit_account_name, credit_account_name, type) 
                         VALUES ($1, $2, $3, $4, $5, 'journal')`,
                        [date, line.description || description, amount, debitAccount || 'Split', creditAccount || 'Split']
                    );
                }
            }

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Journal entry created successfully',
                data: entryRes.rows[0]
            });

        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    }
}

module.exports = AccountController;
