// src/modules/upload/upload.routes.js

const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller');
const { uploadSingle, uploadMultiple } = require('../../middleware/upload');
const adminAuth = require('../../middleware/adminAuth');
const auth = require('../../middleware/auth');

// Admin upload single image
router.post(
  '/admin/single',
  adminAuth,
  uploadSingle('image'),
  uploadController.uploadSingle
);

// Admin upload multiple images
router.post(
  '/admin/multiple',
  adminAuth,
  uploadMultiple('images', 10),
  uploadController.uploadMultiple
);

// Customer upload single image (profile picture)
router.post(
  '/customer/single',
  auth,
  uploadSingle('image'),
  uploadController.uploadSingle
);

// Delete image
router.delete(
  '/delete',
  adminAuth,
  uploadController.deleteImage
);

module.exports = router;