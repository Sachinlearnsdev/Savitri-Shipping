// src/modules/speedBoatBookingsAdmin/speedBoatBookingsAdmin.service.js

const { SpeedBoat, SpeedBoatBooking, Customer } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { paginate } = require('../../utils/helpers');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const {
  checkAvailability,
  validateBookingTime,
  addHoursToTime,
} = require('../../utils/availability');
const {
  calculateSpeedBoatPricing,
  calculateRefundAmount,
  calculateHoursBetween,
} = require('../../utils/pricing');

class SpeedBoatBookingsAdminService {
  /**
   * Get all bookings (admin)
   */
  async getAll(query) {
    const {
      page,
      limit,
      speedBoat,
      customer,
      bookingStatus,
      paymentStatus,
      dateFrom,
      dateTo,
      search,
    } = query;

    const {
      skip,
      take,
      page: currentPage,
      limit: currentLimit,
    } = paginate(page, limit);

    const filter = {};

    // Filter by speed boat
    if (speedBoat) {
      filter.speedBoat = speedBoat;
    }

    // Filter by customer
    if (customer) {
      filter.customer = customer;
    }

    // Filter by booking status
    if (bookingStatus) {
      filter.bookingStatus = bookingStatus;
    }

    // Filter by payment status
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      filter.bookingDate = {};
      if (dateFrom) {
        filter.bookingDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.bookingDate.$lte = new Date(dateTo);
      }
    }

    // Search by booking ID or customer name
    if (search) {
      filter.$or = [
        { bookingId: { $regex: search, $options: 'i' } },
      ];
    }

    const [bookings, total] = await Promise.all([
      SpeedBoatBooking.find(filter)
        .populate('speedBoat', 'name model images hourlyRate')
        .populate('customer', 'name email phone')
        .populate('createdBy', 'name email')
        .populate('cancelledBy', 'name email')
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
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
   * Get booking by ID (admin)
   */
  async getById(id) {
    const booking = await SpeedBoatBooking.findById(id)
      .populate('speedBoat')
      .populate('customer', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('cancelledBy', 'name email')
      .lean();

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    return formatDocument(booking);
  }

  /**
   * Create booking (admin - on behalf of customer)
   */
  async create(data, adminUserId) {
    // Verify boat exists
    const boat = await SpeedBoat.findOne({ _id: data.speedBoat });

    if (!boat) {
      throw ApiError.notFound('Speed boat not found');
    }

    // Verify customer exists
    const customer = await Customer.findById(data.customer);

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    // Validate booking time
    const validation = validateBookingTime(
      data.bookingDate,
      data.startTime,
      data.duration,
      boat
    );

    if (!validation.valid) {
      throw ApiError.badRequest('Invalid booking time', validation.errors);
    }

    // Check passenger capacity
    if (data.passengers > boat.capacity) {
      throw ApiError.badRequest(
        `Maximum ${boat.capacity} passengers allowed for this boat`
      );
    }

    // Check availability
    const availability = await checkAvailability(
      data.speedBoat,
      data.bookingDate,
      data.startTime,
      data.duration
    );

    if (!availability.available) {
      throw ApiError.conflict('This time slot is not available');
    }

    // Calculate end time and pricing
    const endTime = addHoursToTime(data.startTime, data.duration);
    const pricing = calculateSpeedBoatPricing(
      boat.hourlyRate,
      data.duration,
      boat.taxRate,
      boat.taxType
    );

    // Determine booking status
    const bookingStatus = data.paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING_PAYMENT';

    // Create booking
    const booking = await SpeedBoatBooking.create({
      speedBoat: data.speedBoat,
      customer: data.customer,
      bookingDate: new Date(data.bookingDate),
      startTime: data.startTime,
      endTime,
      duration: data.duration,
      passengers: data.passengers,
      pricing,
      paymentStatus: data.paymentStatus || 'PENDING',
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      paymentDate: data.paymentStatus === 'PAID' ? new Date() : undefined,
      adminNotes: data.adminNotes,
      bookingStatus,
      createdBy: adminUserId,
      createdByModel: 'AdminUser',
    });

    // Populate and return
    const populatedBooking = await SpeedBoatBooking.findById(booking._id)
      .populate('speedBoat', 'name model images')
      .populate('customer', 'name email phone')
      .lean();

    return formatDocument(populatedBooking);
  }

  /**
   * Update booking (admin)
   */
  async update(id, data) {
    const booking = await SpeedBoatBooking.findById(id);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // If changing date/time, check availability
    if (data.bookingDate || data.startTime || data.duration) {
      const boat = await SpeedBoat.findById(booking.speedBoat);

      const newDate = data.bookingDate || booking.bookingDate;
      const newStartTime = data.startTime || booking.startTime;
      const newDuration = data.duration || booking.duration;

      // Validate booking time
      const validation = validateBookingTime(newDate, newStartTime, newDuration, boat);

      if (!validation.valid) {
        throw ApiError.badRequest('Invalid booking time', validation.errors);
      }

      // Check availability (exclude current booking)
      const availability = await checkAvailability(
        booking.speedBoat,
        newDate,
        newStartTime,
        newDuration,
        id
      );

      if (!availability.available) {
        throw ApiError.conflict('This time slot is not available');
      }

      // Calculate new end time
      data.endTime = addHoursToTime(newStartTime, newDuration);

      // Recalculate pricing if duration changed
      if (data.duration) {
        const pricing = calculateSpeedBoatPricing(
          boat.hourlyRate,
          newDuration,
          boat.taxRate,
          boat.taxType
        );
        data.pricing = pricing;
      }
    }

    // If payment status changed to PAID, set payment date
    if (data.paymentStatus === 'PAID' && booking.paymentStatus !== 'PAID') {
      data.paymentDate = new Date();
      data.bookingStatus = 'CONFIRMED';
    }

    const updatedBooking = await SpeedBoatBooking.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate('speedBoat', 'name model images')
      .populate('customer', 'name email phone')
      .lean();

    return formatDocument(updatedBooking);
  }

  /**
   * Cancel booking (admin)
   */
  async cancelBooking(id, data, adminUserId) {
    const booking = await SpeedBoatBooking.findById(id);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.bookingStatus === 'CANCELLED') {
      throw ApiError.badRequest('Booking is already cancelled');
    }

    // Calculate refund
    let refundAmount = 0;
    let refundPercentage = 0;

    if (data.overrideRefund && data.refundPercentage !== undefined) {
      // Admin override
      refundPercentage = data.refundPercentage;
      refundAmount = (booking.pricing.total * refundPercentage) / 100;
    } else {
      // Use policy
      const bookingDateTime = new Date(booking.bookingDate);
      const [hours, minutes] = booking.startTime.split(':').map(Number);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      const hoursUntilTrip = calculateHoursBetween(new Date(), bookingDateTime);
      const refund = calculateRefundAmount(booking.pricing.total, hoursUntilTrip);

      refundAmount = refund.refundAmount;
      refundPercentage = refund.refundPercentage;
    }

    // Update booking
    const updatedBooking = await SpeedBoatBooking.findByIdAndUpdate(
      id,
      {
        bookingStatus: 'CANCELLED',
        cancellationReason: data.cancellationReason,
        cancelledAt: new Date(),
        cancelledBy: adminUserId,
        cancelledByModel: 'AdminUser',
        refundAmount,
        refundPercentage,
        refundStatus: refundAmount > 0 ? 'PENDING' : 'NOT_APPLICABLE',
      },
      { new: true }
    )
      .populate('speedBoat', 'name model')
      .populate('customer', 'name email phone')
      .lean();

    return formatDocument(updatedBooking);
  }

  /**
   * Get availability calendar for a boat
   */
  async getAvailabilityCalendar(boatId, query) {
    const { dateFrom, dateTo } = query;

    // Verify boat exists
    const boat = await SpeedBoat.findById(boatId);

    if (!boat) {
      throw ApiError.notFound('Speed boat not found');
    }

    // Get all bookings in date range
    const bookings = await SpeedBoatBooking.find({
      speedBoat: boatId,
      bookingDate: {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      },
      bookingStatus: { $in: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'] },
    })
      .populate('customer', 'name email phone')
      .sort({ bookingDate: 1, startTime: 1 })
      .lean();

    // Group by date
    const groupedByDate = {};

    bookings.forEach((booking) => {
      const dateKey = booking.bookingDate.toISOString().split('T')[0];

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }

      groupedByDate[dateKey].push({
        bookingId: booking.bookingId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration,
        passengers: booking.passengers,
        customer: booking.customer,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
      });
    });

    // Convert to array format
    const calendar = Object.keys(groupedByDate)
      .sort()
      .map((date) => ({
        date,
        timeSlots: groupedByDate[date],
      }));

    return {
      speedBoat: formatDocument(boat),
      bookings: calendar,
    };
  }
}

module.exports = new SpeedBoatBookingsAdminService();