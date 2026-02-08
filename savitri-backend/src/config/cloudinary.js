// src/config/cloudinary.js

const cloudinary = require('cloudinary').v2;
const config = require('./env');

const { cloudName, apiKey, apiSecret } = config.cloudinary;

if (!cloudName || cloudName === 'your_cloud_name') {
  console.warn('⚠️  WARNING: CLOUDINARY_CLOUD_NAME is not configured. Image uploads will fail.');
  console.warn('   Update CLOUDINARY_CLOUD_NAME in your .env file with your actual Cloudinary cloud name.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

module.exports = cloudinary;