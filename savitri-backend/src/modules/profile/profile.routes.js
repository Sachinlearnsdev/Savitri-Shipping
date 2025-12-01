// src/modules/profile/profile.routes.js

const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');
const { validate } = require('../../middleware/validate');
const auth = require('../../middleware/auth');
const { uploadAvatar } = require('../../middleware/upload');
const { otpLimiter, uploadLimiter } = require('../../middleware/rateLimiter');
const {
  updateProfileSchema,
  changePasswordSchema,
  updateEmailSchema,
  verifyEmailChangeSchema,
  updatePhoneSchema,
  verifyPhoneChangeSchema,
  updateNotificationPreferencesSchema,
} = require('./profile.validator');

// All routes require authentication
router.use(auth);

// Profile
router.get('/', profileController.getProfile);
router.put('/', validate(updateProfileSchema), profileController.updateProfile);
router.post('/avatar', uploadLimiter, uploadAvatar, profileController.uploadAvatar);

// Password
router.post('/change-password', validate(changePasswordSchema), profileController.changePassword);

// Email
router.post('/update-email', otpLimiter, validate(updateEmailSchema), profileController.updateEmail);
router.post('/verify-email-change', otpLimiter, profileController.verifyEmailChange);

// Phone
router.post('/update-phone', otpLimiter, validate(updatePhoneSchema), profileController.updatePhone);
router.post('/verify-phone-change', otpLimiter, profileController.verifyPhoneChange);

// Notifications
router.patch('/notifications', validate(updateNotificationPreferencesSchema), profileController.updateNotificationPreferences);

// Sessions
router.get('/sessions', profileController.getSessions);
router.delete('/sessions/:sessionId', profileController.deleteSession);
router.delete('/sessions', profileController.deleteAllSessions);

// Login history
router.get('/login-history', profileController.getLoginHistory);

// Delete account
router.delete('/', profileController.deleteAccount);

module.exports = router;