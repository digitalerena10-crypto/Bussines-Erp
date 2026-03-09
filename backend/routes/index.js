const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const branchRoutes = require('./branchRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const customerRoutes = require('./customerRoutes');
const salesRoutes = require('./salesRoutes');
const supplierRoutes = require('./supplierRoutes');
const purchaseRoutes = require('./purchaseRoutes');
const accountRoutes = require('./accountingRoutes');
const hrRoutes = require('./hrRoutes');
const reportRoutes = require('./reportRoutes');
const fileRoutes = require('./fileRoutes');
const adminRoutes = require('./adminRoutes');

// Mount routes
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/branches', branchRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/customers', customerRoutes);
router.use('/sales', salesRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/accounts', accountRoutes);
router.use('/hr', hrRoutes);
router.use('/reports', reportRoutes);
router.use('/files', fileRoutes);
router.use('/admin', adminRoutes);

// Placeholder routes — will be implemented in subsequent phases
// router.use('/hr', hrRoutes);             // Phase 10
// router.use('/reports', reportRoutes);    // Phase 11

module.exports = router;
