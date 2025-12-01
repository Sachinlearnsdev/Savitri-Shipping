// src/modules/adminAuth/adminAuth.routes.js

const express = require('express');
const router = express.Router();
const adminAuthController = require('./adminAuth.controller');
const { validate } = require('../../middleware/validate');
const adminAuth = require('../../middleware/adminAuth');
const { authLimiter, otpLimiter, passwordResetLimiter } = require('../../middleware/rateLimiter');
const {
  loginSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('./adminAuth.validator');

// Public routes
router.post('/login', authLimiter, validate(loginSchema), adminAuthController.login);
router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), adminAuthController.verifyOTP);
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordSchema), adminAuthController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate(resetPasswordSchema), adminAuthController.resetPassword);

// Protected routes
router.post('/logout', adminAuth, adminAuthController.logout);
router.post('/refresh-token', adminAuth, adminAuthController.refreshToken);
router.get('/me', adminAuth, adminAuthController.me);

module.exports = router;