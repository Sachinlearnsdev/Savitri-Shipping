const partyBookingsService = require('./partyBookings.service');
const ApiResponse = require('../../utils/ApiResponse');

class PartyBookingsController {
  async getAll(req, res, next) {
    try {
      const { bookings, pagination } = await partyBookingsService.getAll(req.query);
      res.json(ApiResponse.paginated(bookings, pagination, 'Party bookings retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const booking = await partyBookingsService.getById(req.params.id);
      res.json(ApiResponse.success('Party booking retrieved', booking));
    } catch (error) {
      next(error);
    }
  }

  async adminCreate(req, res, next) {
    try {
      const booking = await partyBookingsService.adminCreateBooking(req.body, req.adminUserId);
      res.status(201).json(ApiResponse.created('Party booking created', booking));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const booking = await partyBookingsService.updateStatus(req.params.id, req.body.status);
      res.json(ApiResponse.success('Booking status updated', booking));
    } catch (error) {
      next(error);
    }
  }

  async markPaid(req, res, next) {
    try {
      const booking = await partyBookingsService.markPaid(req.params.id, req.body);
      res.json(ApiResponse.success('Payment recorded', booking));
    } catch (error) {
      next(error);
    }
  }

  async adminCancel(req, res, next) {
    try {
      const booking = await partyBookingsService.cancelBooking(
        req.params.id, req.body.reason, 'ADMIN'
      );
      res.json(ApiResponse.success('Booking cancelled', booking));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PartyBookingsController();
