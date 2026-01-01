// src/modules/speedBoatBookings/speedBoatBookings.controller.js

const speedBoatBookingsService = require('./speedBoatBookings.service');
const ApiResponse = require('../../utils/ApiResponse');

class SpeedBoatBookingsController {
  /**
   * Check availability
   */
  async checkAvailability(req, res, next) {
    try {
      const result = await speedBoatBookingsService.checkAvailability(req.params.id, req.body);
      res.status(200).json(ApiResponse.success(result.message, result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create booking
   */
  async createBooking(req, res, next) {
    try {
      const booking = await speedBoatBookingsService.createBooking(req.body, req.user.userId);
      res.status(201).json(ApiResponse.created('Booking created successfully', booking));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my bookings
   */
  async getMyBookings(req, res, next) {
    try {
      const result = await speedBoatBookingsService.getMyBookings(req.user.userId, req.query);
      res.status(200).json(ApiResponse.paginated(
        result.bookings,
        result.pagination,
        'Bookings retrieved successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(req, res, next) {
    try {
      const booking = await speedBoatBookingsService.getBookingById(req.params.id, req.user.userId);
      res.status(200).json(ApiResponse.success('Booking retrieved successfully', booking));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(req, res, next) {
    try {
      const booking = await speedBoatBookingsService.cancelBooking(
        req.params.id,
        req.user.userId,
        req.body.cancellationReason
      );
      res.status(200).json(ApiResponse.success('Booking cancelled successfully', booking));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SpeedBoatBookingsController();