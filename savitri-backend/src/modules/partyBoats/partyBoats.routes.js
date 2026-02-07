const express = require('express');
const router = express.Router();
const partyBoatsController = require('./partyBoats.controller');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { validate, validateQuery } = require('../../middleware/validate');
const { uploadMultipleImages } = require('../../middleware/upload');
const { createPartyBoatSchema, updatePartyBoatSchema, partyBoatQuerySchema } = require('./partyBoats.validator');

// All routes require admin auth
router.use(adminAuth);

router.get('/', roleCheck('partyBoats', 'view'), validateQuery(partyBoatQuerySchema), partyBoatsController.getAll);
router.get('/:id', roleCheck('partyBoats', 'view'), partyBoatsController.getById);
router.post('/', roleCheck('partyBoats', 'create'), validate(createPartyBoatSchema), partyBoatsController.create);
router.put('/:id', roleCheck('partyBoats', 'edit'), validate(updatePartyBoatSchema), partyBoatsController.update);
router.delete('/:id', roleCheck('partyBoats', 'delete'), partyBoatsController.delete);
router.post('/:id/images', roleCheck('partyBoats', 'edit'), uploadMultipleImages, partyBoatsController.uploadImages);
router.delete('/:id/images', roleCheck('partyBoats', 'edit'), partyBoatsController.removeImage);

module.exports = router;
