const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');

router.use(adminAuth);

router.get('/overview', roleCheck('analytics', 'view'), analyticsController.getOverview);
router.get('/revenue', roleCheck('analytics', 'view'), analyticsController.getRevenueChart);
router.get('/bookings', roleCheck('analytics', 'view'), analyticsController.getBookingStats);
router.get('/top-boats', roleCheck('analytics', 'view'), analyticsController.getTopBoats);

module.exports = router;
