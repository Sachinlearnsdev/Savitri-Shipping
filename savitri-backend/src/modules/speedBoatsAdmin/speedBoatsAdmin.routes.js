// src/modules/speedBoatBookingsAdmin/speedBoatBookingsAdmin.routes.js

const express = require('express');
const router = express.Router();
const speedBoatBookingsAdminController = require('./speedBoatBookingsAdmin.controller');
const { validate, validateQuery } = require('../../middleware/validate');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const {
  querySchema,
  availabilityQuerySchema,
  createAdminBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
} = require('./speedBoatBookingsAdmin.validator');

// All routes require admin authentication
router.use(adminAuth);

// Get all bookings
router.get(
  '/',
  roleCheck('bookings', 'view'),
  validateQuery(querySchema),
  speedBoatBookingsAdminController.getAll
);

// Get availability calendar for a boat
router.get(
  '/calendar/:id',
  roleCheck('bookings', 'view'),
  validateQuery(availabilityQuerySchema),
  speedBoatBookingsAdminController.getAvailabilityCalendar
);

// Get booking by ID
router.get(
  '/:id',
  roleCheck('bookings', 'view'),
  speedBoatBookingsAdminController.getById
);

// Create booking (on behalf of customer)
router.post(
  '/',
  roleCheck('bookings', 'create'),
  validate(createAdminBookingSchema),
  speedBoatBookingsAdminController.create
);

// Update booking
router.put(
  '/:id',
  roleCheck('bookings', 'edit'),
  validate(updateBookingSchema),
  speedBoatBookingsAdminController.update
);

// Cancel booking
router.post(
  '/:id/cancel',
  roleCheck('bookings', 'cancel'),
  validate(cancelBookingSchema),
  speedBoatBookingsAdminController.cancelBooking
);

module.exports = router;