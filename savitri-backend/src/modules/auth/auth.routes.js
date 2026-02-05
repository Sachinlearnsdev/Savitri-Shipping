// src/modules/auth/auth.routes.js

const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const auth = require('../../middleware/auth');
const { authLimiter, otpLimiter, passwordResetLimiter } = require('../../middleware/rateLimiter');
const {
  registerSchema,
  verifyEmailSchema,
  verifyPhoneSchema,
  loginSchema,
  // PHASE 2: Phone Login validators
  // loginPhoneSchema,
  // verifyLoginOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOTPSchema,
} = require('./auth.validator');

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/verify-email', otpLimiter, validate(verifyEmailSchema), authController.verifyEmail);
router.post('/verify-phone', otpLimiter, validate(verifyPhoneSchema), authController.verifyPhone);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
// PHASE 2: Phone Login - Requires SMS Integration
// router.post('/login-phone', authLimiter, validate(loginPhoneSchema), authController.loginWithPhone);
// router.post('/verify-login-otp', authLimiter, validate(verifyLoginOTPSchema), authController.verifyLoginOTP);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/resend-otp', otpLimiter, validate(resendOTPSchema), authController.resendOTP);

// Protected routes
router.post('/logout', auth, authController.logout);

module.exports = router;