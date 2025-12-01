// src/modules/adminAuth/adminAuth.controller.js

const adminAuthService = require('./adminAuth.service');
const ApiResponse = require('../../utils/ApiResponse');
const { setTokenCookie, clearTokenCookie, getTokenFromRequest } = require('../../utils/jwt');

class AdminAuthController {
  /**
   * Admin login - Step 1
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await adminAuthService.login(email, password, req);
      res.status(200).json(ApiResponse.success(result.message, { email: result.email }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin login - Step 2: Verify OTP
   */
  async verifyOTP(req, res, next) {
    try {
      const { email, otp } = req.body;
      const result = await adminAuthService.verifyOTP(email, otp, req);
      
      // Set token in cookie
      setTokenCookie(res, result.token, true);
      
      res.status(200).json(ApiResponse.success('Login successful', {
        token: result.token,
        user: result.user,
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin logout
   */
  async logout(req, res, next) {
    try {
      const token = getTokenFromRequest(req, true);
      const result = await adminAuthService.logout(req.adminUserId, token, req);
      
      // Clear cookie
      clearTokenCookie(res, true);
      
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await adminAuthService.forgotPassword(email);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res, next) {
    try {
      const { email, otp, password } = req.body;
      const result = await adminAuthService.resetPassword(email, otp, password);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(req, res, next) {
    try {
      const result = await adminAuthService.refreshToken(req.adminUserId);
      setTokenCookie(res, result.token, true);
      res.status(200).json(ApiResponse.success('Token refreshed', { token: result.token }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current admin user
   */
  async me(req, res, next) {
    try {
      res.status(200).json(ApiResponse.success('Admin user retrieved', req.adminUser));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminAuthController();