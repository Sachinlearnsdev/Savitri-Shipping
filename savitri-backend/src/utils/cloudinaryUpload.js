// src/utils/cloudinaryUpload.js

const cloudinary = require('../config/cloudinary');

/**
 * Upload a single file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer memory storage
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'savitri-shipping') => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      return reject(new Error('No file buffer provided'));
    }

    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );

      stream.on('error', (err) => {
        reject(err);
      });

      stream.end(fileBuffer);
    } catch (err) {
      reject(new Error(`Cloudinary upload failed: ${err.message}`));
    }
  });
};

/**
 * Delete a single image from Cloudinary by public ID
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Cloudinary destroy result
 */
const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Upload multiple file buffers to Cloudinary
 * @param {Array<{buffer: Buffer}>} files - Array of multer file objects
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array<{url: string, publicId: string}>>}
 */
const uploadMultipleToCloudinary = async (files, folder = 'savitri-shipping') => {
  return Promise.all(files.map(file => uploadToCloudinary(file.buffer, folder)));
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, uploadMultipleToCloudinary };
