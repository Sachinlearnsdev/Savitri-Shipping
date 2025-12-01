// src/modules/adminUsers/adminUsers.controller.js

const adminUsersService = require('./adminUsers.service');
const ApiResponse = require('../../utils/ApiResponse');

class AdminUsersController {
  /**
   * Get all admin users
   */
  async getAll(req, res, next) {
    try {
      const result = await adminUsersService.getAll(req.query);
      res.status(200).json(ApiResponse.paginated(
        result.adminUsers,
        result.pagination,
        'Admin users retrieved successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admin user by ID
   */
  async getById(req, res, next) {
    try {
      const adminUser = await adminUsersService.getById(req.params.id);
      res.status(200).json(ApiResponse.success('Admin user retrieved successfully', adminUser));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create admin user
   */
  async create(req, res, next) {
    try {
      const adminUser = await adminUsersService.create(req.body);
      res.status(201).json(ApiResponse.created('Admin user created successfully', adminUser));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update admin user
   */
  async update(req, res, next) {
    try {
      const adminUser = await adminUsersService.update(req.params.id, req.body);
      res.status(200).json(ApiResponse.success('Admin user updated successfully', adminUser));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update admin user status
   */
  async updateStatus(req, res, next) {
    try {
      const adminUser = await adminUsersService.updateStatus(req.params.id, req.body.status);
      res.status(200).json(ApiResponse.success('Admin user status updated successfully', adminUser));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete admin user
   */
  async delete(req, res, next) {
    try {
      const result = await adminUsersService.delete(req.params.id);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admin user activity
   */
  async getActivity(req, res, next) {
    try {
      const result = await adminUsersService.getActivity(req.params.id, req.query);
      res.status(200).json(ApiResponse.paginated(
        result.activities,
        result.pagination,
        'Activity log retrieved successfully'
      ));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminUsersController();