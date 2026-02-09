// src/modules/customers/customers.service.js
const {
  Customer,
  CustomerSession,
  SpeedBoatBooking,
} = require("../../models");
const ApiError = require("../../utils/ApiError");
const { paginate } = require("../../utils/helpers");
const {
  formatDocument,
  formatDocuments,
} = require("../../utils/responseFormatter");

class CustomersService {
  /**
   * Get all customers
   */
  async getAll(query) {
    const { page, limit, search, status, emailVerified, phoneVerified } = query;
    const {
      skip,
      take,
      page: currentPage,
      limit: currentLimit,
    } = paginate(page, limit);

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (emailVerified !== undefined) {
      filter.emailVerified = emailVerified === "true";
    }

    if (phoneVerified !== undefined) {
      filter.phoneVerified = phoneVerified === "true";
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .select(
          "name email phone avatar emailVerified phoneVerified status lastLogin createdAt"
        )
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      Customer.countDocuments(filter),
    ]);

    return {
      customers: formatDocuments(customers),
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
      },
    };
  }

  /**
   * Get customer by ID
   */
  async getById(id) {
    const customer = await Customer.findById(id).select("-password").lean();

    if (!customer) {
      throw ApiError.notFound("Customer not found");
    }

    // Get booking stats
    const [totalBookings, completedBookings] = await Promise.all([
      SpeedBoatBooking.countDocuments({ customerId: id, isDeleted: { $ne: true } }),
      SpeedBoatBooking.countDocuments({ customerId: id, status: 'COMPLETED', isDeleted: { $ne: true } }),
    ]);

    // Get total spent
    const spentResult = await SpeedBoatBooking.aggregate([
      { $match: { customerId: customer._id, paymentStatus: 'PAID', isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$pricing.finalAmount' } } },
    ]);

    const formatted = formatDocument(customer);
    formatted.totalBookings = totalBookings;
    formatted.completedBookings = completedBookings;
    formatted.totalSpent = spentResult[0]?.total || 0;

    return formatted;
  }

  /**
   * Get customer bookings
   */
  async getBookings(id, query) {
    const { page, limit } = query;
    const {
      skip,
      take,
      page: currentPage,
      limit: currentLimit,
    } = paginate(page, limit);

    // Check if customer exists
    const customer = await Customer.findById(id);

    if (!customer) {
      throw ApiError.notFound("Customer not found");
    }

    const filter = { customerId: id, isDeleted: { $ne: true } };

    const [bookings, total] = await Promise.all([
      SpeedBoatBooking.find(filter)
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
   * Toggle venue payment allowed
   */
  async toggleVenuePayment(id, venuePaymentAllowed) {
    const customer = await Customer.findById(id);

    if (!customer) {
      throw ApiError.notFound("Customer not found");
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { venuePaymentAllowed: !!venuePaymentAllowed },
      { new: true }
    )
      .select("id name email venuePaymentAllowed completedRidesCount")
      .lean();

    return formatDocument(updatedCustomer);
  }

  /**
   * Update customer status
   */
  async updateStatus(id, status) {
    const customer = await Customer.findById(id);

    if (!customer) {
      throw ApiError.notFound("Customer not found");
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .select("id name email phone status")
      .lean();

    // If deactivating, delete all sessions
    if (status === "INACTIVE") {
      await CustomerSession.deleteMany({ customerId: id });
    }

    return formatDocument(updatedCustomer);
  }
}

module.exports = new CustomersService();
