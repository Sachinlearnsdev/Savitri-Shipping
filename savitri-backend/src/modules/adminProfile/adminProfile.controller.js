// src/modules/adminProfile/adminProfile.controller.js

const adminProfileService = require('./adminProfile.service');
const ApiResponse = require('../../utils/ApiResponse');

class AdminProfileController {
  async getProfile(req, res, next) {
    try {
      const profile = await adminProfileService.getProfile(req.adminUserId);
      res.status(200).json(ApiResponse.success('Profile retrieved successfully', profile));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await adminProfileService.updateProfile(req.adminUserId, req.body);
      res.status(200).json(ApiResponse.success('Profile updated successfully', profile));
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const profile = await adminProfileService.uploadAvatar(req.adminUserId, req.file);
      res.status(200).json(ApiResponse.success('Avatar uploaded successfully', profile));
    } catch (error) {
      next(error);
    }
  }

  async removeAvatar(req, res, next) {
    try {
      const profile = await adminProfileService.removeAvatar(req.adminUserId);
      res.status(200).json(ApiResponse.success('Avatar removed successfully', profile));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await adminProfileService.changePassword(req.adminUserId, currentPassword, newPassword);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminProfileController();
