const { SpeedBoatBooking, SpeedBoat, Customer, Setting } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { paginate, calculateGST, hashPassword } = require('../../utils/helpers');
const calendarService = require('../calendar/calendar.service');
const pricingRulesService = require('../pricingRules/pricingRules.service');
const { BOOKING_LIMITS, CANCELLATION_POLICY, GST } = require('../../config/constants');

class BookingsService {
  /**
   * Generate unique booking number: SB-YYYYMMDD-XXX
   */
  async _generateBookingNumber() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const prefix = `SB-${dateStr}`;

    const lastBooking = await SpeedBoatBooking.findOne({
      bookingNumber: { $regex: `^${prefix}` },
    }).sort({ bookingNumber: -1 }).lean();

    let sequence = 1;
    if (lastBooking) {
      const lastSeq = parseInt(lastBooking.bookingNumber.split('-')[2]);
      sequence = lastSeq + 1;
    }

    return `${prefix}-${String(sequence).padStart(3, '0')}`;
  }

  /**
   * Get booking settings from DB (with fallback to constants)
   */
  async _getBookingSettings() {
    const setting = await Setting.findOne({ group: 'booking', key: 'config' }).lean();
    if (setting && setting.value) return setting.value;

    return {
      maxAdvanceDays: BOOKING_LIMITS.MAX_ADVANCE_DAYS,
      minNoticeHours: BOOKING_LIMITS.MIN_NOTICE_HOURS,
      bufferMinutes: BOOKING_LIMITS.BUFFER_MINUTES,
      minDurationHours: BOOKING_LIMITS.MIN_DURATION_HOURS,
      maxDurationHours: BOOKING_LIMITS.MAX_DURATION_HOURS,
      operatingStartTime: '08:00',
      operatingEndTime: '18:00',
      cancellationPolicy: {
        fullRefundHours: CANCELLATION_POLICY.FULL_REFUND_HOURS,
        partialRefundHours: CANCELLATION_POLICY.PARTIAL_REFUND_HOURS,
        partialRefundPercent: CANCELLATION_POLICY.PARTIAL_REFUND_PERCENT,
      },
    };
  }

  /**
   * Calculate end time from start time and duration
   */
  _calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes + (duration * 60);
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = Math.round(totalMinutes % 60);
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Check availability for a date/time/boats
   */
  async checkAvailability({ date, startTime, duration, numberOfBoats }) {
    const settings = await this._getBookingSettings();
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const now = new Date();

    // 1. Check if date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return { available: false, reason: 'Cannot book for past dates' };
    }

    // 2. Check max advance days
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + settings.maxAdvanceDays);
    if (bookingDate > maxDate) {
      return { available: false, reason: `Cannot book more than ${settings.maxAdvanceDays} days in advance` };
    }

    // 3. Check minimum notice (for same-day or next-day bookings)
    const bookingDateTime = new Date(bookingDate);
    const [startH, startM] = startTime.split(':').map(Number);
    bookingDateTime.setHours(startH, startM, 0, 0);
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
    if (hoursUntilBooking < settings.minNoticeHours) {
      return { available: false, reason: `Booking requires at least ${settings.minNoticeHours} hours notice` };
    }

    // 4. Check duration limits
    if (duration < settings.minDurationHours || duration > settings.maxDurationHours) {
      return { available: false, reason: `Duration must be between ${settings.minDurationHours} and ${settings.maxDurationHours} hours` };
    }

    // 5. Check operating hours
    const endTime = this._calculateEndTime(startTime, duration);
    if (startTime < settings.operatingStartTime || endTime > settings.operatingEndTime) {
      return { available: false, reason: `Operating hours are ${settings.operatingStartTime} to ${settings.operatingEndTime}` };
    }

    // 6. Check if day is open
    const dayOpen = await calendarService.isDayOpen(bookingDate);
    if (!dayOpen) {
      return { available: false, reason: 'Operations are closed on this date' };
    }

    // 7. Check boat availability (how many boats are already booked at this time)
    const totalActiveBoats = await SpeedBoat.countDocuments({ status: 'ACTIVE', isDeleted: false });

    if (numberOfBoats > totalActiveBoats) {
      return { available: false, reason: `Only ${totalActiveBoats} boats available in fleet` };
    }

    // Check overlapping bookings (with buffer)
    const bufferMinutes = settings.bufferMinutes;
    const bookedBoats = await this._getBookedBoatCount(bookingDate, startTime, endTime, bufferMinutes);
    const availableBoats = totalActiveBoats - bookedBoats;

    if (numberOfBoats > availableBoats) {
      return {
        available: false,
        reason: availableBoats === 0
          ? 'All boats are booked for this time slot'
          : `Only ${availableBoats} boats available for this time slot`,
        availableBoats,
      };
    }

    return { available: true, availableBoats };
  }

  /**
   * Get count of boats already booked at a given date/time (considering buffer)
   */
  async _getBookedBoatCount(date, startTime, endTime, bufferMinutes = 30) {
    // Subtract buffer from start, add buffer to end to find overlaps
    const adjustedStart = this._adjustTime(startTime, -bufferMinutes);
    const adjustedEnd = this._adjustTime(endTime, bufferMinutes);

    const overlapping = await SpeedBoatBooking.find({
      date,
      status: { $in: ['PENDING', 'CONFIRMED'] },
      isDeleted: false,
      // Time overlap: booking starts before our end AND booking ends after our start
      startTime: { $lt: adjustedEnd },
      endTime: { $gt: adjustedStart },
    }).lean();

    return overlapping.reduce((sum, b) => sum + b.numberOfBoats, 0);
  }

  /**
   * Adjust time by minutes
   */
  _adjustTime(time, minutes) {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const newH = Math.max(0, Math.floor(totalMinutes / 60));
    const newM = Math.max(0, totalMinutes % 60);
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  }

  /**
   * Calculate pricing for a booking
   */
  async calculatePrice({ date, startTime, duration, numberOfBoats }) {
    // Get the base rate (average of active boats or use first active boat)
    const activeBoats = await SpeedBoat.find({ status: 'ACTIVE', isDeleted: false })
      .select('baseRate')
      .lean();

    if (activeBoats.length === 0) {
      throw ApiError.badRequest('No active boats available');
    }

    // Use the minimum base rate across active boats
    const baseRate = Math.min(...activeBoats.map(b => b.baseRate));

    // Find matching pricing rule
    const matchingRule = await pricingRulesService.findMatchingRule(date, startTime);

    let adjustedRate = baseRate;
    let appliedRule = null;

    if (matchingRule) {
      adjustedRate = baseRate * (1 + matchingRule.adjustmentPercent / 100);
      adjustedRate = Math.round(adjustedRate * 100) / 100;
      appliedRule = {
        ruleId: matchingRule.id,
        name: matchingRule.name,
        adjustmentPercent: matchingRule.adjustmentPercent,
      };
    }

    const subtotal = adjustedRate * numberOfBoats * duration;
    const gst = calculateGST(subtotal, GST.PERCENTAGE, GST.IS_INCLUSIVE);

    return {
      baseRate,
      appliedRule,
      adjustedRate,
      numberOfBoats,
      duration,
      subtotal,
      gstPercent: GST.PERCENTAGE,
      gstAmount: gst.gstAmount,
      cgst: gst.cgst,
      sgst: gst.sgst,
      totalAmount: gst.totalAmount,
      finalAmount: gst.totalAmount,
    };
  }

  /**
   * Create a booking (public - customer)
   */
  async createBooking(data, customerId = null) {
    // If no customer ID, handle auto-account creation
    let resolvedCustomerId = customerId;

    if (!resolvedCustomerId) {
      if (!data.customerEmail && !data.customerPhone) {
        throw ApiError.badRequest('Customer email or phone is required');
      }

      // Try to find existing customer
      let customer = null;
      if (data.customerEmail) {
        customer = await Customer.findOne({ email: data.customerEmail.toLowerCase() });
      }
      if (!customer && data.customerPhone) {
        customer = await Customer.findOne({ phone: data.customerPhone });
      }

      if (customer) {
        resolvedCustomerId = customer._id;
      } else {
        // Auto-create customer account
        const tempPassword = await hashPassword('TempPass@' + Date.now());
        customer = await Customer.create({
          name: data.customerName || 'Guest',
          email: data.customerEmail ? data.customerEmail.toLowerCase() : `guest_${Date.now()}@savitrishipping.in`,
          password: tempPassword,
          phone: data.customerPhone || undefined,
          status: 'ACTIVE',
        });
        resolvedCustomerId = customer._id;
      }
    }

    // Check availability
    const endTime = this._calculateEndTime(data.startTime, data.duration);
    const availability = await this.checkAvailability({
      date: data.date,
      startTime: data.startTime,
      duration: data.duration,
      numberOfBoats: data.numberOfBoats,
    });

    if (!availability.available) {
      throw ApiError.badRequest(availability.reason);
    }

    // Calculate pricing
    const pricing = await this.calculatePrice({
      date: data.date,
      startTime: data.startTime,
      duration: data.duration,
      numberOfBoats: data.numberOfBoats,
    });

    // Apply admin override if provided
    if (data.adminOverrideAmount !== undefined && data.adminOverrideAmount !== null) {
      pricing.adminOverrideAmount = data.adminOverrideAmount;
      pricing.finalAmount = data.adminOverrideAmount;
    }

    // Generate booking number
    const bookingNumber = await this._generateBookingNumber();

    const bookingDate = new Date(data.date);
    bookingDate.setHours(0, 0, 0, 0);

    const booking = await SpeedBoatBooking.create({
      bookingNumber,
      customerId: resolvedCustomerId,
      date: bookingDate,
      startTime: data.startTime,
      endTime,
      duration: data.duration,
      numberOfBoats: data.numberOfBoats,
      pricing,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMode: data.paymentMode,
      customerNotes: data.customerNotes,
      adminNotes: data.adminNotes,
      createdByType: customerId ? 'CUSTOMER' : (data.adminOverrideAmount !== undefined ? 'ADMIN' : 'CUSTOMER'),
      createdById: resolvedCustomerId,
      createdByModel: 'Customer',
    });

    return formatDocument(booking.toObject());
  }

  /**
   * Create booking as admin
   */
  async adminCreateBooking(data, adminUserId) {
    const booking = await this.createBooking({
      ...data,
      adminOverrideAmount: data.adminOverrideAmount,
    }, data.customerId || null);

    // Update createdBy to reflect admin
    await SpeedBoatBooking.findByIdAndUpdate(booking.id, {
      createdByType: 'ADMIN',
      createdById: adminUserId,
      createdByModel: 'AdminUser',
      adminNotes: data.adminNotes,
    });

    return this.getById(booking.id);
  }

  /**
   * Get all bookings (admin - paginated)
   */
  async getAll(query) {
    const { page, limit, search, status, paymentStatus, date, startDate, endDate } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { isDeleted: false };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.date = { $gte: d, $lt: next };
    } else if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (search) {
      filter.$or = [
        { bookingNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const [bookings, total] = await Promise.all([
      SpeedBoatBooking.find(filter)
        .populate('customerId', 'name email phone')
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      SpeedBoatBooking.countDocuments(filter),
    ]);

    return {
      bookings: formatDocuments(bookings),
      pagination: { page: currentPage, limit: currentLimit, total },
    };
  }

  /**
   * Get booking by ID
   */
  async getById(id) {
    const booking = await SpeedBoatBooking.findOne({ _id: id, isDeleted: false })
      .populate('customerId', 'name email phone')
      .lean();

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    return formatDocument(booking);
  }

  /**
   * Get bookings for a customer
   */
  async getCustomerBookings(customerId, query) {
    const { page, limit } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { customerId, isDeleted: false };

    const [bookings, total] = await Promise.all([
      SpeedBoatBooking.find(filter)
        .skip(skip)
        .limit(take)
        .sort({ date: -1 })
        .lean(),
      SpeedBoatBooking.countDocuments(filter),
    ]);

    return {
      bookings: formatDocuments(bookings),
      pagination: { page: currentPage, limit: currentLimit, total },
    };
  }

  /**
   * Update booking status (admin)
   */
  async updateStatus(id, status) {
    const booking = await SpeedBoatBooking.findOne({ _id: id, isDeleted: false });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.status === 'CANCELLED') {
      throw ApiError.badRequest('Cannot update a cancelled booking');
    }

    booking.status = status;
    await booking.save();

    return formatDocument(booking.toObject());
  }

  /**
   * Mark booking as paid (admin)
   */
  async markPaid(id, data) {
    const booking = await SpeedBoatBooking.findOne({ _id: id, isDeleted: false });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    booking.paymentStatus = 'PAID';
    if (data.paymentMode) booking.paymentMode = data.paymentMode;

    // Auto-confirm if pending
    if (booking.status === 'PENDING') {
      booking.status = 'CONFIRMED';
    }

    await booking.save();
    return formatDocument(booking.toObject());
  }

  /**
   * Cancel booking
   */
  async cancelBooking(id, reason, cancelledBy) {
    const booking = await SpeedBoatBooking.findOne({ _id: id, isDeleted: false });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.status === 'CANCELLED') {
      throw ApiError.badRequest('Booking is already cancelled');
    }

    if (booking.status === 'COMPLETED') {
      throw ApiError.badRequest('Cannot cancel a completed booking');
    }

    // Calculate refund based on cancellation policy
    const settings = await this._getBookingSettings();
    const policy = settings.cancellationPolicy;

    const bookingDateTime = new Date(booking.date);
    const [h, m] = booking.startTime.split(':').map(Number);
    bookingDateTime.setHours(h, m, 0, 0);

    const hoursUntilBooking = (bookingDateTime - new Date()) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hoursUntilBooking >= policy.fullRefundHours) {
      refundPercent = 100;
    } else if (hoursUntilBooking >= policy.partialRefundHours) {
      refundPercent = policy.partialRefundPercent;
    }

    // Admin cancellations always get full refund
    if (cancelledBy === 'ADMIN') {
      refundPercent = 100;
    }

    const refundAmount = (booking.pricing.finalAmount * refundPercent) / 100;

    booking.status = 'CANCELLED';
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledBy,
      reason: reason || null,
      refundPercent,
      refundAmount: Math.round(refundAmount * 100) / 100,
    };

    if (booking.paymentStatus === 'PAID') {
      booking.paymentStatus = refundPercent === 100 ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    }

    await booking.save();
    return formatDocument(booking.toObject());
  }

  /**
   * Get available time slots for a date
   */
  async getAvailableSlots(date, numberOfBoats = 1) {
    const settings = await this._getBookingSettings();
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Check if day is open
    const dayOpen = await calendarService.isDayOpen(bookingDate);
    if (!dayOpen) {
      return { open: false, slots: [] };
    }

    const totalBoats = await SpeedBoat.countDocuments({ status: 'ACTIVE', isDeleted: false });
    const [startH] = settings.operatingStartTime.split(':').map(Number);
    const [endH] = settings.operatingEndTime.split(':').map(Number);

    const slots = [];
    for (let h = startH; h < endH; h++) {
      const time = `${String(h).padStart(2, '0')}:00`;
      const endTime = `${String(h + 1).padStart(2, '0')}:00`;

      const bookedCount = await this._getBookedBoatCount(
        bookingDate, time, endTime, settings.bufferMinutes
      );
      const available = totalBoats - bookedCount;

      slots.push({
        time,
        availableBoats: Math.max(0, available),
        isAvailable: available >= numberOfBoats,
      });
    }

    return { open: true, slots, totalBoats };
  }
}

module.exports = new BookingsService();
