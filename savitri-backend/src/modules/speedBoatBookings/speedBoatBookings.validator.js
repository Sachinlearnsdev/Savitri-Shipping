// src/modules/speedBoatBookings/speedBoatBookings.validator.js

const { z } = require('zod');

/**
 * Query schema for listing bookings
 */
const querySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['all', 'upcoming', 'past', 'cancelled']).optional(),
});

/**
 * Check availability schema
 */
const checkAvailabilitySchema = z.object({
  bookingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  duration: z.number().min(0.5, 'Duration must be at least 0.5 hours').max(12),
});

/**
 * Create booking schema
 */
const createBookingSchema = z.object({
  speedBoat: z.string().min(1, 'Speed boat ID is required'),
  bookingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  duration: z.number().min(0.5).max(12).refine((val) => val % 0.5 === 0, {
    message: 'Duration must be in multiples of 0.5 hours (30 minutes)',
  }),
  passengers: z.number().int().min(1, 'At least 1 passenger is required'),
  customerNotes: z.string().optional(),
});

/**
 * Cancel booking schema
 */
const cancelBookingSchema = z.object({
  cancellationReason: z.string().min(5, 'Cancellation reason must be at least 5 characters'),
});

module.exports = {
  querySchema,
  checkAvailabilitySchema,
  createBookingSchema,
  cancelBookingSchema,
};