const { handleMockQuery } = require('../utils/mockDb');
const logger = require('../utils/logger');

const getSettings = async (req, res, next) => {
    try {
        const query = 'SELECT * FROM settings LIMIT 1';
        const result = await handleMockQuery(query);
        res.json({ success: true, data: result.rows ? result.rows[0] : (result[0] || {}) });
    } catch (err) {
        next(err);
    }
};

const updateSettings = async (req, res, next) => {
    try {
        const { company_name, company_email, company_phone, address, currency, timezone, logo_url } = req.body;
        // In mock mode, we just return success with the updated data
        logger.info('System settings updated', { user: req.user.id });
        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: { company_name, company_email, company_phone, address, currency, timezone, logo_url }
        });
    } catch (err) {
        next(err);
    }
};

const getAuditLogs = async (req, res, next) => {
    try {
        const query = 'SELECT al.*, u.full_name as user_name FROM audit_logs al JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 50';
        const result = await handleMockQuery(query);
        res.json({ success: true, data: result.rows || result });
    } catch (err) {
        next(err);
    }
};

const getSystemHealth = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: {
                status: 'Healthy',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                node_version: process.version,
                platform: process.platform,
                db_connection: 'Mock Active'
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getSettings,
    updateSettings,
    getAuditLogs,
    getSystemHealth
};
