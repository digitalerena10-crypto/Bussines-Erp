const { pool } = require('../config/db');

class ReportController {
    /**
     * GET /api/reports/sales-summary
     */
    static async getSalesSummary(req, res, next) {
        try {
            const { month } = req.query;
            const params = [];
            let sql = 'SELECT * FROM sales_trends';

            if (month) {
                sql += ' WHERE month = $1';
                params.push(month);
            }

            const result = await pool.query(sql, params);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reports/inventory-summary
     */
    static async getInventorySummary(req, res, next) {
        try {
            const { category } = req.query;
            const params = [];
            let sql = 'SELECT * FROM inventory_summaries';

            if (category) {
                sql += ' WHERE category = $1';
                params.push(category);
            }

            const result = await pool.query(sql, params);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reports/hr-summary
     */
    static async getHRSummary(req, res, next) {
        try {
            const result = await pool.query('SELECT department, COUNT(*) as count, SUM(salary) as total_salary FROM employees GROUP BY department');
            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/reports/dashboard-stats
     */
    static async getDashboardStats(req, res, next) {
        try {
            // we'll simulate aggregation from multiple tables
            // in a real db this would be specialized queries or a view
            const revenueRes = await pool.query('SELECT SUM(total_amount) as total FROM sales_orders WHERE status = \'Completed\'');
            const salesRes = await pool.query('SELECT COUNT(*) as count FROM sales_orders');
            const productRes = await pool.query('SELECT COUNT(*) as count FROM products');
            const employeeRes = await pool.query('SELECT COUNT(*) as count FROM employees');
            const lowStockRes = await pool.query('SELECT p.name, i.quantity, p.min_stock_level FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.quantity <= p.min_stock_level ORDER BY i.quantity ASC LIMIT 5');

            const stats = [
                {
                    title: 'Total Revenue',
                    value: parseFloat(revenueRes.rows[0].total || 0),
                    change: '+12.5%',
                    trend: 'up',
                    isCurrency: true
                },
                {
                    title: 'Total Sales',
                    value: parseInt(salesRes.rows[0].count || 0),
                    change: '+8.2%',
                    trend: 'up'
                },
                {
                    title: 'Products',
                    value: parseInt(productRes.rows[0].count || 0),
                    change: '-2.1%',
                    trend: 'down'
                },
                {
                    title: 'Employees',
                    value: parseInt(employeeRes.rows[0].count || 0),
                    change: '+4.3%',
                    trend: 'up'
                },
                {
                    title: 'Critical Stock',
                    value: lowStockRes.rows.length,
                    details: lowStockRes.rows
                }
            ];

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReportController;
