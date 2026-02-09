// src/modules/adminProfile/adminProfile.routes.js

const express = require('express');
const router = express.Router();
const adminProfileController = require('./adminProfile.controller');
const { validate } = require('../../middleware/validate');
const adminAuth = require('../../middleware/adminAuth');
const { uploadAvatar } = require('../../middleware/upload');
const {
  updateProfileSchema,
  changePasswordSchema,
} = require('./adminProfile.validator');

// All routes require admin authentication
router.use(adminAuth);

// Profile
router.get('/', adminProfileController.getProfile);
router.put('/', validate(updateProfileSchema), adminProfileController.updateProfile);

// Avatar
router.post('/avatar', uploadAvatar, adminProfileController.uploadAvatar);
router.delete('/avatar', adminProfileController.removeAvatar);

// Password
router.put('/password', validate(changePasswordSchema), adminProfileController.changePassword);

module.exports = router;
