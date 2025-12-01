// src/modules/savedVehicles/savedVehicles.controller.js

const savedVehiclesService = require('./savedVehicles.service');
const ApiResponse = require('../../utils/ApiResponse');

class SavedVehiclesController {
  async getAll(req, res, next) {
    try {
      const vehicles = await savedVehiclesService.getAll(req.customerId);
      res.status(200).json(ApiResponse.success('Saved vehicles retrieved successfully', vehicles));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const vehicle = await savedVehiclesService.getById(req.customerId, req.params.id);
      res.status(200).json(ApiResponse.success('Vehicle retrieved successfully', vehicle));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const vehicle = await savedVehiclesService.create(req.customerId, req.body);
      res.status(201).json(ApiResponse.created('Vehicle saved successfully', vehicle));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const vehicle = await savedVehiclesService.update(req.customerId, req.params.id, req.body);
      res.status(200).json(ApiResponse.success('Vehicle updated successfully', vehicle));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await savedVehiclesService.delete(req.customerId, req.params.id);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SavedVehiclesController();