const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', authLimiter, AuthController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Admin/Super Admin only)
 * @access  Private (manage_users permission)
 */
router.post('/register', authenticate, authorize('manage_users'), AuthController.register);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires valid refresh token in body)
 */
router.post('/refresh', AuthController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & invalidate refresh token
 * @access  Public (optional client cleanup)
 */
router.post('/logout', AuthController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user details
 * @access  Private
 */
router.get('/me', authenticate, AuthController.getMe);

module.exports = router;
