const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

// View inventory levels
router.get('/', authorize('view_inventory'), InventoryController.getInventory);

// Record stock movements (in/out/adjustments)
router.post('/movement', authorize('manage_inventory'), InventoryController.recordMovement);

module.exports = router;
