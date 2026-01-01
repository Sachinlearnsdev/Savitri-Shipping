// src/modules/speedBoatBookingsAdmin/speedBoatBookingsAdmin.validator.js

const { z } = require('zod');

/**
 * Query schema for listing bookings
 */
const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  speedBoat: z.string().optional(),
  customer: z.string().optional(),
  bookingStatus: z.enum(['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

/**
 * Availability calendar query schema
 */
const availabilityQuerySchema = z.object({
  dateFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  dateTo: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
});

/**
 * Create admin booking schema
 */
const createAdminBookingSchema = z.object({
  speedBoat: z.string().min(1, 'Speed boat ID is required'),
  customer: z.string().min(1, 'Customer ID is required'),
  bookingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  duration: z.number().min(0.5).max(12).refine((val) => val % 0.5 === 0, {
    message: 'Duration must be in multiples of 0.5 hours (30 minutes)',
  }),
  passengers: z.number().int().min(1, 'At least 1 passenger is required'),
  paymentMethod: z.enum(['ONLINE', 'CASH', 'BANK_TRANSFER', 'UPI', 'CARD']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID']).default('PENDING'),
  transactionId: z.string().optional(),
  adminNotes: z.string().optional(),
});

/**
 * Update booking schema
 */
const updateBookingSchema = z.object({
  bookingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }).optional(),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: z.number().min(0.5).max(12).refine((val) => val % 0.5 === 0, {
    message: 'Duration must be in multiples of 0.5 hours (30 minutes)',
  }).optional(),
  passengers: z.number().int().min(1).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  paymentMethod: z.enum(['ONLINE', 'CASH', 'BANK_TRANSFER', 'UPI', 'CARD']).optional(),
  transactionId: z.string().optional(),
  bookingStatus: z.enum(['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  adminNotes: z.string().optional(),
});

/**
 * Cancel booking schema (admin)
 */
const cancelBookingSchema = z.object({
  cancellationReason: z.string().min(5, 'Cancellation reason must be at least 5 characters'),
  overrideRefund: z.boolean().optional(),
  refundPercentage: z.number().min(0).max(100).optional(),
});

module.exports = {
  querySchema,
  availabilityQuerySchema,
  createAdminBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
};