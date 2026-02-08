const couponsService = require('./coupons.service');
const ApiResponse = require('../../utils/ApiResponse');

class CouponsController {
  async list(req, res, next) {
    try {
      const { coupons, pagination } = await couponsService.list(req.query);
      res.json(ApiResponse.paginated(coupons, pagination, 'Coupons retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const coupon = await couponsService.getById(req.params.id);
      res.json(ApiResponse.success('Coupon retrieved', coupon));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const coupon = await couponsService.create(req.body);
      res.status(201).json(ApiResponse.created('Coupon created', coupon));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const coupon = await couponsService.update(req.params.id, req.body);
      res.json(ApiResponse.success('Coupon updated', coupon));
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req, res, next) {
    try {
      const result = await couponsService.softDelete(req.params.id);
      res.json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req, res, next) {
    try {
      const coupon = await couponsService.toggleActive(req.params.id);
      res.json(ApiResponse.success('Coupon status toggled', coupon));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CouponsController();
