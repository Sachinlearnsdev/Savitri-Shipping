const { z } = require('zod');

// Public: create inquiry (guest or authenticated)
const createInquirySchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email'),
  customerPhone: z.string().min(10, 'Phone must be at least 10 digits'),
  boatId: z.string().min(1, 'Boat is required'),
  eventType: z.enum(['WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FAREWELL', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid event type' }),
  }),
  numberOfGuests: z.number().int().min(1, 'At least 1 guest required').optional(),
  preferredDate: z.string().optional(),
  preferredTimeSlot: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY']).optional(),
  locationType: z.enum(['HARBOR', 'CRUISE']).optional(),
  specialRequests: z.string().max(1000, 'Special requests must be under 1000 characters').optional(),
  budget: z.number().min(0).optional(),
  selectedAddOns: z.array(z.object({
    type: z.string(),
    quantity: z.number().int().min(1).optional(),
  })).optional(),
});

// Admin: send quote
const quoteInquirySchema = z.object({
  quotedAmount: z.number().min(0, 'Quoted amount must be positive'),
  quotedDetails: z.string().min(1, 'Quote details are required'),
});

// Public: customer responds to quote (accept/reject)
const respondInquirySchema = z.object({
  response: z.enum(['ACCEPTED', 'REJECTED'], {
    errorMap: () => ({ message: 'Response must be ACCEPTED or REJECTED' }),
  }),
});

// Query parameters for listing
const inquiryQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'EXPIRED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  boatId: z.string().optional(),
});

module.exports = {
  createInquirySchema,
  quoteInquirySchema,
  respondInquirySchema,
  inquiryQuerySchema,
};
