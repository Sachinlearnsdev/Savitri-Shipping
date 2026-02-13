// src/modules/publicStats/publicStats.routes.js
const express = require('express');
const router = express.Router();
const publicStatsController = require('./publicStats.controller');

// GET /api/public/stats - No auth required
router.get('/stats', publicStatsController.getStats);

// GET /api/public/content - No auth required (for promo banner, hero text, etc.)
router.get('/content', publicStatsController.getContentSettings);

module.exports = router;
