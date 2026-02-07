const express = require('express');
const router = express.Router();
const partyBookingsController = require('./partyBookings.controller');
const adminAuth = require('../../middleware/adminAuth');
const { roleCheck } = require('../../middleware/roleCheck');
const { validate, validateQuery } = require('../../middleware/validate');
const {
  adminCreatePartyBookingSchema,
  updatePartyBookingStatusSchema,
  markPaidSchema,
  cancelPartyBookingSchema,
  partyBookingQuerySchema,
} = require('./partyBookings.validator');

// All routes require admin auth
router.use(adminAuth);

router.get('/', roleCheck('bookings', 'view'), validateQuery(partyBookingQuerySchema), partyBookingsController.getAll);
router.get('/:id', roleCheck('bookings', 'view'), partyBookingsController.getById);
router.post('/', roleCheck('bookings', 'create'), validate(adminCreatePartyBookingSchema), partyBookingsController.adminCreate);
router.patch('/:id/status', roleCheck('bookings', 'edit'), validate(updatePartyBookingStatusSchema), partyBookingsController.updateStatus);
router.patch('/:id/payment', roleCheck('bookings', 'edit'), validate(markPaidSchema), partyBookingsController.markPaid);
router.post('/:id/cancel', roleCheck('bookings', 'cancel'), validate(cancelPartyBookingSchema), partyBookingsController.adminCancel);

module.exports = router;
