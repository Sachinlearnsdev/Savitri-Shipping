// src/middleware/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/env');
const { FILE_UPLOAD } = require('../config/constants');
const ApiError = require('../utils/ApiError');

// Ensure upload directory exists
const uploadDir = config.uploadPath;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only JPEG, JPG, PNG, and WEBP images are allowed'), false);
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  if (FILE_UPLOAD.ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only PDF, JPEG, JPG, and PNG files are allowed'), false);
  }
};

// Upload middleware for single image
const uploadSingleImage = multer({
  storage: storage,
  limits: {
    fileSize: FILE_UPLOAD.MAX_IMAGE_SIZE,
  },
  fileFilter: imageFileFilter,
}).single('file');

// Upload middleware for multiple images
const uploadMultipleImages = multer({
  storage: storage,
  limits: {
    fileSize: FILE_UPLOAD.MAX_IMAGE_SIZE,
  },
  fileFilter: imageFileFilter,
}).array('files', 10); // Max 10 images

// Upload middleware for single document
const uploadSingleDocument = multer({
  storage: storage,
  limits: {
    fileSize: FILE_UPLOAD.MAX_DOCUMENT_SIZE,
  },
  fileFilter: documentFileFilter,
}).single('file');

// Upload middleware for avatar
const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: FILE_UPLOAD.MAX_IMAGE_SIZE,
  },
  fileFilter: imageFileFilter,
}).single('avatar');

// Error handling wrapper
const handleUploadError = (uploadFunction) => {
  return (req, res, next) => {
    uploadFunction(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(ApiError.badRequest('File size too large'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(ApiError.badRequest('Too many files'));
        }
        return next(ApiError.badRequest(err.message));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  uploadSingleImage: handleUploadError(uploadSingleImage),
  uploadMultipleImages: handleUploadError(uploadMultipleImages),
  uploadSingleDocument: handleUploadError(uploadSingleDocument),
  uploadAvatar: handleUploadError(uploadAvatar),
};