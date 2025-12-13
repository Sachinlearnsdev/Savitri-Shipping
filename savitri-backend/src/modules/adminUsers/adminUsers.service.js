// src/modules/adminUsers/adminUsers.service.js
const { AdminUser, Role, AdminSession, ActivityLog } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { hashPassword, paginate, sanitizeUser } = require('../../utils/helpers');
const { formatDocument, formatDocuments, formatPaginatedResponse } = require('../../utils/responseFormatter');

class AdminUsersService {
  /**
   * Get all admin users
   */
  async getAll(query) {
    const { page, limit, search, status, roleId } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (roleId) {
      filter.roleId = roleId;
    }

    const [adminUsers, total] = await Promise.all([
      AdminUser.find(filter)
        .populate('roleId', 'id name')
        .select('-password')
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      AdminUser.countDocuments(filter),
    ]);

    const formattedUsers = formatDocuments(adminUsers);

    return {
      adminUsers: formattedUsers,
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
    const adminUser = await AdminUser.findById(id)
      .populate('roleId')
      .select('-password')
      .lean();

    if (!adminUser) {
      throw ApiError.notFound('Admin user not found');
    }

    // Get active sessions
    const sessions = await AdminSession.find({
      adminUserId: id,
      expiresAt: { $gte: new Date() },
    })
      .select('id ipAddress userAgent createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = formatDocument(adminUser);
    formatted.sessions = formatDocuments(sessions);

    return formatted;
  }

  /**
   * Create admin user
   */
  async create(data) {
    const { name, email, phone, password, roleId } = data;

    // Check if email exists
    const existingEmail = await AdminUser.findOne({ email });

    if (existingEmail) {
      throw ApiError.conflict('Email already exists');
    }

    // Check if role exists
    const role = await Role.findById(roleId);

    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const adminUser = await AdminUser.create({
      name,
      email,
      phone,
      password: hashedPassword,
      roleId,
    });

    const populated = await AdminUser.findById(adminUser._id)
      .populate('roleId', 'id name')
      .select('-password')
      .lean();

    return formatDocument(populated);
  }

  /**
   * Update admin user
   */
  async update(id, data) {
    const { name, email, phone, roleId } = data;

    // Check if admin user exists
    const existingUser = await AdminUser.findById(id);

    if (!existingUser) {
      throw ApiError.notFound('Admin user not found');
    }

    // If email is being updated, check if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await AdminUser.findOne({ email });

      if (emailExists) {
        throw ApiError.conflict('Email already exists');
      }
    }

    // If role is being updated, check if it exists
    if (roleId && roleId !== existingUser.roleId.toString()) {
      const role = await Role.findById(roleId);

      if (!role) {
        throw ApiError.notFound('Role not found');
      }
    }

    // Update admin user
    const updatedUser = await AdminUser.findByIdAndUpdate(
      id,
      { name, email, phone, roleId },
      { new: true }
    )
      .populate('roleId', 'id name')
      .select('-password')
      .lean();

    return formatDocument(updatedUser);
  }

  /**
   * Update admin user status
   */
  async updateStatus(id, status) {
    const adminUser = await AdminUser.findById(id).populate('roleId');

    if (!adminUser) {
      throw ApiError.notFound('Admin user not found');
    }

    // Prevent deactivating Super Admin
    if (adminUser.roleId.name === 'Super Admin' && status === 'INACTIVE') {
      throw ApiError.forbidden('Cannot deactivate Super Admin');
    }

    const updatedUser = await AdminUser.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('roleId', 'id name')
      .select('-password')
      .lean();

    // If deactivating, delete all sessions
    if (status === 'INACTIVE') {
      await AdminSession.deleteMany({ adminUserId: id });
    }

    return formatDocument(updatedUser);
  }

  /**
   * Delete admin user (soft delete)
   */
  async delete(id) {
    const adminUser = await AdminUser.findById(id).populate('roleId');

    if (!adminUser) {
      throw ApiError.notFound('Admin user not found');
    }

    // Prevent deleting Super Admin
    if (adminUser.roleId.name === 'Super Admin') {
      throw ApiError.forbidden('Cannot delete Super Admin');
    }

    // Update status to DELETED
    await AdminUser.findByIdAndUpdate(id, { status: 'DELETED' });

    // Delete all sessions
    await AdminSession.deleteMany({ adminUserId: id });

    return { message: 'Admin user deleted successfully' };
  }

  /**
   * Get admin user activity log
   */
  async getActivity(id, query) {
    const { page, limit } = query;
    const { skip, take, page: currentPage, limit: currentLimit } = paginate(page, limit);

    const [activities, total] = await Promise.all([
      ActivityLog.find({ adminUserId: id })
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .lean(),
      ActivityLog.countDocuments({ adminUserId: id }),
    ]);

    return {
      activities: formatDocuments(activities),
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
      },
    };
  }
}

module.exports = new AdminUsersService();