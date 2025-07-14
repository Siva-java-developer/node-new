const express = require('express');
const router = express.Router();
const { getDashboardCounts } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/dashboard-counts', auth, getDashboardCounts);
router.get('/dashboard-counts/:month', auth, getDashboardCounts);

module.exports = router;
