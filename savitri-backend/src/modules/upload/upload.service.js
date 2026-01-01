// src/modules/upload/upload.service.js

const { uploadImage, uploadMultipleImages, deleteImage } = require('../../utils/cloudinary');
const ApiError = require('../../utils/ApiError');

class UploadService {
  /**
   * Upload single image
   */
  async uploadSingle(file, options = {}) {
    const { folder = 'general', alt = '' } = options;

    const result = await uploadImage(file.buffer, {
      folder: `savitri-shipping/${folder}`,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Max dimensions
        { quality: 'auto' }, // Auto quality
        { fetch_format: 'auto' }, // Auto format (WebP for modern browsers)
      ],
    });

    return {
      url: result.url,
      publicId: result.publicId,
      alt: alt || file.originalname,
    };
  }

  /**
   * Upload multiple images
   */
  async uploadMultiple(files, options = {}) {
    const { folder = 'general' } = options;

    const results = await uploadMultipleImages(files, {
      folder: `savitri-shipping/${folder}`,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    return results.map((result, index) => ({
      url: result.url,
      publicId: result.publicId,
      alt: files[index].originalname,
    }));
  }

  /**
   * Delete image
   */
  async deleteImage(publicId) {
    if (!publicId) {
      throw ApiError.badRequest('Public ID is required');
    }

    const result = await deleteImage(publicId);
    
    if (result.result !== 'ok') {
      throw ApiError.internal('Failed to delete image');
    }

    return result;
  }
}

module.exports = new UploadService();