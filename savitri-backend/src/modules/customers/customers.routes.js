// src/modules/customers/customers.routes.js

const express = require('express');
const router = express.Router();
const customersController = require('./customers.controller');
const { validate, validateQuery } = require('../../middleware/validate');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { querySchema, updateStatusSchema } = require('./customers.validator');

// All routes require admin authentication
router.use(adminAuth);

// Get all customers
router.get(
  '/',
  roleCheck('customers', 'view'),
  validateQuery(querySchema),
  customersController.getAll
);

// Get customer by ID
router.get(
  '/:id',
  roleCheck('customers', 'view'),
  customersController.getById
);

// Get customer bookings
router.get(
  '/:id/bookings',
  roleCheck('customers', 'view'),
  validateQuery(querySchema),
  customersController.getBookings
);

// Update customer status
router.patch(
  '/:id/status',
  roleCheck('customers', 'edit'),
  validate(updateStatusSchema),
  customersController.updateStatus
);

module.exports = router;