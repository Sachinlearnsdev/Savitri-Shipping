// src/modules/speedBoatBookings/speedBoatBookings.routes.js

const express = require('express');
const router = express.Router();
const speedBoatBookingsController = require('./speedBoatBookings.controller');
const { validate, validateQuery } = require('../../middleware/validate');
const auth = require('../../middleware/auth');
const {
  querySchema,
  checkAvailabilitySchema,
  createBookingSchema,
  cancelBookingSchema,
} = require('./speedBoatBookings.validator');

// Check availability (optional auth - works for guests too)
router.post(
  '/speed-boats/:id/check-availability',
  validate(checkAvailabilitySchema),
  speedBoatBookingsController.checkAvailability
);

// Create booking (requires auth)
router.post(
  '/speed-boat-bookings',
  auth,
  validate(createBookingSchema),
  speedBoatBookingsController.createBooking
);

// Get my bookings (requires auth)
router.get(
  '/my-bookings/speed-boats',
  auth,
  validateQuery(querySchema),
  speedBoatBookingsController.getMyBookings
);

// Get single booking (requires auth)
router.get(
  '/my-bookings/speed-boats/:id',
  auth,
  speedBoatBookingsController.getBookingById
);

// Cancel booking (requires auth)
router.post(
  '/my-bookings/speed-boats/:id/cancel',
  auth,
  validate(cancelBookingSchema),
  speedBoatBookingsController.cancelBooking
);

module.exports = router;