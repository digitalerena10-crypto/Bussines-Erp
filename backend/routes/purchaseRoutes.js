const express = require('express');
const router = express.Router();
const PurchaseOrderController = require('../controllers/purchaseOrderController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

// View purchase orders
router.get('/orders', authorize('view_purchases'), PurchaseOrderController.getOrders);
router.get('/orders/:id', authorize('view_purchases'), PurchaseOrderController.getOrderById);

// Manage purchase orders
router.post('/orders', authorize('manage_purchases'), PurchaseOrderController.createOrder);
router.post('/grn', authorize('manage_purchases'), PurchaseOrderController.createGRN);

module.exports = router;
