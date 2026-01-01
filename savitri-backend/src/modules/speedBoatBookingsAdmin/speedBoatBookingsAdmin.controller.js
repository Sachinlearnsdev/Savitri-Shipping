// src/modules/speedBoatsAdmin/speedBoatsAdmin.controller.js

const speedBoatsAdminService = require('./speedBoatsAdmin.service');
const ApiResponse = require('../../utils/ApiResponse');

class SpeedBoatsAdminController {
  /**
   * Get all speed boats
   */
  async getAll(req, res, next) {
    try {
      const result = await speedBoatsAdminService.getAll(req.query);
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
      const speedBoat = await speedBoatsAdminService.getById(req.params.id);
      res.status(200).json(ApiResponse.success('Speed boat retrieved successfully', speedBoat));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create speed boat
   */
  async create(req, res, next) {
    try {
      const speedBoat = await speedBoatsAdminService.create(req.body, req.user.userId);
      res.status(201).json(ApiResponse.created('Speed boat created successfully', speedBoat));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update speed boat
   */
  async update(req, res, next) {
    try {
      const speedBoat = await speedBoatsAdminService.update(req.params.id, req.body, req.user.userId);
      res.status(200).json(ApiResponse.success('Speed boat updated successfully', speedBoat));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete speed boat
   */
  async delete(req, res, next) {
    try {
      const speedBoat = await speedBoatsAdminService.delete(req.params.id);
      res.status(200).json(ApiResponse.success('Speed boat deleted successfully', speedBoat));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SpeedBoatsAdminController();