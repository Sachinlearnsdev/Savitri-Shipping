const { z } = require('zod');

// Public: check availability
const availabilitySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.number().min(0.5, 'Duration must be at least 0.5 hours'),
  numberOfBoats: z.number().int().min(1, 'At least 1 boat required'),
});

// Public: calculate price
const priceCalcSchema = z.object({
  date: z.string().min(1),
  startTime: z.string().min(1),
  duration: z.number().min(0.5),
  numberOfBoats: z.number().int().min(1),
});

// Public: create booking (customer)
const createBookingSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.number().min(0.5, 'Duration must be at least 0.5 hours'),
  numberOfBoats: z.number().int().min(1, 'At least 1 boat required'),
  customerNotes: z.string().optional(),
  paymentMode: z.enum(['ONLINE', 'AT_VENUE']),
  // For auto-account creation (guest booking)
  customerName: z.string().min(2).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
});

// Admin: create booking
const adminCreateBookingSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  duration: z.number().min(0.5),
  numberOfBoats: z.number().int().min(1),
  paymentMode: z.enum(['ONLINE', 'AT_VENUE']),
  adminNotes: z.string().optional(),
  adminOverrideAmount: z.number().min(0).optional(),
});

// Admin: update booking status
const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'COMPLETED', 'NO_SHOW']),
});

// Admin: mark payment
const markPaidSchema = z.object({
  paymentMode: z.string().optional(),
});

// Cancel booking
const cancelBookingSchema = z.object({
  reason: z.string().optional(),
});

// Admin booking query
const bookingQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED']).optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

module.exports = {
  availabilitySchema,
  priceCalcSchema,
  createBookingSchema,
  adminCreateBookingSchema,
  updateStatusSchema,
  markPaidSchema,
  cancelBookingSchema,
  bookingQuerySchema,
};
