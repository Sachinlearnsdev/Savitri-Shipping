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
router.get('/export/csv', roleCheck('analytics', 'view'), analyticsController.exportCSV);
router.get('/export/pdf', roleCheck('analytics', 'view'), analyticsController.exportPDF);

module.exports = router;
