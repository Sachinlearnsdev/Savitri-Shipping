// src/middleware/validate.js

const { z } = require('zod');
const ApiError = require('../utils/ApiError');
const { getValidationErrors } = require('../utils/validators');

/**
 * Validation middleware
 * @param {z.ZodSchema} schema - Zod validation schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = getValidationErrors(error);
        throw ApiError.unprocessableEntity('Validation failed', errors);
      }
      next(error);
    }
  };
};

/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = getValidationErrors(error);
        throw ApiError.unprocessableEntity('Query validation failed', errors);
      }
      next(error);
    }
  };
};

/**
 * Validate params
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = getValidationErrors(error);
        throw ApiError.unprocessableEntity('Params validation failed', errors);
      }
      next(error);
    }
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
};