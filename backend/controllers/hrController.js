const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');

class HRController {
    /**
     * GET /api/hr/employees
     */
    static async getEmployees(req, res, next) {
        try {
            const result = await pool.query('SELECT * FROM employees ORDER BY created_at DESC');
            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/hr/attendance
     */
    static async getAttendance(req, res, next) {
        try {
            const result = await pool.query('SELECT * FROM attendance ORDER BY date DESC');
            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/hr/payroll
     */
    static async getPayroll(req, res, next) {
        try {
            const result = await pool.query('SELECT * FROM payroll ORDER BY month DESC');
            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/hr/employees
     */
    static async createEmployee(req, res, next) {
        try {
            const { first_name, last_name, email, designation, department, salary, join_date } = req.body;
            const query = `
        INSERT INTO employees (first_name, last_name, email, designation, department, salary, join_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `;
            const result = await pool.query(query, [first_name, last_name, email, designation, department, salary, join_date]);
            res.status(201).json({
                success: true,
                message: 'Employee created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = HRController;
