const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Catches all errors and returns a consistent JSON response
 */
const errorHandler = (err, req, res, _next) => {
    // Default to 500 if no status code set
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;

    // Log the error
    if (statusCode >= 500) {
        logger.error(`[${req.method}] ${req.originalUrl} — ${err.message}`, {
            stack: err.stack,
            body: req.body,
            ip: req.ip,
        });
    } else {
        logger.warn(`[${req.method}] ${req.originalUrl} — ${statusCode} ${err.message}`);
    }

    // Build response
    const response = {
        success: false,
        message: isOperational ? err.message : 'Internal server error',
        ...(err.details && { details: err.details }),
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && !isOperational) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
