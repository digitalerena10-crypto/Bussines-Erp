const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired, isValidEmail } = require('../utils/validators');

class CustomerController {
    /**
     * GET /api/customers
     */
    static async getCustomers(req, res, next) {
        try {
            const { search } = req.query;

            let query = `
        SELECT 
          c.id, c.name, c.email, c.phone, c.address, c.tax_id, c.is_active,
          b.name as branch_name
        FROM customers c
        LEFT JOIN branches b ON c.branch_id = b.id
        WHERE c.is_active = true
      `;
            const values = [];

            if (search) {
                query += ` AND (c.name ILIKE $1 OR c.email ILIKE $1 OR c.phone ILIKE $1)`;
                values.push(`%${search}%`);
            }

            query += ` ORDER BY c.name ASC`;

            const result = await pool.query(query, values);

            res.json({ success: true, count: result.rows.length, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/customers
     */
    static async createCustomer(req, res, next) {
        try {
            const { name, email, phone, address, tax_id, branch_id } = req.body;

            const required = validateRequired(req.body, ['name']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            if (email && !isValidEmail(email)) {
                throw ApiError.badRequest('Invalid email format');
            }

            const result = await pool.query(
                `INSERT INTO customers (name, email, phone, address, tax_id, branch_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
                [name, email || null, phone || null, address || null, tax_id || null, branch_id || null]
            );

            res.status(201).json({
                success: true,
                message: 'Customer created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            if (error.code === '23505') {
                next(ApiError.conflict('Customer with this email or tax ID already exists'));
            } else {
                next(error);
            }
        }
    }
}

module.exports = CustomerController;
