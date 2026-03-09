const express = require('express');
const router = express.Router();
const AccountController = require('../controllers/accountController');
const TransactionController = require('../controllers/transactionController');
const authenticate = require('../middlewares/auth');
const authorize = require('../middlewares/rbac');

router.use(authenticate);

// Chart of Accounts
router.get('/accounts', authorize('view_accounting'), AccountController.getAccounts);
router.post('/accounts', authorize('manage_accounting'), AccountController.createAccount);

// Journal Entries
router.post('/journals', authorize('manage_accounting'), AccountController.createJournalEntry);

// Transactions / General Ledger
router.get('/transactions', authorize('view_accounting'), TransactionController.getTransactions);
router.post('/transactions', authorize('manage_accounting'), TransactionController.createTransaction);

module.exports = router;
