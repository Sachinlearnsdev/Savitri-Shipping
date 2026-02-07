const { z } = require('zod');

const conditionsSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  specificDates: z.array(z.string()).optional(),
}).optional();

const createRuleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['PEAK_HOURS', 'OFF_PEAK_HOURS', 'WEEKEND', 'SEASONAL', 'HOLIDAY', 'SPECIAL']),
  adjustmentPercent: z.number(),
  priority: z.number().int().optional(),
  conditions: conditionsSchema,
  isActive: z.boolean().optional(),
});

const updateRuleSchema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(['PEAK_HOURS', 'OFF_PEAK_HOURS', 'WEEKEND', 'SEASONAL', 'HOLIDAY', 'SPECIAL']).optional(),
  adjustmentPercent: z.number().optional(),
  priority: z.number().int().optional(),
  conditions: conditionsSchema,
  isActive: z.boolean().optional(),
});

const ruleQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  type: z.enum(['PEAK_HOURS', 'OFF_PEAK_HOURS', 'WEEKEND', 'SEASONAL', 'HOLIDAY', 'SPECIAL']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

module.exports = {
  createRuleSchema,
  updateRuleSchema,
  ruleQuerySchema,
};
