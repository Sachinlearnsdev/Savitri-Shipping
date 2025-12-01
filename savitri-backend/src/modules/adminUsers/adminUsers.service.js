// src/modules/adminUsers/adminUsers.service.js

const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');
const { hashPassword, paginate, sanitizeUser } = require('../../utils/helpers');

class AdminUsersService {
  /**
   * Get all admin users
   */
  async getAll(query) {
    const { page, limit, search, status, roleId } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (roleId) {
      where.roleId = roleId;
    }

    const [adminUsers, total] = await Promise.all([
      prisma.adminUser.findMany({
        where,
        skip,
        take,
        include: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adminUser.count({ where }),
    ]);

    // Remove password from response
    const sanitizedUsers = adminUsers.map(user => sanitizeUser(user));

    return {
      adminUsers: sanitizedUsers,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
      },
    };
  }

  /**
   * Get admin user by ID
   */
  async getById(id) {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id },
      include: {
        role: true,
        sessions: {
          where: {
            expiresAt: { gte: new Date() },
          },
          select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!adminUser) {
      throw ApiError.notFound('Admin user not found');
    }

    return sanitizeUser(adminUser);
  }

  /**
   * Create admin user
   */
  async create(data) {
    const { name, email, phone, password, roleId } = data;

    // Check if email exists
    const existingEmail = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw ApiError.conflict('Email already exists');
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        roleId,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sanitizeUser(adminUser);
  }

  /**
   * Update admin user
   */
  async update(id, data) {
    const { name, email, phone, roleId } = data;

    // Check if admin user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw ApiError.notFound('Admin user not found');
    }

    // If email is being updated, check if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.adminUser.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw ApiError.conflict('Email already exists');
      }
    }

    // If role is being updated, check if it exists
    if (roleId && roleId !== existingUser.roleId) {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw ApiError.notFound('Role not found');
      }
    }

    // Update admin user
    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        roleId,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return sanitizeUser(updatedUser);
  }

  /**
   * Update admin user status
   */
  async updateStatus(id, status) {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!adminUser) {
      throw ApiError.notFound('Admin user not found');
    }

    // Prevent deactivating Super Admin
    if (adminUser.role.name === 'Super Admin' && status === 'INACTIVE') {
      throw ApiError.forbidden('Cannot deactivate Super Admin');
    }

    const updatedUser = await prisma.adminUser.update({
      where: { id },
      data: { status },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If deactivating, delete all sessions
    if (status === 'INACTIVE') {
      await prisma.adminSession.deleteMany({
        where: { adminUserId: id },
      });
    }

    return sanitizeUser(updatedUser);
  }

  /**
   * Delete admin user (soft delete)
   */
  async delete(id) {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!adminUser) {
      throw ApiError.notFound('Admin user not found');
    }

    // Prevent deleting Super Admin
    if (adminUser.role.name === 'Super Admin') {
      throw ApiError.forbidden('Cannot delete Super Admin');
    }

    // Update status to DELETED
    await prisma.adminUser.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    // Delete all sessions
    await prisma.adminSession.deleteMany({
      where: { adminUserId: id },
    });

    return { message: 'Admin user deleted successfully' };
  }

  /**
   * Get admin user activity log
   */
  async getActivity(id, query) {
    const { page, limit } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { adminUserId: id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where: { adminUserId: id } }),
    ]);

    return {
      activities,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
      },
    };
  }
}

module.exports = new AdminUsersService();