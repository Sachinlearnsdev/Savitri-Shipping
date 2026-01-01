// src/modules/speedBoats/speedBoats.routes.js

const express = require('express');
const router = express.Router();
const speedBoatsController = require('./speedBoats.controller');
const { validateQuery } = require('../../middleware/validate');
const { querySchema } = require('./speedBoats.validator');

// Get all active speed boats (public)
router.get(
  '/',
  validateQuery(querySchema),
  speedBoatsController.getAll
);

// Get speed boat by ID (public)
router.get(
  '/:id',
  speedBoatsController.getById
);

module.exports = router;