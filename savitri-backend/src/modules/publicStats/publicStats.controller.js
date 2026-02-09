// src/modules/publicStats/publicStats.controller.js
const publicStatsService = require('./publicStats.service');
const ApiResponse = require('../../utils/ApiResponse');

class PublicStatsController {
  /**
   * GET /api/public/stats
   * Returns public website statistics (no auth required)
   */
  async getStats(req, res, next) {
    try {
      const stats = await publicStatsService.getStats();
      res.json(ApiResponse.success('Stats fetched successfully', stats));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PublicStatsController();
