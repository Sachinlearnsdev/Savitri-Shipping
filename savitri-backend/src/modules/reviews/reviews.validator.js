const { z } = require('zod');

const createReviewSchema = z.object({
  reviewType: z.enum(['COMPANY', 'SPEED_BOAT', 'PARTY_BOAT']),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000, 'Comment must be at most 1000 characters').optional(),
  customerName: z.string().min(1, 'Customer name is required').trim(),
  boatId: z.string().optional(),
});

const approveReviewSchema = z.object({
  approved: z.boolean(),
});

const publicReviewQuerySchema = z.object({
  type: z.enum(['COMPANY', 'SPEED_BOAT', 'PARTY_BOAT']).optional(),
  boatId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const adminReviewQuerySchema = z.object({
  type: z.string().optional(),
  boatId: z.string().optional(),
  isApproved: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  createReviewSchema,
  approveReviewSchema,
  publicReviewQuerySchema,
  adminReviewQuerySchema,
};
