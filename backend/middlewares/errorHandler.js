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

    // Check if error is a Database error (pg codes or missing relations)
    const isDbError = err.code || err.routine || (err.message && err.message.toLowerCase().includes('relation'));
    const isGetRequest = req.method === 'GET';

    // Safe fallback: If DB fails on a GET request, return empty array instead of crashing
    if (isDbError && isGetRequest && statusCode >= 500) {
        return res.status(200).json({
            success: false,
            message: 'Database unavailable or table missing. Safe fallback to empty list.',
            data: [],
            count: 0,
            originalError: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Build standard response
    const response = {
        success: false,
        message: isOperational ? err.message : (isDbError ? 'Database error occurred' : 'Internal server error'),
        ...(err.details && { details: err.details }),
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && !isOperational) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
