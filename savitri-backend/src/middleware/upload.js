// src/middleware/upload.js

const multer = require("multer");
const ApiError = require("../utils/ApiError");

// ⭐ CHANGED: Use memory storage instead of disk storage
// This stores files in memory (as Buffer) so we can upload directly to Cloudinary
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed"
      ),
      false
    );
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        "Invalid file type. Only PDF, JPEG, JPG, and PNG files are allowed"
      ),
      false
    );
  }
};

// Upload middleware for single image
const uploadSingleImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFileFilter,
}).single("file");

// Upload middleware for multiple images
const uploadMultipleImages = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFileFilter,
}).array("files", 10); // Max 10 images

// Upload middleware for single document
const uploadSingleDocument = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
  },
  fileFilter: documentFileFilter,
}).single("file");

// Upload middleware for avatar
const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFileFilter,
}).single("avatar");

// ⭐ NEW: Generic upload functions for Cloudinary
const uploadSingle = (fieldName) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: imageFileFilter,
  }).single(fieldName);
};

const uploadMultiple = (fieldName, maxCount = 10) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: imageFileFilter,
  }).array(fieldName, maxCount);
};

// Error handling wrapper
const handleUploadError = (uploadFunction) => {
  return (req, res, next) => {
    uploadFunction(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(ApiError.badRequest("File size too large (max 5MB)"));
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return next(ApiError.badRequest("Too many files"));
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
  // Legacy exports (for backward compatibility)
  uploadSingleImage: handleUploadError(uploadSingleImage),
  uploadMultipleImages: handleUploadError(uploadMultipleImages),
  uploadSingleDocument: handleUploadError(uploadSingleDocument),
  uploadAvatar: handleUploadError(uploadAvatar),

  // ⭐ NEW: Generic exports for Cloudinary
  uploadSingle,
  uploadMultiple,
};
