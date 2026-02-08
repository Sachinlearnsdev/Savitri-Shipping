const { z } = require('zod');

const sendCampaignSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  body: z.string().min(1, 'Email body is required'),
  testEmail: z.string().email().optional(),
});

const campaignQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  sendCampaignSchema,
  campaignQuerySchema,
};
