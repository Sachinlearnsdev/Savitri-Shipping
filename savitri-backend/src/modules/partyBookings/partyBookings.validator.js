const { z } = require('zod');

// Admin: create party booking
const adminCreatePartyBookingSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').optional(),
  customerEmail: z.string().email('Invalid email').optional(),
  customerPhone: z.string().optional(),
  boatId: z.string().min(1, 'Boat is required'),
  date: z.string().min(1, 'Date is required'),
  timeSlot: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'], {
    errorMap: () => ({ message: 'Invalid time slot' }),
  }),
  eventType: z.enum(['WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FAREWELL', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid event type' }),
  }),
  numberOfGuests: z.number().int().min(1, 'At least 1 guest required'),
  locationType: z.enum(['HARBOR', 'CRUISE'], {
    errorMap: () => ({ message: 'Invalid location type' }),
  }),
  selectedAddOns: z.array(z.object({
    type: z.string(),
    quantity: z.number().int().min(1).optional(),
  })).optional(),
  paymentMode: z.enum(['ONLINE', 'AT_VENUE']),
  adminNotes: z.string().optional(),
  adminOverrideAmount: z.number().min(0).optional(),
});

// Admin: update booking status
const updatePartyBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'NO_SHOW']),
});

// Admin: mark payment
const markPaidSchema = z.object({
  paymentMode: z.string().optional(),
});

// Cancel booking
const cancelPartyBookingSchema = z.object({
  reason: z.string().optional(),
});

// Admin booking query
const partyBookingQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'ADVANCE_PAID', 'PARTIALLY_REFUNDED', 'REFUNDED']).optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  boatId: z.string().optional(),
});

module.exports = {
  adminCreatePartyBookingSchema,
  updatePartyBookingStatusSchema,
  markPaidSchema,
  cancelPartyBookingSchema,
  partyBookingQuerySchema,
};
