// src/modules/customers/customers.service.js
const {
  Customer,
  SavedVehicle,
  LoginHistory,
  CustomerSession,
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

    // Get saved vehicles count for each customer
    const customersWithCounts = await Promise.all(
      customers.map(async (customer) => {
        const vehicleCount = await SavedVehicle.countDocuments({
          customerId: customer._id,
        });
        return {
          ...customer,
          savedVehiclesCount: vehicleCount,
        };
      })
    );

    return {
      customers: formatDocuments(customersWithCounts),
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

    // Get saved vehicles
    const savedVehicles = await SavedVehicle.find({ customerId: id })
      .sort({ createdAt: -1 })
      .lean();

    // Get login history
    const loginHistory = await LoginHistory.find({ customerId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formatted = formatDocument(customer);
    formatted.savedVehicles = formatDocuments(savedVehicles);
    formatted.loginHistory = formatDocuments(loginHistory);

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

    // Note: Booking model will be created in Phase 2
    // For now, return empty array
    return {
      bookings: [],
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total: 0,
      },
    };
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
