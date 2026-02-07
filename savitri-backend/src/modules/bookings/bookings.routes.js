const express = require('express');
const router = express.Router();
const bookingsController = require('./bookings.controller');
const adminAuth = require('../../middleware/adminAuth');
const auth = require('../../middleware/auth');
const { roleCheck } = require('../../middleware/roleCheck');
const { validate, validateQuery } = require('../../middleware/validate');
const {
  availabilitySchema,
  priceCalcSchema,
  createBookingSchema,
  adminCreateBookingSchema,
  updateStatusSchema,
  markPaidSchema,
  cancelBookingSchema,
  bookingQuerySchema,
} = require('./bookings.validator');

// ===== ADMIN ROUTES =====
const adminRouter = express.Router();
adminRouter.use(adminAuth);

adminRouter.get('/', roleCheck('bookings', 'view'), validateQuery(bookingQuerySchema), bookingsController.getAll);
adminRouter.get('/:id', roleCheck('bookings', 'view'), bookingsController.getById);
adminRouter.post('/', roleCheck('bookings', 'create'), validate(adminCreateBookingSchema), bookingsController.adminCreate);
adminRouter.patch('/:id/status', roleCheck('bookings', 'edit'), validate(updateStatusSchema), bookingsController.updateStatus);
adminRouter.patch('/:id/payment', roleCheck('bookings', 'edit'), validate(markPaidSchema), bookingsController.markPaid);
adminRouter.post('/:id/cancel', roleCheck('bookings', 'cancel'), validate(cancelBookingSchema), bookingsController.adminCancel);

// ===== PUBLIC ROUTES =====
const publicRouter = express.Router();

// No auth required
publicRouter.get('/boats', bookingsController.getPublicBoats);
publicRouter.get('/boats/:id', bookingsController.getPublicBoatById);
publicRouter.get('/party-boats', bookingsController.getPublicPartyBoats);
publicRouter.get('/party-boats/:id', bookingsController.getPublicPartyBoatById);
publicRouter.get('/calendar-status', bookingsController.getCalendarStatus);
publicRouter.post('/check-availability', validate(availabilitySchema), bookingsController.checkAvailability);
publicRouter.post('/calculate-price', validate(priceCalcSchema), bookingsController.calculatePrice);
publicRouter.get('/available-slots', bookingsController.getAvailableSlots);

// Optional auth (guest booking with auto-account) - use auth middleware that doesn't throw
publicRouter.post('/create', (req, res, next) => {
  // Try to authenticate but don't fail if no token
  const authMiddleware = require('../../middleware/auth');
  authMiddleware(req, res, (err) => {
    // Ignore auth errors - allow guest bookings
    next();
  });
}, validate(createBookingSchema), bookingsController.createBooking);

// Auth required
publicRouter.get('/my-bookings', auth, bookingsController.getMyBookings);
publicRouter.post('/:id/cancel', auth, validate(cancelBookingSchema), bookingsController.cancelMyBooking);

module.exports = { adminRouter, publicRouter };
