const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * JWT Authentication Middleware
 * Verifies the JWT token from the Authorization header
 * and attaches the decoded user to req.user
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('Access token is required');
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, env.jwt.secret);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(ApiError.unauthorized('Token has expired'));
        }
        if (err.name === 'JsonWebTokenError') {
            return next(ApiError.unauthorized('Invalid token'));
        }
        next(err);
    }
};

module.exports = authenticate;
