const AuthService = require('../services/authService');
const { isValidEmail, isValidPassword, validateRequired } = require('../utils/validators');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// In-memory lockout mechanism
// Format: { 'email': { attempts: number, lockUntil: timestamp } }
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const checkLockout = (email) => {
    const attempt = loginAttempts.get(email);
    if (!attempt) return false;

    if (attempt.attempts >= MAX_ATTEMPTS) {
        if (Date.now() < attempt.lockUntil) {
            const minutesLeft = Math.ceil((attempt.lockUntil - Date.now()) / 60000);
            throw ApiError.tooMany(`Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`);
        } else {
            // Lockout expired, reset
            loginAttempts.delete(email);
            return false;
        }
    }
    return false;
};

const handleFailedAttempt = (email) => {
    const attempt = loginAttempts.get(email) || { attempts: 0, lockUntil: 0 };
    attempt.attempts += 1;

    if (attempt.attempts >= MAX_ATTEMPTS) {
        attempt.lockUntil = Date.now() + LOCKOUT_DURATION;
        logger.warn(`Account locked due to multiple failed login attempts`, { email });
    }

    loginAttempts.set(email, attempt);
};

const resetAttempts = (email) => {
    loginAttempts.delete(email);
};

class AuthController {

    /**
     * POST /api/auth/login
     */
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw ApiError.badRequest('Email and password are required');
            }

            // Check account lockout
            checkLockout(email);

            try {
                const result = await AuthService.login(email, password);

                // Success: Reset attempts
                resetAttempts(email);

                res.json({
                    success: true,
                    message: 'Login successful',
                    data: result
                });
            } catch (error) {
                // Only log failed attempt for invalid credentials, not for completely failing DB
                if (error.statusCode === 401 && error.message.includes('Invalid')) {
                    handleFailedAttempt(email);
                }
                throw error;
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/register
     * Only accessible by Super Admin or Admin (enforced by RBAC route middleware)
     */
    static async register(req, res, next) {
        try {
            const { email, password, firstName, lastName, roleId, branchId } = req.body;

            // Validate inputs
            const required = validateRequired(req.body, ['email', 'password', 'firstName', 'lastName']);
            if (!required.valid) {
                throw ApiError.badRequest(`Missing required fields: ${required.missing.join(', ')}`);
            }

            if (!isValidEmail(email)) {
                throw ApiError.badRequest('Invalid email format');
            }

            if (!isValidPassword(password)) {
                throw ApiError.badRequest('Password must be at least 8 characters long');
            }

            const newUser = await AuthService.registerUser(req.body);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: newUser
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/refresh
     */
    static async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                throw ApiError.badRequest('Refresh token is required');
            }

            const tokens = await AuthService.refreshToken(refreshToken);

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: tokens
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/logout
     */
    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (refreshToken) {
                AuthService.logout(refreshToken);
            }

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/auth/me
     */
    static async getMe(req, res, next) {
        try {
            // req.user is populated by the auth middleware
            res.json({
                success: true,
                data: req.user
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
