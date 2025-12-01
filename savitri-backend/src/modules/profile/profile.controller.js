// src/modules/profile/profile.controller.js

const profileService = require('./profile.service');
const ApiResponse = require('../../utils/ApiResponse');

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const profile = await profileService.getProfile(req.customerId);
      res.status(200).json(ApiResponse.success('Profile retrieved successfully', profile));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await profileService.updateProfile(req.customerId, req.body);
      res.status(200).json(ApiResponse.success('Profile updated successfully', profile));
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const profile = await profileService.uploadAvatar(req.customerId, req.file);
      res.status(200).json(ApiResponse.success('Avatar uploaded successfully', profile));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await profileService.changePassword(req.customerId, currentPassword, newPassword);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  async updateEmail(req, res, next) {
    try {
      const { email } = req.body;
      const result = await profileService.updateEmail(req.customerId, email);
      res.status(200).json(ApiResponse.success(result.message, { email: result.email }));
    } catch (error) {
      next(error);
    }
  }

  async verifyEmailChange(req, res, next) {
    try {
      const { email, otp } = req.body;
      const profile = await profileService.verifyEmailChange(req.customerId, email, otp);
      res.status(200).json(ApiResponse.success('Email updated successfully', profile));
    } catch (error) {
      next(error);
    }
  }

  async updatePhone(req, res, next) {
    try {
      const { phone } = req.body;
      const result = await profileService.updatePhone(req.customerId, phone);
      res.status(200).json(ApiResponse.success(result.message, { phone: result.phone }));
    } catch (error) {
      next(error);
    }
  }

  async verifyPhoneChange(req, res, next) {
    try {
      const { phone, otp } = req.body;
      const profile = await profileService.verifyPhoneChange(req.customerId, phone, otp);
      res.status(200).json(ApiResponse.success('Phone updated successfully', profile));
    } catch (error) {
      next(error);
    }
  }

  async updateNotificationPreferences(req, res, next) {
    try {
      const profile = await profileService.updateNotificationPreferences(req.customerId, req.body);
      res.status(200).json(ApiResponse.success('Preferences updated successfully', profile));
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req, res, next) {
    try {
      const sessions = await profileService.getSessions(req.customerId);
      res.status(200).json(ApiResponse.success('Sessions retrieved successfully', sessions));
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req, res, next) {
    try {
      const result = await profileService.deleteSession(req.customerId, req.params.sessionId);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  async deleteAllSessions(req, res, next) {
    try {
      const result = await profileService.deleteAllSessions(req.customerId);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  async getLoginHistory(req, res, next) {
    try {
      const history = await profileService.getLoginHistory(req.customerId);
      res.status(200).json(ApiResponse.success('Login history retrieved successfully', history));
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const result = await profileService.deleteAccount(req.customerId);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();