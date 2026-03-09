const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

// All admin routes require authentication and super admin role
router.use(authenticate);
router.use(authorize('Super Admin'));

router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/health', adminController.getSystemHealth);

module.exports = router;
