const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

// All user management routes require manage_users permission
router.use(authenticate, authorize('manage_users'));

router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);

module.exports = router;
