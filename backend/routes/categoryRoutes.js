const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

// View categories
router.get('/', authorize('view_inventory'), CategoryController.getCategories);

// Manage categories
router.post('/', authorize('manage_inventory'), CategoryController.createCategory);
router.put('/:id', authorize('manage_inventory'), CategoryController.updateCategory);
router.delete('/:id', authorize('manage_inventory'), CategoryController.deleteCategory);

module.exports = router;
