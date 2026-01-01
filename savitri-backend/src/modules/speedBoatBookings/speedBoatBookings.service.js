// src/modules/speedBoatBookings/speedBoatBookings.service.js

const { SpeedBoat, SpeedBoatBooking, Customer } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { paginate, addHours } = require('../../utils/helpers');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { 
  checkAvailability, 
  getSuggestedSlots, 
  validateBookingTime,
  addHoursToTime 
} = require('../../utils/availability');
const { 
  calculateSpeedBoatPricing,
  calculateRefundAmount,
  calculateHoursBetween
} = require('../../utils/pricing');

class SpeedBoatBookingsService {
  /**
   * Check availability for a speed boat
   */
  async checkAvailability(boatId, data) {
    // Get boat details
    const boat = await SpeedBoat.findOne({ _id: boatId, status: 'ACTIVE' });

    if (!boat) {
      throw ApiError.notFound('Speed boat not found or not available');
    }

    const { bookingDate, startTime, duration } = data;

    // Validate booking time
    const validation = validateBookingTime(bookingDate, startTime, duration, boat);

    if (!validation.valid) {
      throw ApiError.badRequest('Invalid booking time', validation.errors);
    }

    // Check availability
    const availability = await checkAvailability(boatId, bookingDate, startTime, duration);

    if (!availability.available) {
      // Get suggested slots
      const suggestedSlots = await getSuggestedSlots(
        boatId, 
        bookingDate, 
        duration, 
        boat.operatingHours,
        3
      );

      return {
        available: false,
        message: 'This time slot is not available',
        conflicts: availability.conflicts,
        suggestedSlots,
      };
    }

    // Calculate pricing
    const pricing = calculateSpeedBoatPricing(
      boat.hourlyRate,
      duration,
      boat.taxRate,
      boat.taxType
    );

    return {
      available: true,
      message: 'Boat is available for this time slot',
      pricing,
    };
  }

  /**
   * Create booking
   */
  async createBooking(data, customerId) {
    // Get boat details
    const boat = await SpeedBoat.findOne({ _id: data.speedBoat, status: 'ACTIVE' });

    if (!boat) {
      throw ApiError.notFound('Speed boat not found or not available');
    }

    // Validate booking time
    const validation = validateBookingTime(data.bookingDate, data.startTime, data.duration, boat);

    if (!validation.valid) {
      throw ApiError.badRequest('Invalid booking time', validation.errors);
    }

    // Check passenger capacity
    if (data.passengers > boat.capacity) {
      throw ApiError.badRequest(`Maximum ${boat.capacity} passengers allowed for this boat`);
    }

    // Check availability
    const availability = await checkAvailability(
      data.speedBoat, 
      data.bookingDate, 
      data.startTime, 
      data.duration
    );

    if (!availability.available) {
      throw ApiError.conflict('This time slot is no longer available. Please choose another time.');
    }

    // Calculate end time and pricing
    const endTime = addHoursToTime(data.startTime, data.duration);
    const pricing = calculateSpeedBoatPricing(
      boat.hourlyRate,
      data.duration,
      boat.taxRate,
      boat.taxType
    );

    // Create booking
    const booking = await SpeedBoatBooking.create({
      speedBoat: data.speedBoat,
      customer: customerId,
      bookingDate: new Date(data.bookingDate),
      startTime: data.startTime,
      endTime,
      duration: data.duration,
      passengers: data.passengers,
      pricing,
      customerNotes: data.customerNotes,
      paymentDeadline: addHours(new Date(), 0.5), // 30 minutes to pay
      bookingStatus: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      createdBy: customerId,
      createdByModel: 'Customer',
    });

    // Double-check for race condition
    const recheck = await checkAvailability(
      data.speedBoat,
      data.bookingDate,
      data.startTime,
      data.duration,
      booking._id
    );

    if (!recheck.available) {
      // Someone else booked the same slot, delete our booking
      await SpeedBoatBooking.findByIdAndDelete(booking._id);
      throw ApiError.conflict('This time slot was just booked by another customer. Please choose another time.');
    }

    // Populate and return
    const populatedBooking = await SpeedBoatBooking.findById(booking._id)
      .populate('speedBoat', 'name model images')
      .lean();

    return formatDocument(populatedBooking);
  }

  /**
   * Get customer's bookings
   */
  async getMyBookings(customerId, query) {
    const { page, limit, status } = query;
    const {
      skip,
      take,
      page: currentPage,
      limit: currentLimit,
    } = paginate(page, limit);

    const filter = { customer: customerId };
    const now = new Date();

    // Filter by status
    if (status === 'upcoming') {
      filter.bookingStatus = { $in: ['PENDING_PAYMENT', 'CONFIRMED'] };
      filter.bookingDate = { $gte: now };
    } else if (status === 'past') {
      filter.$or = [
        { bookingStatus: 'COMPLETED' },
        { 
          bookingStatus: { $in: ['PENDING_PAYMENT', 'CONFIRMED'] },
          bookingDate: { $lt: now }
        },
      ];
    } else if (status === 'cancelled') {
      filter.bookingStatus = 'CANCELLED';
    }

    const [bookings, total] = await Promise.all([
      SpeedBoatBooking.find(filter)
        .populate('speedBoat', 'name model images hourlyRate')
        .skip(skip)
        .limit(take)
        .sort({ bookingDate: -1, startTime: -1 })
        .lean(),
      SpeedBoatBooking.countDocuments(filter),
    ]);

    return {
      bookings: formatDocuments(bookings),
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
      },
    };
  }

  /**
   * Get single booking by ID
   */
  async getBookingById(bookingId, customerId) {
    const booking = await SpeedBoatBooking.findOne({ _id: bookingId, customer: customerId })
      .populate('speedBoat')
      .populate('customer', 'name email phone')
      .lean();

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    return formatDocument(booking);
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, customerId, cancellationReason) {
    const booking = await SpeedBoatBooking.findOne({ _id: bookingId, customer: customerId });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.bookingStatus === 'CANCELLED') {
      throw ApiError.badRequest('Booking is already cancelled');
    }

    if (booking.bookingStatus === 'COMPLETED') {
      throw ApiError.badRequest('Cannot cancel a completed booking');
    }

    // Calculate refund
    const bookingDateTime = new Date(booking.bookingDate);
    const [hours, minutes] = booking.startTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const hoursUntilTrip = calculateHoursBetween(new Date(), bookingDateTime);
    const refund = calculateRefundAmount(booking.pricing.total, hoursUntilTrip);

    // Update booking
    const updatedBooking = await SpeedBoatBooking.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: 'CANCELLED',
        cancellationReason,
        cancelledAt: new Date(),
        cancelledBy: customerId,
        cancelledByModel: 'Customer',
        refundAmount: refund.refundAmount,
        refundPercentage: refund.refundPercentage,
        refundStatus: refund.refundAmount > 0 ? 'PENDING' : 'NOT_APPLICABLE',
      },
      { new: true }
    )
      .populate('speedBoat', 'name model')
      .lean();

    return formatDocument(updatedBooking);
  }
}

module.exports = new SpeedBoatBookingsService();