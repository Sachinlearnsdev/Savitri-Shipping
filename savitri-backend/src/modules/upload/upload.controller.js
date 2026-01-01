// src/modules/upload/upload.controller.js

const uploadService = require('./upload.service');
const ApiResponse = require('../../utils/ApiResponse');

class UploadController {
  /**
   * Upload single image
   */
  async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
      }

      const result = await uploadService.uploadSingle(req.file, req.body);
      res.status(200).json(ApiResponse.success('Image uploaded successfully', result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json(ApiResponse.error('No files uploaded'));
      }

      const result = await uploadService.uploadMultiple(req.files, req.body);
      res.status(200).json(ApiResponse.success('Images uploaded successfully', result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete image
   */
  async deleteImage(req, res, next) {
    try {
      await uploadService.deleteImage(req.body.publicId);
      res.status(200).json(ApiResponse.success('Image deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadController();