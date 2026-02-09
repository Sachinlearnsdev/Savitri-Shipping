// src/modules/settings/settings.routes.js

const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const { validate } = require('../../middleware/validate');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { uploadSingleImage } = require('../../middleware/upload');
const {
  generalSettingsSchema,
  billingSettingsSchema,
  bookingSettingsSchema,
  notificationSettingsSchema,
  contentSettingsSchema,
} = require('./settings.validator');

// All routes require admin authentication
router.use(adminAuth);

// Get all settings
router.get(
  '/',
  roleCheck('settings', 'view'),
  settingsController.getAll
);

// Get settings by group
router.get(
  '/:group',
  roleCheck('settings', 'view'),
  settingsController.getByGroup
);

// Update settings by group (group validated in service)
router.put(
  '/:group',
  roleCheck('settings', 'edit'),
  settingsController.updateByGroup
);

// Upload company logo
router.post(
  '/logo',
  roleCheck('settings', 'edit'),
  uploadSingleImage,
  settingsController.uploadLogo
);

module.exports = router;