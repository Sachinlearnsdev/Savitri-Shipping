// src/modules/speedBoatsAdmin/speedBoatsAdmin.routes.js

const express = require('express');
const router = express.Router();
const speedBoatsAdminController = require('./speedBoatsAdmin.controller');
const { validate, validateQuery } = require('../../middleware/validate');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { 
  querySchema, 
  createSpeedBoatSchema, 
  updateSpeedBoatSchema 
} = require('./speedBoatsAdmin.validator');

// All routes require admin authentication
router.use(adminAuth);

// Get all speed boats
router.get(
  '/',
  roleCheck('speedBoats', 'view'),
  validateQuery(querySchema),
  speedBoatsAdminController.getAll
);

// Get speed boat by ID
router.get(
  '/:id',
  roleCheck('speedBoats', 'view'),
  speedBoatsAdminController.getById
);

// Create speed boat
router.post(
  '/',
  roleCheck('speedBoats', 'create'),
  validate(createSpeedBoatSchema),
  speedBoatsAdminController.create
);

// Update speed boat
router.put(
  '/:id',
  roleCheck('speedBoats', 'edit'),
  validate(updateSpeedBoatSchema),
  speedBoatsAdminController.update
);

// Delete speed boat
router.delete(
  '/:id',
  roleCheck('speedBoats', 'delete'),
  speedBoatsAdminController.delete
);

module.exports = router;