// src/modules/savedVehicles/savedVehicles.routes.js

const express = require('express');
const router = express.Router();
const savedVehiclesController = require('./savedVehicles.controller');
const { validate } = require('../../middleware/validate');
const auth = require('../../middleware/auth');
const { createVehicleSchema, updateVehicleSchema } = require('./savedVehicles.validator');

// All routes require authentication
router.use(auth);

router.get('/', savedVehiclesController.getAll);
router.get('/:id', savedVehiclesController.getById);
router.post('/', validate(createVehicleSchema), savedVehiclesController.create);
router.put('/:id', validate(updateVehicleSchema), savedVehiclesController.update);
router.delete('/:id', savedVehiclesController.delete);

module.exports = router;