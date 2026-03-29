const express = require('express');
const router = express.Router();
const HRController = require('../controllers/hrController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

// All HR routes require authentication
router.use(authenticate);

router.get('/employees', authorize('view_hr'), HRController.getEmployees);
router.post('/employees', authorize('manage_hr'), HRController.createEmployee);
router.get('/attendance', authorize('view_hr'), HRController.getAttendance);
router.get('/payroll', authorize('view_hr'), HRController.getPayroll);

module.exports = router;
