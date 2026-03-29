const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

router.get('/sales-summary', authorize('view_reports'), ReportController.getSalesSummary);
router.get('/inventory-summary', authorize('view_reports'), ReportController.getInventorySummary);
router.get('/hr-summary', authorize('view_reports'), ReportController.getHRSummary);
router.get('/dashboard-stats', ReportController.getDashboardStats);

module.exports = router;
