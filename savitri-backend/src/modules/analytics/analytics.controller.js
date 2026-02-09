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

  exportCSV: async (req, res, next) => {
    try {
      const data = await analyticsService.getExportData(req.query.period);
      const csv = analyticsService.generateCSV(data);

      const filename = `savitri-analytics-${req.query.period || '30d'}-${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  },

  exportPDF: async (req, res, next) => {
    try {
      const data = await analyticsService.getExportData(req.query.period);
      const html = analyticsService.generatePrintHTML(data);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = analyticsController;
