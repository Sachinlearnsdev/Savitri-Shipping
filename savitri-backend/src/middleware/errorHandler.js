// src/middleware/errorHandler.js

const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If it's not an ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message);
  }

  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    });
  }

  // Send error response
  const response = {
    success: false,
    message: error.message,
  };

  // Add errors array if present
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Add stack trace in development
  if (config.nodeEnv === 'development') {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;