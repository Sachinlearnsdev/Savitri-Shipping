const bookingsService = require('./bookings.service');
const ApiResponse = require('../../utils/ApiResponse');

class BookingsController {
  // ===== ADMIN ENDPOINTS =====

  async getAll(req, res, next) {
    try {
      const { bookings, pagination } = await bookingsService.getAll(req.query);
      res.json(ApiResponse.paginated(bookings, pagination, 'Bookings retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const booking = await bookingsService.getById(req.params.id);
      res.json(ApiResponse.success('Booking retrieved', booking));
    } catch (error) {
      next(error);
    }
  }

  async adminCreate(req, res, next) {
    try {
      const booking = await bookingsService.adminCreateBooking(req.body, req.adminUserId);
      res.status(201).json(ApiResponse.created('Booking created', booking));
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const booking = await bookingsService.updateStatus(req.params.id, req.body.status);
      res.json(ApiResponse.success('Booking status updated', booking));
    } catch (error) {
      next(error);
    }
  }

  async markPaid(req, res, next) {
    try {
      const booking = await bookingsService.markPaid(req.params.id, req.body);
      res.json(ApiResponse.success('Payment recorded', booking));
    } catch (error) {
      next(error);
    }
  }

  async adminCancel(req, res, next) {
    try {
      const booking = await bookingsService.cancelBooking(
        req.params.id, req.body.reason, 'ADMIN'
      );
      res.json(ApiResponse.success('Booking cancelled', booking));
    } catch (error) {
      next(error);
    }
  }

  // ===== PUBLIC ENDPOINTS =====

  async checkAvailability(req, res, next) {
    try {
      const result = await bookingsService.checkAvailability(req.body);
      res.json(ApiResponse.success('Availability checked', result));
    } catch (error) {
      next(error);
    }
  }

  async calculatePrice(req, res, next) {
    try {
      const pricing = await bookingsService.calculatePrice(req.body);
      res.json(ApiResponse.success('Price calculated', pricing));
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSlots(req, res, next) {
    try {
      const { date, numberOfBoats } = req.query;
      const result = await bookingsService.getAvailableSlots(date, parseInt(numberOfBoats) || 1);
      res.json(ApiResponse.success('Available slots retrieved', result));
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req, res, next) {
    try {
      const customerId = req.customer ? req.customer.id : null;
      const booking = await bookingsService.createBooking(req.body, customerId);
      res.status(201).json(ApiResponse.created('Booking created', booking));
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req, res, next) {
    try {
      const { bookings, pagination } = await bookingsService.getCustomerBookings(
        req.customer.id, req.query
      );
      res.json(ApiResponse.paginated(bookings, pagination, 'Bookings retrieved'));
    } catch (error) {
      next(error);
    }
  }

  async cancelMyBooking(req, res, next) {
    try {
      // Verify the booking belongs to this customer
      const booking = await bookingsService.getById(req.params.id);
      const custId = booking.customerId?.id || booking.customerId;
      if (custId !== req.customer.id) {
        throw require('../../utils/ApiError').forbidden('Not your booking');
      }
      const result = await bookingsService.cancelBooking(
        req.params.id, req.body.reason, 'CUSTOMER'
      );
      res.json(ApiResponse.success('Booking cancelled', result));
    } catch (error) {
      next(error);
    }
  }

  async getPublicBoats(req, res, next) {
    try {
      const speedBoatsService = require('../speedBoats/speedBoats.service');
      const boats = await speedBoatsService.getActiveBoats();
      res.json(ApiResponse.success('Boats retrieved', boats));
    } catch (error) {
      next(error);
    }
  }

  async getPublicBoatById(req, res, next) {
    try {
      const speedBoatsService = require('../speedBoats/speedBoats.service');
      const boat = await speedBoatsService.getById(req.params.id);
      res.json(ApiResponse.success('Boat retrieved', boat));
    } catch (error) {
      next(error);
    }
  }

  async getPublicPartyBoats(req, res, next) {
    try {
      const partyBoatsService = require('../partyBoats/partyBoats.service');
      const boats = await partyBoatsService.getActiveBoats();
      res.json(ApiResponse.success('Party boats retrieved', boats));
    } catch (error) {
      next(error);
    }
  }

  async getPublicPartyBoatById(req, res, next) {
    try {
      const partyBoatsService = require('../partyBoats/partyBoats.service');
      const boat = await partyBoatsService.getById(req.params.id);
      res.json(ApiResponse.success('Party boat retrieved', boat));
    } catch (error) {
      next(error);
    }
  }

  async getCalendarStatus(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        throw require('../../utils/ApiError').badRequest('startDate and endDate are required');
      }
      const calendarService = require('../calendar/calendar.service');
      const statuses = await calendarService.getDateRangeStatus(startDate, endDate);
      res.json(ApiResponse.success('Calendar status retrieved', statuses));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingsController();
