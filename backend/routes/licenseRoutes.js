const express = require('express');
const router = express.Router();
const LicenseController = require('../controllers/licenseController');

// No auth required — activation must work before login
router.post('/activate', LicenseController.activate);
router.post('/deactivate', LicenseController.deactivate);
router.get('/keys', LicenseController.getKeys);

module.exports = router;
