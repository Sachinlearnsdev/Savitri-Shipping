// src/modules/customers/customers.service.js

const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');
const { paginate, sanitizeUser } = require('../../utils/helpers');

class CustomersService {
  /**
   * Get all customers
   */
  async getAll(query) {
    const { page, limit, search, status, emailVerified, phoneVerified } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (emailVerified !== undefined) {
      where.emailVerified = emailVerified === 'true';
    }

    if (phoneVerified !== undefined) {
      where.phoneVerified = phoneVerified === 'true';
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          emailVerified: true,
          phoneVerified: true,
          status: true,
          lastLogin: true,
          createdAt: true,
          _count: {
            select: {
              savedVehicles: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
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
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        emailVerified: true,
        phoneVerified: true,
        status: true,
        emailNotifications: true,
        smsNotifications: true,
        promotionalEmails: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        savedVehicles: true,
        loginHistory: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    return customer;
  }

  /**
   * Get customer bookings
   */
  async getBookings(id, query) {
    const { page, limit } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
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
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
      },
    });

    // If deactivating, delete all sessions
    if (status === 'INACTIVE') {
      await prisma.customerSession.deleteMany({
        where: { customerId: id },
      });
    }

    return updatedCustomer;
  }
}

module.exports = new CustomersService();