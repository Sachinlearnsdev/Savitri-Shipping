// src/modules/publicStats/publicStats.routes.js
const express = require('express');
const router = express.Router();
const publicStatsController = require('./publicStats.controller');

// GET /api/public/stats - No auth required
router.get('/stats', publicStatsController.getStats);

module.exports = router;
