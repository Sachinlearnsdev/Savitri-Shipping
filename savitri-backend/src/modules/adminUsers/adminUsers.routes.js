// src/modules/adminUsers/adminUsers.routes.js

const express = require('express');
const router = express.Router();
const adminUsersController = require('./adminUsers.controller');
const { validate, validateQuery } = require('../../middleware/validate');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck, isSuperAdmin } = require('../../middleware/roleCheck');
const {
  createAdminUserSchema,
  updateAdminUserSchema,
  updateStatusSchema,
  querySchema,
} = require('./adminUsers.validator');

// All routes require admin authentication
router.use(adminAuth);

// Get all admin users
router.get(
  '/',
  roleCheck('adminUsers', 'view'),
  validateQuery(querySchema),
  adminUsersController.getAll
);

// Get admin user by ID
router.get(
  '/:id',
  roleCheck('adminUsers', 'view'),
  adminUsersController.getById
);

// Create admin user (Super Admin only)
router.post(
  '/',
  isSuperAdmin,
  validate(createAdminUserSchema),
  adminUsersController.create
);

// Update admin user
router.put(
  '/:id',
  roleCheck('adminUsers', 'edit'),
  validate(updateAdminUserSchema),
  adminUsersController.update
);

// Update admin user status
router.patch(
  '/:id/status',
  roleCheck('adminUsers', 'edit'),
  validate(updateStatusSchema),
  adminUsersController.updateStatus
);

// Delete admin user (Super Admin only)
router.delete(
  '/:id',
  isSuperAdmin,
  adminUsersController.delete
);

// Get admin user activity log
router.get(
  '/:id/activity',
  roleCheck('adminUsers', 'view'),
  validateQuery(querySchema),
  adminUsersController.getActivity
);

module.exports = router;