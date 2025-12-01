// src/modules/auth/auth.controller.js

const authService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');
const { setTokenCookie, clearTokenCookie, getTokenFromRequest } = require('../../utils/jwt');

class AuthController {
  /**
   * Register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body, req);
      res.status(201).json(ApiResponse.created(result.message, result.customer));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req, res, next) {
    try {
      const { email, otp } = req.body;
      const result = await authService.verifyEmail(email, otp);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify phone
   */
  async verifyPhone(req, res, next) {
    try {
      const { phone, otp } = req.body;
      const result = await authService.verifyPhone(phone, otp);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login with email and password
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, req);
      
      setTokenCookie(res, result.token, false);
      
      res.status(200).json(ApiResponse.success('Login successful', {
        token: result.token,
        customer: result.customer,
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login with phone - Send OTP
   */
  async loginWithPhone(req, res, next) {
    try {
      const { phone } = req.body;
      const result = await authService.loginWithPhone(phone, req);
      res.status(200).json(ApiResponse.success(result.message, { phone: result.phone }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login with phone - Verify OTP
   */
  async verifyLoginOTP(req, res, next) {
    try {
      const { phone, otp } = req.body;
      const result = await authService.verifyLoginOTP(phone, otp, req);
      
      setTokenCookie(res, result.token, false);
      
      res.status(200).json(ApiResponse.success('Login successful', {
        token: result.token,
        customer: result.customer,
      }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout
   */
  async logout(req, res, next) {
    try {
      const token = getTokenFromRequest(req, false);
      const result = await authService.logout(req.customerId, token);
      
      clearTokenCookie(res, false);
      
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
      const result = await authService.forgotPassword(email);
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
      const result = await authService.resetPassword(email, otp, password);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(req, res, next) {
    try {
      const { identifier, type } = req.body;
      const result = await authService.resendOTP(identifier, type);
      res.status(200).json(ApiResponse.success(result.message));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();