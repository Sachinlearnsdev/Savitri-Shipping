// src/modules/publicStats/publicStats.controller.js
const publicStatsService = require('./publicStats.service');
const ApiResponse = require('../../utils/ApiResponse');
const settingsService = require('../settings/settings.service');
const { SETTINGS_GROUPS } = require('../../config/constants');

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

  /**
   * GET /api/public/content
   * Returns public content settings (hero text, promo banner, contact info - no auth required)
   */
  async getContentSettings(req, res, next) {
    try {
      const content = await settingsService.getByGroup(SETTINGS_GROUPS.CONTENT);
      res.json(ApiResponse.success('Content settings fetched successfully', content));
    } catch (error) {
      // Return empty object if no content settings exist yet
      if (error.statusCode === 404) {
        return res.json(ApiResponse.success('Content settings fetched successfully', {}));
      }
      next(error);
    }
  }
}

module.exports = new PublicStatsController();
