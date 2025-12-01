// src/modules/roles/roles.routes.js

const express = require('express');
const router = express.Router();
const rolesController = require('./roles.controller');
const { validate } = require('../../middleware/validate');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { createRoleSchema, updateRoleSchema } = require('./roles.validator');

// All routes require admin authentication
router.use(adminAuth);

// Get all roles
router.get(
  '/',
  roleCheck('roles', 'view'),
  rolesController.getAll
);

// Get role by ID
router.get(
  '/:id',
  roleCheck('roles', 'view'),
  rolesController.getById
);

// Create role
router.post(
  '/',
  roleCheck('roles', 'create'),
  validate(createRoleSchema),
  rolesController.create
);

// Update role
router.put(
  '/:id',
  roleCheck('roles', 'edit'),
  validate(updateRoleSchema),
  rolesController.update
);

// Delete role
router.delete(
  '/:id',
  roleCheck('roles', 'delete'),
  rolesController.delete
);

module.exports = router;