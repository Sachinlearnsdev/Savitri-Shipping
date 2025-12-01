// src/modules/settings/settings.controller.js

const settingsService = require('./settings.service');
const ApiResponse = require('../../utils/ApiResponse');

class SettingsController {
  /**
   * Get all settings
   */
  async getAll(req, res, next) {
    try {
      const settings = await settingsService.getAll();
      res.status(200).json(ApiResponse.success('Settings retrieved successfully', settings));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get settings by group
   */
  async getByGroup(req, res, next) {
    try {
      const { group } = req.params;
      const settings = await settingsService.getByGroup(group);
      res.status(200).json(ApiResponse.success(`${group} settings retrieved successfully`, settings));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update settings by group
   */
  async updateByGroup(req, res, next) {
    try {
      const { group } = req.params;
      const settings = await settingsService.updateByGroup(group, req.body);
      res.status(200).json(ApiResponse.success(`${group} settings updated successfully`, settings));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload company logo
   */
  async uploadLogo(req, res, next) {
    try {
      const result = await settingsService.uploadLogo(req.file);
      res.status(200).json(ApiResponse.success('Logo uploaded successfully', result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingsController();