const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/roleController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

// All role routes require authentication and manage_roles permission
router.use(authenticate, authorize(['manage_roles', 'Super Admin']));

/**
 * @route   GET /api/roles
 * @desc    Get all available roles
 * @access  Private (manage_roles or Super Admin)
 */
router.get('/', RoleController.getRoles);

/**
 * @route   GET /api/roles/permissions
 * @desc    Get all system permissions grouped by module
 * @access  Private (manage_roles or Super Admin)
 */
router.get('/permissions', RoleController.getPermissions);

/**
 * @route   POST /api/roles
 * @desc    Create a new custom role with permissions
 * @access  Private (manage_roles or Super Admin)
 */
router.post('/', RoleController.createRole);

module.exports = router;
