const analyticsService = require('./analytics.service');
const ApiResponse = require('../../utils/ApiResponse');

const analyticsController = {
  getOverview: async (req, res, next) => {
    try {
      const result = await analyticsService.getOverview(req.query.period);
      res.json(ApiResponse.success('Overview retrieved', result));
    } catch (error) {
      next(error);
    }
  },

  getRevenueChart: async (req, res, next) => {
    try {
      const result = await analyticsService.getRevenueChart(req.query.period);
      res.json(ApiResponse.success('Revenue data retrieved', result));
    } catch (error) {
      next(error);
    }
  },

  getBookingStats: async (req, res, next) => {
    try {
      const result = await analyticsService.getBookingStats(req.query.period);
      res.json(ApiResponse.success('Booking stats retrieved', result));
    } catch (error) {
      next(error);
    }
  },

  getTopBoats: async (req, res, next) => {
    try {
      const result = await analyticsService.getTopBoats(req.query.period);
      res.json(ApiResponse.success('Top boats retrieved', result));
    } catch (error) {
      next(error);
    }
  },
};

module.exports = analyticsController;
