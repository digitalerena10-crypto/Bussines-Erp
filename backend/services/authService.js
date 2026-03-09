const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AuthModel = require('../models/authModel');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// Store refresh tokens (In production, use Redis. For Phase 1-3, using memory map)
// Format: { 'refresh_token_string': { userId: 'uuid', expires: 'date' } }
const refreshTokens = new Map();

class AuthService {
    /**
     * Generate Access and Refresh JWTs
     */
    static generateTokens(user, permissions) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role_name,
            permissions: permissions,
            branchId: user.branch_id
        };

        const accessToken = jwt.sign(payload, env.jwt.secret, {
            expiresIn: env.jwt.expiry
        });

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            env.jwt.refreshSecret,
            { expiresIn: env.jwt.refreshExpiry }
        );

        // Track refresh token
        const expiresMs = env.jwt.refreshExpiry.endsWith('d')
            ? parseInt(env.jwt.refreshExpiry) * 24 * 60 * 60 * 1000
            : 7 * 24 * 60 * 60 * 1000; // default 7 days

        refreshTokens.set(refreshToken, {
            userId: user.id,
            expires: Date.now() + expiresMs
        });

        return { accessToken, refreshToken };
    }

    /**
     * Authenticate a user and return tokens
     */
    static async login(email, password) {
        const user = await AuthModel.findUserByEmail(email);

        if (!user) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        if (!user.is_active) {
            throw ApiError.forbidden('Your account has been deactivated. Contact an administrator.');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw ApiError.unauthorized('Invalid email or password');
        }

        // Get role permissions
        let permissions = [];
        if (user.role_id) {
            permissions = await AuthModel.getRolePermissions(user.role_id);
        }

        // Update last login (fire and forget)
        AuthModel.updateLastLogin(user.id).catch(err =>
            logger.error('Failed to update last login', { error: err.message, userId: user.id })
        );

        const tokens = this.generateTokens(user, permissions);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role_name,
                branchId: user.branch_id
            },
            tokens
        };
    }

    /**
     * Register a new user (Only callable by Admins)
     */
    static async registerUser(userData) {
        const existingUser = await AuthModel.findUserByEmail(userData.email);
        if (existingUser) {
            throw ApiError.conflict('User with this email already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userData.password, salt);

        const newUser = await AuthModel.createUser({
            ...userData,
            passwordHash
        });

        return newUser;
    }

    /**
     * Refresh an access token using a valid refresh token
     */
    static async refreshToken(oldRefreshToken) {
        if (!oldRefreshToken || !refreshTokens.has(oldRefreshToken)) {
            throw ApiError.unauthorized('Invalid or expired refresh token');
        }

        const tokenData = refreshTokens.get(oldRefreshToken);
        if (Date.now() > tokenData.expires) {
            refreshTokens.delete(oldRefreshToken);
            throw ApiError.unauthorized('Refresh token has expired. Please login again.');
        }

        try {
            const decoded = jwt.verify(oldRefreshToken, env.jwt.refreshSecret);
            const user = await AuthModel.findUserById(decoded.id);

            if (!user || !user.is_active) {
                refreshTokens.delete(oldRefreshToken);
                throw ApiError.unauthorized('User no longer exists or is deactivated');
            }

            // We need user's full details (with role name) for the new access token payload structure
            const fullUser = await AuthModel.findUserByEmail(user.email);
            let permissions = [];
            if (fullUser.role_id) {
                permissions = await AuthModel.getRolePermissions(fullUser.role_id);
            }

            // Generate new token pair
            const tokens = this.generateTokens(fullUser, permissions);

            // Invalidate old refresh token
            refreshTokens.delete(oldRefreshToken);

            return tokens;
        } catch (error) {
            refreshTokens.delete(oldRefreshToken);
            throw ApiError.unauthorized('Invalid refresh token');
        }
    }

    /**
     * Logout user by invalidating refresh token
     */
    static logout(refreshToken) {
        if (refreshToken && refreshTokens.has(refreshToken)) {
            refreshTokens.delete(refreshToken);
        }
        return true;
    }
}

module.exports = AuthService;
