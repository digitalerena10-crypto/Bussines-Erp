const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplierController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

// View suppliers
router.get('/', authorize('view_purchases'), SupplierController.getSuppliers);

// Manage suppliers
router.post('/', authorize('manage_purchases'), SupplierController.createSupplier);

module.exports = router;
