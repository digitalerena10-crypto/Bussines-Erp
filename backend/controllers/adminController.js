const { handleMockQuery } = require('../utils/mockDb');
const logger = require('../utils/logger');

// In-memory settings store (persists across requests within the same server session)
let settingsStore = {
    company_name: 'ERP Corp',
    company_email: 'admin@erpcorp.com',
    company_phone: '+1 (555) 123-4567',
    address: '123 Tech Avenue, SP',
    currency: 'USD',
    timezone: 'UTC',
    logo_url: null
};

const getSettings = async (req, res, next) => {
    try {
        res.json({ success: true, data: settingsStore });
    } catch (err) {
        next(err);
    }
};

const updateSettings = async (req, res, next) => {
    try {
        const { company_name, company_email, company_phone, address, currency, timezone, logo_url } = req.body;
        // Persist to in-memory store
        if (company_name !== undefined) settingsStore.company_name = company_name;
        if (company_email !== undefined) settingsStore.company_email = company_email;
        if (company_phone !== undefined) settingsStore.company_phone = company_phone;
        if (address !== undefined) settingsStore.address = address;
        if (currency !== undefined) settingsStore.currency = currency;
        if (timezone !== undefined) settingsStore.timezone = timezone;
        if (logo_url !== undefined) settingsStore.logo_url = logo_url;

        logger.info('System settings updated', { user: req.user.id, settings: settingsStore });
        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settingsStore
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

