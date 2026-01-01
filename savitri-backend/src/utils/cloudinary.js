// src/utils/cloudinary.js

const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - Image buffer from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Cloudinary response with URL
 */
const uploadImage = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      folder = 'savitri-shipping',
      resourceType = 'image',
      transformation = [],
    } = options;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        transformation,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes,
          });
        }
      }
    );

    const readableStream = Readable.from(fileBuffer);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Upload multiple images
 */
const uploadMultipleImages = async (files, options = {}) => {
  const uploadPromises = files.map(file => uploadImage(file.buffer, options));
  return Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

/**
 * Delete multiple images
 */
const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    throw error;
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
};