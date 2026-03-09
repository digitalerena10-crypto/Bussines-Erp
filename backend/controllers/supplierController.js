const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { validateRequired, isValidEmail } = require('../utils/validators');

class SupplierController {
    /**
     * GET /api/suppliers
     */
    static async getSuppliers(req, res, next) {
        try {
            const { search } = req.query;

            let query = `
        SELECT 
          s.id, s.name, s.contact_person, s.email, s.phone, s.address, s.tax_id, s.is_active,
          b.name as branch_name
        FROM suppliers s
        LEFT JOIN branches b ON s.branch_id = b.id
        WHERE s.is_active = true
      `;
            const values = [];

            if (search) {
                query += ` AND (s.name ILIKE $1 OR s.email ILIKE $1 OR s.contact_person ILIKE $1)`;
                values.push(`%${search}%`);
            }

            query += ` ORDER BY s.name ASC`;

            const result = await pool.query(query, values);

            res.json({ success: true, count: result.rows.length, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/suppliers
     */
    static async createSupplier(req, res, next) {
        try {
            const { name, company_name, contact_person, email, phone, address, city, country, tax_id, payment_terms, notes, branch_id } = req.body;

            const required = validateRequired(req.body, ['name']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            if (email && !isValidEmail(email)) {
                throw ApiError.badRequest('Invalid email format');
            }

            const result = await pool.query(
                `INSERT INTO suppliers (name, company_name, contact_person, email, phone, address, city, country, tax_id, payment_terms, notes, branch_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         RETURNING *`,
                [name, company_name || null, contact_person || null, email || null, phone || null, address || null, city || null, country || null, tax_id || null, payment_terms || null, notes || null, branch_id || null]
            )

            res.status(201).json({
                success: true,
                message: 'Supplier created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            if (error.code === '23505') {
                next(ApiError.conflict('Supplier with this email or tax ID already exists'));
            } else {
                next(error);
            }
        }
    }
}

module.exports = SupplierController;
