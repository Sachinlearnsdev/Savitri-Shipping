const marketingService = require('./marketing.service');
const ApiResponse = require('../../utils/ApiResponse');

const marketingController = {
  getCampaigns: async (req, res, next) => {
    try {
      const result = await marketingService.getCampaigns(req.query);
      res.json(ApiResponse.paginated(result.items, result.pagination, 'Campaigns retrieved'));
    } catch (error) {
      next(error);
    }
  },

  getCampaignById: async (req, res, next) => {
    try {
      const result = await marketingService.getCampaignById(req.params.id);
      res.json(ApiResponse.success('Campaign retrieved', result));
    } catch (error) {
      next(error);
    }
  },

  sendTestEmail: async (req, res, next) => {
    try {
      const result = await marketingService.sendTestEmail(req.body);
      res.json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  },

  sendCampaign: async (req, res, next) => {
    try {
      const result = await marketingService.sendCampaign(req.body, req.adminUser._id);
      res.json(ApiResponse.success('Campaign sent successfully', result));
    } catch (error) {
      next(error);
    }
  },
};

module.exports = marketingController;
