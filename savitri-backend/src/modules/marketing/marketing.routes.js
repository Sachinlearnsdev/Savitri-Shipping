const express = require('express');
const router = express.Router();
const marketingController = require('./marketing.controller');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { validate, validateQuery } = require('../../middleware/validate');
const { sendCampaignSchema, campaignQuerySchema } = require('./marketing.validator');

router.use(adminAuth);

router.get('/', roleCheck('marketing', 'view'), validateQuery(campaignQuerySchema), marketingController.getCampaigns);
router.get('/:id', roleCheck('marketing', 'view'), marketingController.getCampaignById);
router.post('/test', roleCheck('marketing', 'create'), validate(sendCampaignSchema), marketingController.sendTestEmail);
router.post('/send', roleCheck('marketing', 'create'), validate(sendCampaignSchema), marketingController.sendCampaign);

module.exports = router;
