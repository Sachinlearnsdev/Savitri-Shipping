const express = require('express');
const router = express.Router();
const speedBoatsController = require('./speedBoats.controller');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { validate, validateQuery } = require('../../middleware/validate');
const { uploadMultipleImages } = require('../../middleware/upload');
const { createBoatSchema, updateBoatSchema, boatQuerySchema } = require('./speedBoats.validator');

// All routes require admin auth
router.use(adminAuth);

router.get('/', roleCheck('speedBoats', 'view'), validateQuery(boatQuerySchema), speedBoatsController.getAll);
router.get('/:id', roleCheck('speedBoats', 'view'), speedBoatsController.getById);
router.post('/', roleCheck('speedBoats', 'create'), validate(createBoatSchema), speedBoatsController.create);
router.put('/:id', roleCheck('speedBoats', 'edit'), validate(updateBoatSchema), speedBoatsController.update);
router.delete('/:id', roleCheck('speedBoats', 'delete'), speedBoatsController.delete);
router.post('/:id/images', roleCheck('speedBoats', 'edit'), uploadMultipleImages, speedBoatsController.uploadImages);
router.delete('/:id/images', roleCheck('speedBoats', 'edit'), speedBoatsController.removeImage);
router.delete('/:id/images/:imageIndex', roleCheck('speedBoats', 'edit'), speedBoatsController.deleteImage);

module.exports = router;
