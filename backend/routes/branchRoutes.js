const express = require('express');
const router = express.Router();
const BranchController = require('../controllers/branchController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

// Need authentication to view branches
router.get('/', authenticate, BranchController.getBranches);

// Need manage_branches to create a branch
router.post('/', authenticate, authorize('manage_branches'), BranchController.createBranch);

module.exports = router;
