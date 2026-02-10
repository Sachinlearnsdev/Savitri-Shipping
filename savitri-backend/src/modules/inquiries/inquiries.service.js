const { Inquiry, PartyBoat, PartyBoatBooking, Customer } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { paginate, formatCurrency, hashPassword } = require('../../utils/helpers');
const { INQUIRY_STATUS, GST } = require('../../config/constants');
const { sendInquiryConfirmationEmail, sendInquiryQuoteEmail, sendInquiryAcceptedEmail } = require('../../utils/email');

class InquiriesService {
  /**
   * Generate unique inquiry number: INQ-YYYYMMDD-XXX
   */
  async _generateInquiryNumber() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const prefix = `INQ-${dateStr}`;

    const lastInquiry = await Inquiry.findOne({
      inquiryNumber: { $regex: `^${prefix}` },
    }).sort({ inquiryNumber: -1 }).lean();

    let sequence = 1;
    if (lastInquiry) {
      const lastSeq = parseInt(lastInquiry.inquiryNumber.split('-')[2]);
      sequence = lastSeq + 1;
    }

    return `${prefix}-${String(sequence).padStart(3, '0')}`;
  }

  /**
   * Create a new inquiry (public - guest or authenticated)
   */
  async create(data, customerId) {
    // Validate boat exists and is active
    const boat = await PartyBoat.findOne({ _id: data.boatId, isDeleted: false });
    if (!boat) {
      throw ApiError.notFound('Party boat not found');
    }
    if (boat.status !== 'ACTIVE') {
      throw ApiError.badRequest('This boat is not currently available for inquiries');
    }

    // Generate inquiry number
    const inquiryNumber = await this._generateInquiryNumber();

    // If customer is authenticated, link to their account
    let resolvedCustomerId = customerId || null;
    if (!resolvedCustomerId && data.customerEmail) {
      const existingCustomer = await Customer.findOne({ email: data.customerEmail.toLowerCase() });
      if (existingCustomer) {
        resolvedCustomerId = existingCustomer._id;
      }
    }

    // Create inquiry
    const inquiry = await Inquiry.create({
      inquiryNumber,
      customerId: resolvedCustomerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail.toLowerCase(),
      customerPhone: data.customerPhone,
      boatId: data.boatId,
      eventType: data.eventType,
      numberOfGuests: data.numberOfGuests,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : undefined,
      preferredTimeSlot: data.preferredTimeSlot,
      locationType: data.locationType,
      specialRequests: data.specialRequests,
      budget: data.budget,
      selectedAddOns: data.selectedAddOns || [],
    });

    // Send confirmation email (fire-and-forget)
    try {
      sendInquiryConfirmationEmail(data.customerEmail, {
        name: data.customerName,
        inquiryNumber,
        boatName: boat.name,
        eventType: data.eventType,
        numberOfGuests: data.numberOfGuests || 'Not specified',
        preferredDate: data.preferredDate
          ? new Date(data.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : 'Not specified',
        preferredTimeSlot: data.preferredTimeSlot || 'Not specified',
      }).catch(() => {});
    } catch (emailErr) {
      // Email failure should not fail the inquiry
    }

    return formatDocument(inquiry.toObject());
  }

  /**
   * Get all inquiries (admin - paginated with filters)
   */
  async getAll(query) {
    const { page, limit, search, status, startDate, endDate, boatId } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { isDeleted: false };

    if (status) filter.status = status;
    if (boatId) filter.boatId = boatId;

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (search) {
      filter.$or = [
        { inquiryNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .populate('boatId', 'name capacityMin capacityMax basePrice')
        .populate('customerId', 'name email phone')
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return {
      inquiries: formatDocuments(inquiries),
      pagination: { page: currentPage, limit: currentLimit, total },
    };
  }

  /**
   * Get inquiry by ID (admin)
   */
  async getById(id) {
    const inquiry = await Inquiry.findOne({ _id: id, isDeleted: false })
      .populate('boatId', 'name capacityMin capacityMax basePrice locationOptions timeSlots eventTypes addOns images')
      .populate('customerId', 'name email phone')
      .populate('convertedBookingId', 'bookingNumber status')
      .lean();

    if (!inquiry) {
      throw ApiError.notFound('Inquiry not found');
    }

    return formatDocument(inquiry);
  }

  /**
   * Get customer's inquiries (public - authenticated)
   */
  async getMyInquiries(customerId, query) {
    const { page, limit } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = { customerId, isDeleted: false };

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .populate('boatId', 'name capacityMin capacityMax basePrice images')
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      Inquiry.countDocuments(filter),
    ]);

    return {
      inquiries: formatDocuments(inquiries),
      pagination: { page: currentPage, limit: currentLimit, total },
    };
  }

  /**
   * Get inquiry detail for customer (public - authenticated, own inquiry only)
   */
  async getMyInquiryById(id, customerId) {
    const inquiry = await Inquiry.findOne({ _id: id, customerId, isDeleted: false })
      .populate('boatId', 'name capacityMin capacityMax basePrice images')
      .lean();

    if (!inquiry) {
      throw ApiError.notFound('Inquiry not found');
    }

    return formatDocument(inquiry);
  }

  /**
   * Admin sends a quote for an inquiry
   */
  async sendQuote(id, data) {
    const inquiry = await Inquiry.findOne({ _id: id, isDeleted: false });

    if (!inquiry) {
      throw ApiError.notFound('Inquiry not found');
    }

    if (inquiry.status !== INQUIRY_STATUS.PENDING && inquiry.status !== INQUIRY_STATUS.QUOTED) {
      throw ApiError.badRequest(`Cannot send quote for inquiry with status: ${inquiry.status}`);
    }

    inquiry.quotedAmount = data.quotedAmount;
    inquiry.quotedDetails = data.quotedDetails;
    inquiry.quotedAt = new Date();
    inquiry.status = INQUIRY_STATUS.QUOTED;

    await inquiry.save();

    // Send quote email to customer (fire-and-forget)
    try {
      const boat = await PartyBoat.findById(inquiry.boatId).lean();
      sendInquiryQuoteEmail(inquiry.customerEmail, {
        name: inquiry.customerName,
        inquiryNumber: inquiry.inquiryNumber,
        boatName: boat ? boat.name : 'Party Boat',
        eventType: inquiry.eventType,
        quotedAmount: formatCurrency(data.quotedAmount),
        quotedDetails: data.quotedDetails,
      }).catch(() => {});
    } catch (emailErr) {
      // Email failure should not fail the quote
    }

    return formatDocument(inquiry.toObject());
  }

  /**
   * Customer responds to a quote (accept/reject)
   */
  async respondToQuote(id, customerId, response) {
    const inquiry = await Inquiry.findOne({ _id: id, customerId, isDeleted: false });

    if (!inquiry) {
      throw ApiError.notFound('Inquiry not found');
    }

    if (inquiry.status !== INQUIRY_STATUS.QUOTED) {
      throw ApiError.badRequest('Can only respond to inquiries with QUOTED status');
    }

    inquiry.status = response; // 'ACCEPTED' or 'REJECTED'
    inquiry.respondedAt = new Date();

    await inquiry.save();

    // If accepted, notify admin via email (fire-and-forget)
    if (response === INQUIRY_STATUS.ACCEPTED) {
      try {
        const boat = await PartyBoat.findById(inquiry.boatId).lean();
        sendInquiryAcceptedEmail(inquiry.customerEmail, {
          name: inquiry.customerName,
          inquiryNumber: inquiry.inquiryNumber,
          boatName: boat ? boat.name : 'Party Boat',
          quotedAmount: formatCurrency(inquiry.quotedAmount),
        }).catch(() => {});
      } catch (emailErr) {
        // Email failure should not fail the response
      }
    }

    return formatDocument(inquiry.toObject());
  }

  /**
   * Convert accepted inquiry to a party boat booking (admin)
   */
  async convertToBooking(id) {
    const inquiry = await Inquiry.findOne({ _id: id, isDeleted: false });

    if (!inquiry) {
      throw ApiError.notFound('Inquiry not found');
    }

    if (inquiry.status !== INQUIRY_STATUS.ACCEPTED) {
      throw ApiError.badRequest('Can only convert inquiries with ACCEPTED status');
    }

    if (inquiry.convertedBookingId) {
      throw ApiError.badRequest('This inquiry has already been converted to a booking');
    }

    // Validate boat still exists and is active
    const boat = await PartyBoat.findOne({ _id: inquiry.boatId, isDeleted: false });
    if (!boat) {
      throw ApiError.badRequest('The associated party boat is no longer available');
    }

    // Resolve customer (create if needed)
    let customerId = inquiry.customerId;
    if (!customerId) {
      let customer = await Customer.findOne({ email: inquiry.customerEmail });
      if (!customer) {
        customer = await Customer.findOne({ phone: inquiry.customerPhone });
      }
      if (!customer) {
        const tempPassword = await hashPassword('TempPass@' + Date.now());
        customer = await Customer.create({
          name: inquiry.customerName,
          email: inquiry.customerEmail,
          password: tempPassword,
          phone: inquiry.customerPhone,
          status: 'ACTIVE',
        });
      }
      customerId = customer._id;
    }

    // Generate booking number
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
    const bookingNumber = `${prefix}-${String(sequence).padStart(3, '0')}`;

    // Calculate pricing from quoted amount
    const quotedAmount = inquiry.quotedAmount;
    const gstAmount = Math.round((quotedAmount * 18) / 100 * 100) / 100;
    const cgst = Math.round(gstAmount / 2 * 100) / 100;
    const sgst = Math.round(gstAmount / 2 * 100) / 100;
    const totalAmount = Math.round((quotedAmount + gstAmount) * 100) / 100;

    // Create booking from inquiry data
    const booking = await PartyBoatBooking.create({
      bookingNumber,
      customerId,
      boatId: inquiry.boatId,
      date: inquiry.preferredDate || new Date(),
      timeSlot: inquiry.preferredTimeSlot || boat.timeSlots[0] || 'MORNING',
      eventType: inquiry.eventType,
      numberOfGuests: inquiry.numberOfGuests || boat.capacityMin,
      locationType: inquiry.locationType || (boat.locationOptions[0] || 'HARBOR'),
      selectedAddOns: [],
      pricing: {
        basePrice: quotedAmount,
        addOnsTotal: 0,
        subtotal: quotedAmount,
        gstPercent: 18,
        gstAmount,
        cgst,
        sgst,
        totalAmount,
        finalAmount: totalAmount,
      },
      status: 'PENDING',
      paymentStatus: 'PENDING',
      adminNotes: `Converted from inquiry ${inquiry.inquiryNumber}. Quoted amount: ${formatCurrency(quotedAmount)}`,
      createdByType: 'ADMIN',
      createdByModel: 'AdminUser',
    });

    // Update inquiry
    inquiry.status = INQUIRY_STATUS.CONVERTED;
    inquiry.convertedBookingId = booking._id;
    await inquiry.save();

    return {
      inquiry: formatDocument(inquiry.toObject()),
      booking: formatDocument(booking.toObject()),
    };
  }

  /**
   * Customer adds a callback request / note to their inquiry (public)
   */
  async addCallbackRequest(id, customerId, data) {
    const inquiry = await Inquiry.findOne({ _id: id, customerId, isDeleted: false });

    if (!inquiry) {
      throw ApiError.notFound('Inquiry not found');
    }

    // Append callback request info to specialRequests
    const callbackNote = `\n\n--- Callback Request ---\nDate: ${data.preferredDate || 'Not specified'}\nTime: ${data.preferredTime || 'Not specified'}\nPhone: ${data.phone || inquiry.customerPhone}\nRequested at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    inquiry.specialRequests = (inquiry.specialRequests || '') + callbackNote;
    await inquiry.save();

    return formatDocument(inquiry.toObject());
  }

  /**
   * Soft delete inquiry (admin)
   */
  async delete(id) {
    const inquiry = await Inquiry.findOne({ _id: id, isDeleted: false });

    if (!inquiry) {
      throw ApiError.notFound('Inquiry not found');
    }

    inquiry.isDeleted = true;
    inquiry.deletedAt = new Date();
    await inquiry.save();

    return formatDocument(inquiry.toObject());
  }
}

module.exports = new InquiriesService();
