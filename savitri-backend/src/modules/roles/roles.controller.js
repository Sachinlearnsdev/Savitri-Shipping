// src/modules/roles/roles.controller.js

const rolesService = require('./roles.service');
const ApiResponse = require('../../utils/ApiResponse');

class RolesController {
  /**
   * Get all roles
   */
  async getAll(req, res, next) {
    try {
      const roles = await rolesService.getAll();
      res.status(200).json(ApiResponse.success('Roles retrieved successfully', roles));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get role by ID
   */
  async getById(req, res, next) {
    try {
      const role = await rolesService.getById(req.params.id);
      res.status(200).json(ApiResponse.success('Role retrieved successfully', role));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create role
   */
  async create(req, res, next) {
    try {
      const role = await rolesService.create(req.body);
      res.status(201).json(ApiResponse.created('Role created successfully', role));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update role
   */
  async update(req, res, next) {
    try {
      const role = await rolesService.update(req.params.id, req.body);
      res.status(200).json(ApiResponse.success('Role updated successfully', role));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete role
   */
  async delete(req, res, next) {
    try {
      const result = await rolesService.delete(req.params.id);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RolesController();