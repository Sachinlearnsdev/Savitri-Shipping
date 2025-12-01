// src/modules/customers/customers.controller.js

const customersService = require('./customers.service');
const ApiResponse = require('../../utils/ApiResponse');

class CustomersController {
  /**
   * Get all customers
   */
  async getAll(req, res, next) {
    try {
      const result = await customersService.getAll(req.query);
      res.status(200).json(ApiResponse.paginated(
        result.customers,
        result.pagination,
        'Customers retrieved successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer by ID
   */
  async getById(req, res, next) {
    try {
      const customer = await customersService.getById(req.params.id);
      res.status(200).json(ApiResponse.success('Customer retrieved successfully', customer));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer bookings
   */
  async getBookings(req, res, next) {
    try {
      const result = await customersService.getBookings(req.params.id, req.query);
      res.status(200).json(ApiResponse.paginated(
        result.bookings,
        result.pagination,
        'Customer bookings retrieved successfully'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update customer status
   */
  async updateStatus(req, res, next) {
    try {
      const customer = await customersService.updateStatus(req.params.id, req.body.status);
      res.status(200).json(ApiResponse.success('Customer status updated successfully', customer));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomersController();