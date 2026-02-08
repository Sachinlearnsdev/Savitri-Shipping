const { PartyBoatBooking, PartyBoat, Customer, Coupon } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { paginate, calculateGST, hashPassword } = require('../../utils/helpers');
const { PARTY_CANCELLATION_POLICY, GST } = require('../../config/constants');
const { sendBookingConfirmation, sendBookingCancellation } = require('../../utils/email');

class PartyBookingsService {
  /**
   * Generate unique booking number: PB-YYYYMMDD-XXX
   */
  async _generateBookingNumber() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const prefix = `PB-${dateStr}`;

    const lastBooking = await PartyBoatBooking.findOne({
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
   * Calculate add-ons total from selected add-ons and boat's add-on definitions
   */
  _calculateAddOns(selectedAddOns, boat, numberOfGuests) {
    if (!selectedAddOns || selectedAddOns.length === 0) return { addOns: [], total: 0 };

    const boatAddOns = boat.addOns || [];
    const resolvedAddOns = [];
    let total = 0;

    for (const selected of selectedAddOns) {
      const boatAddOn = boatAddOns.find(a => a.type === selected.type);
      if (!boatAddOn) continue;

      const quantity = boatAddOn.priceType === 'PER_PERSON' ? numberOfGuests : 1;
      const addOnTotal = boatAddOn.price * quantity;

      resolvedAddOns.push({
        type: boatAddOn.type,
        label: boatAddOn.label,
        price: boatAddOn.price,
        priceType: boatAddOn.priceType,
        quantity,
        total: addOnTotal,
      });

      total += addOnTotal;
    }

    return { addOns: resolvedAddOns, total };
  }

  /**
   * Calculate pricing for a party boat booking
   */
  _calculatePricing(boat, selectedAddOns, numberOfGuests) {
    const basePrice = boat.basePrice;
    const { addOns, total: addOnsTotal } = this._calculateAddOns(selectedAddOns, boat, numberOfGuests);
    const subtotal = basePrice + addOnsTotal;
    const gst = calculateGST(subtotal, GST.PERCENTAGE, GST.IS_INCLUSIVE);

    return {
      pricing: {
        basePrice,
        addOnsTotal,
        subtotal,
        gstPercent: GST.PERCENTAGE,
        gstAmount: gst.gstAmount,
        cgst: gst.cgst,
        sgst: gst.sgst,
        totalAmount: gst.totalAmount,
        finalAmount: gst.totalAmount,
      },
      resolvedAddOns: addOns,
    };
  }

  /**
   * Create booking as admin
   */
  async adminCreateBooking(data, adminUserId) {
    // 1. Validate boat exists and is active
    const boat = await PartyBoat.findOne({ _id: data.boatId, isDeleted: false });
    if (!boat) {
      throw ApiError.notFound('Party boat not found');
    }
    if (boat.status !== 'ACTIVE') {
      throw ApiError.badRequest('This boat is not currently available');
    }

    // 2. Validate date is not in the past
    const bookingDate = new Date(data.date);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      throw ApiError.badRequest('Cannot book for past dates');
    }

    // 3. Validate guest count against boat capacity
    if (data.numberOfGuests < boat.capacityMin) {
      throw ApiError.badRequest(`Minimum ${boat.capacityMin} guests required for this boat`);
    }
    if (data.numberOfGuests > boat.capacityMax) {
      throw ApiError.badRequest(`Maximum ${boat.capacityMax} guests allowed for this boat`);
    }

    // 4. Validate location type is supported by this boat
    if (!boat.locationOptions.includes(data.locationType)) {
      throw ApiError.badRequest(`This boat does not support ${data.locationType} location`);
    }

    // 5. Validate time slot is supported by this boat
    if (!boat.timeSlots.includes(data.timeSlot)) {
      throw ApiError.badRequest(`This boat does not support ${data.timeSlot} time slot`);
    }

    // 6. Check no conflicting booking on same boat + date + timeSlot
    const conflicting = await PartyBoatBooking.findOne({
      boatId: data.boatId,
      date: bookingDate,
      timeSlot: data.timeSlot,
      status: { $in: ['PENDING', 'CONFIRMED'] },
      isDeleted: false,
    });
    if (conflicting) {
      throw ApiError.badRequest('This boat is already booked for this date and time slot');
    }

    // 7. Resolve customer
    let customerId = data.customerId;
    if (!customerId) {
      if (!data.customerPhone && !data.customerEmail) {
        throw ApiError.badRequest('Customer phone or email is required');
      }

      let customer = null;
      if (data.customerEmail) {
        customer = await Customer.findOne({ email: data.customerEmail.toLowerCase() });
      }
      if (!customer && data.customerPhone) {
        customer = await Customer.findOne({ phone: data.customerPhone });
      }

      if (customer) {
        customerId = customer._id;
      } else {
        const tempPassword = await hashPassword('TempPass@' + Date.now());
        customer = await Customer.create({
          name: data.customerName || 'Guest',
          email: data.customerEmail ? data.customerEmail.toLowerCase() : `guest_${Date.now()}@savitrishipping.in`,
          password: tempPassword,
          phone: data.customerPhone || undefined,
          status: 'ACTIVE',
        });
        customerId = customer._id;
      }
    }

    // 8. Calculate pricing
    const { pricing, resolvedAddOns } = this._calculatePricing(
      boat,
      data.selectedAddOns || [],
      data.numberOfGuests
    );

    // Apply admin override if provided
    if (data.adminOverrideAmount !== undefined && data.adminOverrideAmount !== null) {
      pricing.adminOverrideAmount = data.adminOverrideAmount;
      pricing.finalAmount = data.adminOverrideAmount;
    }

    // Apply coupon if provided
    if (data.couponCode) {
      const bookingsService = require('../bookings/bookings.service');
      const couponResult = await bookingsService.validateCoupon(data.couponCode, pricing.totalAmount, 'PARTY_BOAT');
      pricing.discountAmount = couponResult.discount.discountAmount;
      pricing.coupon = {
        code: couponResult.coupon.code,
        discountType: couponResult.discount.type,
        discountValue: couponResult.discount.value,
        discountAmount: couponResult.discount.discountAmount,
      };
      pricing.finalAmount = pricing.totalAmount - pricing.discountAmount;
    }

    // 9. Generate booking number
    const bookingNumber = await this._generateBookingNumber();

    // 10. Create booking
    const booking = await PartyBoatBooking.create({
      bookingNumber,
      customerId,
      boatId: data.boatId,
      date: bookingDate,
      timeSlot: data.timeSlot,
      eventType: data.eventType,
      numberOfGuests: data.numberOfGuests,
      locationType: data.locationType,
      selectedAddOns: resolvedAddOns,
      pricing,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paymentMode: data.paymentMode,
      adminNotes: data.adminNotes,
      createdByType: 'ADMIN',
      createdById: adminUserId,
      createdByModel: 'AdminUser',
    });

    // Increment coupon usage if coupon was applied
    if (data.couponCode) {
      await Coupon.updateOne({ code: data.couponCode.toUpperCase() }, { $inc: { usageCount: 1 } });
    }

    // Send booking confirmation email (fire-and-forget)
    try {
      const customer = await Customer.findById(customerId).lean();
      if (customer && customer.email) {
        const formattedDate = bookingDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        sendBookingConfirmation(customer.email, {
          name: customer.name || 'Customer',
          bookingNumber,
          boatName: boat.name || 'Party Boat',
          date: formattedDate,
          time: data.timeSlot,
          duration: '',
          bookingType: 'Party Boat',
          subtotal: `\u20B9${pricing.subtotal.toLocaleString('en-IN')}`,
          gst: `\u20B9${pricing.gstAmount.toLocaleString('en-IN')}`,
          discount: pricing.discountAmount ? `\u20B9${pricing.discountAmount.toLocaleString('en-IN')}` : '',
          total: `\u20B9${pricing.finalAmount.toLocaleString('en-IN')}`,
          paymentMode: data.paymentMode,
          cancellationPolicy: '7d+ = 100% refund, 3-7d = 50% refund, <3d = No refund',
        }).catch(() => {});
      }
    } catch (emailErr) {
      // Email failure should not fail the booking
    }

    return this.getById(booking._id);
  }

  /**
   * Get all bookings (admin - paginated)
   */
  async getAll(query) {
    const { page, limit, search, status, paymentStatus, date, startDate, endDate, boatId } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { isDeleted: false };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (boatId) filter.boatId = boatId;

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
      PartyBoatBooking.find(filter)
        .populate('customerId', 'name email phone')
        .populate('boatId', 'name capacityMin capacityMax basePrice')
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      PartyBoatBooking.countDocuments(filter),
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
    const booking = await PartyBoatBooking.findOne({ _id: id, isDeleted: false })
      .populate('customerId', 'name email phone')
      .populate('boatId', 'name capacityMin capacityMax basePrice locationOptions timeSlots eventTypes addOns')
      .lean();

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    return formatDocument(booking);
  }

  /**
   * Update booking status (admin)
   */
  async updateStatus(id, status) {
    const booking = await PartyBoatBooking.findOne({ _id: id, isDeleted: false });

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
    const booking = await PartyBoatBooking.findOne({ _id: id, isDeleted: false });

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
    const booking = await PartyBoatBooking.findOne({ _id: id, isDeleted: false });

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    if (booking.status === 'CANCELLED') {
      throw ApiError.badRequest('Booking is already cancelled');
    }

    if (booking.status === 'COMPLETED') {
      throw ApiError.badRequest('Cannot cancel a completed booking');
    }

    // Calculate refund based on party boat cancellation policy
    const policy = PARTY_CANCELLATION_POLICY;
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);

    const daysUntilBooking = (bookingDate - new Date()) / (1000 * 60 * 60 * 24);

    let refundPercent = 0;
    if (daysUntilBooking >= policy.FULL_REFUND_DAYS) {
      refundPercent = 100;
    } else if (daysUntilBooking >= policy.PARTIAL_REFUND_DAYS) {
      refundPercent = policy.PARTIAL_REFUND_PERCENT;
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

    // Send cancellation email (fire-and-forget)
    try {
      const customer = await Customer.findById(booking.customerId).lean();
      const boat = await PartyBoat.findById(booking.boatId).lean();
      if (customer && customer.email) {
        const formattedDate = new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        sendBookingCancellation(customer.email, {
          name: customer.name || 'Customer',
          bookingNumber: booking.bookingNumber,
          boatName: (boat && boat.name) || 'Party Boat',
          date: formattedDate,
          refundAmount: `\u20B9${Math.round(refundAmount).toLocaleString('en-IN')}`,
          refundPercent: `${refundPercent}%`,
          cancellationReason: reason || 'Not specified',
        }).catch(() => {});
      }
    } catch (emailErr) {
      // Email failure should not fail the cancellation
    }

    return formatDocument(booking.toObject());
  }
}

module.exports = new PartyBookingsService();
