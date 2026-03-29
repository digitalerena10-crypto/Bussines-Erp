const logger = require('../utils/logger');
const { handleMockQuery } = require('../utils/mockDb');

/**
 * Middleware to capture system-wide audit logs
 * Captures all mutating actions (POST, PUT, DELETE)
 */
const auditLogger = async (req, res, next) => {
    // Only log mutating requests
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        // Capture the original res.json to log after successful execution
        const originalJson = res.json;

        res.json = function (data) {
            // Only log if the request was successful
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const user = req.user || { id: '0', email: 'system', name: 'System' };
                const action = req.method;
                const resource = req.originalUrl.split('/')[2] || 'System'; // e.g. /api/sales -> sales
                const details = JSON.stringify({
                    body: req.body,
                    params: req.params,
                    query: req.query,
                    message: data.message || 'Operation successful'
                });

                // Fire and forget audit log insertion
                const query = `INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES ($1, $2, $3, $4, $5)`;
                const params = [
                    user.id,
                    user.firstName ? `${user.firstName} ${user.lastName}` : (user.name || user.email),
                    action,
                    resource.charAt(0).toUpperCase() + resource.slice(1),
                    details
                ];

                handleMockQuery(query, params).catch(err => {
                    logger.error('Failed to save audit log', { error: err.message });
                });
            }

            return originalJson.apply(res, arguments);
        };
    }

    next();
};

module.exports = auditLogger;
