const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

// View products
router.get('/', authorize('view_inventory'), ProductController.getProducts);
router.get('/:id', authorize('view_inventory'), ProductController.getProductById);

// Manage products
router.post('/', authorize('manage_inventory'), ProductController.createProduct);
router.put('/:id', authorize('manage_inventory'), ProductController.updateProduct);
router.delete('/:id', authorize('manage_inventory'), ProductController.deleteProduct);

module.exports = router;
