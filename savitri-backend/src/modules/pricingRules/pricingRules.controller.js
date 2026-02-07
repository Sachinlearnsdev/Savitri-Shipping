const pricingRulesService = require('./pricingRules.service');
const ApiResponse = require('../../utils/ApiResponse');

class PricingRulesController {
  async getAll(req, res, next) {
    try {
      const { rules, pagination } = await pricingRulesService.getAll(req.query);
      res.json(ApiResponse.paginated(rules, pagination, 'Pricing rules retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const rule = await pricingRulesService.getById(req.params.id);
      res.json(ApiResponse.success('Pricing rule retrieved', rule));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const rule = await pricingRulesService.create(req.body);
      res.status(201).json(ApiResponse.created('Pricing rule created', rule));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const rule = await pricingRulesService.update(req.params.id, req.body);
      res.json(ApiResponse.success('Pricing rule updated', rule));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await pricingRulesService.delete(req.params.id);
      res.json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PricingRulesController();
