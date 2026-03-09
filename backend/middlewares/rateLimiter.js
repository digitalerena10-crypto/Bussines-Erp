const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 1000, // Increased for dashboard polling
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.',
    },
});

/**
 * Stricter rate limiter for auth endpoints
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
});

module.exports = { apiLimiter, authLimiter };
