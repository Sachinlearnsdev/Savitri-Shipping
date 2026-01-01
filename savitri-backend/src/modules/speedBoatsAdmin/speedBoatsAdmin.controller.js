// src/modules/speedBoatBookingsAdmin/speedBoatBookingsAdmin.controller.js

const speedBoatBookingsAdminService = require('./speedBoatBookingsAdmin.service');
const ApiResponse = require('../../utils/ApiResponse');

class SpeedBoatBookingsAdminController {
  /**
   * Get all bookings
   */
  async getAll(req, res, next) {
    try {
      const result = await speedBoatBookingsAdminService.getAll(req.query);
      res.status(200).json(
        ApiResponse.paginated(
          result.bookings,
          result.pagination,
          'Bookings retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking by ID
   */
  async getById(req, res, next) {
    try {
      const booking = await speedBoatBookingsAdminService.getById(req.params.id);
      res
        .status(200)
        .json(ApiResponse.success('Booking retrieved successfully', booking));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create booking
   */
  async create(req, res, next) {
    try {
      const booking = await speedBoatBookingsAdminService.create(
        req.body,
        req.user.userId
      );
      res.status(201).json(ApiResponse.created('Booking created successfully', booking));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update booking
   */
  async update(req, res, next) {
    try {
      const booking = await speedBoatBookingsAdminService.update(
        req.params.id,
        req.body
      );
      res
        .status(200)
        .json(ApiResponse.success('Booking updated successfully', booking));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(req, res, next) {
    try {
      const booking = await speedBoatBookingsAdminService.cancelBooking(
        req.params.id,
        req.body,
        req.user.userId
      );
      res
        .status(200)
        .json(ApiResponse.success('Booking cancelled successfully', booking));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get availability calendar
   */
  async getAvailabilityCalendar(req, res, next) {
    try {
      const result = await speedBoatBookingsAdminService.getAvailabilityCalendar(
        req.params.id,
        req.query
      );
      res
        .status(200)
        .json(ApiResponse.success('Availability calendar retrieved successfully', result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SpeedBoatBookingsAdminController();