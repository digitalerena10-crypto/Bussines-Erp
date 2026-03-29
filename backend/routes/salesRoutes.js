const express = require('express');
const router = express.Router();
const SalesOrderController = require('../controllers/salesOrderController');
const InvoiceController = require('../controllers/invoiceController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

// View sales orders
router.get('/orders', authorize('view_sales'), SalesOrderController.getOrders);
router.get('/orders/:id', authorize('view_sales'), SalesOrderController.getOrderById);

// Manage sales orders
router.post('/orders', authorize('manage_sales'), SalesOrderController.createOrder);
router.put('/orders/:id', authorize('manage_sales'), SalesOrderController.updateOrder);

// Invoices
router.get('/invoices', authorize('view_sales'), InvoiceController.getInvoices);
router.post('/invoices', authorize('manage_sales'), InvoiceController.createInvoice);

module.exports = router;
