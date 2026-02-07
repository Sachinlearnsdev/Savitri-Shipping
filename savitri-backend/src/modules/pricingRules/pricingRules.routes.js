const express = require('express');
const router = express.Router();
const pricingRulesController = require('./pricingRules.controller');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { validate, validateQuery } = require('../../middleware/validate');
const { createRuleSchema, updateRuleSchema, ruleQuerySchema } = require('./pricingRules.validator');

router.use(adminAuth);

router.get('/', roleCheck('pricingRules', 'view'), validateQuery(ruleQuerySchema), pricingRulesController.getAll);
router.get('/:id', roleCheck('pricingRules', 'view'), pricingRulesController.getById);
router.post('/', roleCheck('pricingRules', 'create'), validate(createRuleSchema), pricingRulesController.create);
router.put('/:id', roleCheck('pricingRules', 'edit'), validate(updateRuleSchema), pricingRulesController.update);
router.delete('/:id', roleCheck('pricingRules', 'delete'), pricingRulesController.delete);

module.exports = router;
