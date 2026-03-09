const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

// View customers
router.get('/', authorize('view_sales'), CustomerController.getCustomers);

// Manage customers
router.post('/', authorize('manage_sales'), CustomerController.createCustomer);

module.exports = router;
