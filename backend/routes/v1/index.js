const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);

module.exports = router;
