const { z } = require('zod');

const createCouponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code must be at most 20 characters'),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().min(0, 'Discount value must be at least 0'),
  minOrderAmount: z.number().min(0, 'Min order amount must be at least 0').optional(),
  maxDiscountAmount: z.number().min(0, 'Max discount amount must be at least 0').optional(),
  validFrom: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format for validFrom' }),
  validTo: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format for validTo' }),
  usageLimit: z.number().min(0, 'Usage limit must be at least 0').optional(),
  applicableTo: z.enum(['ALL', 'SPEED_BOAT', 'PARTY_BOAT']).optional().default('ALL'),
});

const updateCouponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code must be at most 20 characters').optional(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  discountValue: z.number().min(0, 'Discount value must be at least 0').optional(),
  minOrderAmount: z.number().min(0, 'Min order amount must be at least 0').optional(),
  maxDiscountAmount: z.number().min(0, 'Max discount amount must be at least 0').optional(),
  validFrom: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format for validFrom' }).optional(),
  validTo: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format for validTo' }).optional(),
  usageLimit: z.number().min(0, 'Usage limit must be at least 0').optional(),
  applicableTo: z.enum(['ALL', 'SPEED_BOAT', 'PARTY_BOAT']).optional(),
});

const couponQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().optional(),
  applicableTo: z.enum(['ALL', 'SPEED_BOAT', 'PARTY_BOAT']).optional(),
});

module.exports = {
  createCouponSchema,
  updateCouponSchema,
  couponQuerySchema,
};
