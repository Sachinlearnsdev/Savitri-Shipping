const { z } = require('zod');

const updateDaySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['OPEN', 'CLOSED']),
  reason: z.enum(['TIDE', 'WEATHER', 'MAINTENANCE', 'HOLIDAY', 'OTHER']).nullable().optional(),
  notes: z.string().optional(),
});

const bulkUpdateSchema = z.object({
  dates: z.array(z.object({
    date: z.string().min(1),
    status: z.enum(['OPEN', 'CLOSED']),
    reason: z.enum(['TIDE', 'WEATHER', 'MAINTENANCE', 'HOLIDAY', 'OTHER']).nullable().optional(),
    notes: z.string().optional(),
  })).min(1, 'At least one date is required'),
});

const calendarQuerySchema = z.object({
  month: z.string().optional(), // YYYY-MM format
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

module.exports = {
  updateDaySchema,
  bulkUpdateSchema,
  calendarQuerySchema,
};
