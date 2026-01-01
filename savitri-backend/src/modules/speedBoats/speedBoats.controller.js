// src/modules/speedBoats/speedBoats.controller.js

const speedBoatsService = require('./speedBoats.service');
const ApiResponse = require('../../utils/ApiResponse');

class SpeedBoatsController {
  /**
   * Get all active speed boats
   */
  async getAll(req, res, next) {
    try {
      const result = await speedBoatsService.getAll(req.query);
      res.status(200).json(ApiResponse.paginated(
        result.speedBoats,
        result.pagination,
        'Speed boats retrieved successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get speed boat by ID
   */
  async getById(req, res, next) {
    try {
      const speedBoat = await speedBoatsService.getById(req.params.id);
      res.status(200).json(ApiResponse.success('Speed boat retrieved successfully', speedBoat));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SpeedBoatsController();