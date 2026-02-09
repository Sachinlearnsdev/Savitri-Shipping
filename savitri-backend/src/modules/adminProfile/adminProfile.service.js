// src/modules/adminProfile/adminProfile.service.js

const { AdminUser } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { hashPassword, comparePassword } = require('../../utils/helpers');
const { formatDocument } = require('../../utils/responseFormatter');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinaryUpload');

class AdminProfileService {
  /**
   * Get admin profile
   */
  async getProfile(adminUserId) {
    const admin = await AdminUser.findById(adminUserId)
      .select('-password -failedAttempts -lockedUntil')
      .populate('roleId', 'name')
      .lean();

    if (!admin) {
      throw ApiError.notFound('Admin user not found');
    }

    return formatDocument(admin);
  }

  /**
   * Update admin profile
   */
  async updateProfile(adminUserId, data) {
    const { name, phone, designation, department, employeeId, dateOfBirth, joiningDate, address } = data;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (designation !== undefined) updateData.designation = designation;
    if (department !== undefined) updateData.department = department;
    if (employeeId !== undefined) updateData.employeeId = employeeId;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (joiningDate !== undefined) updateData.joiningDate = joiningDate;
    if (address !== undefined) updateData.address = address;

    const admin = await AdminUser.findByIdAndUpdate(
      adminUserId,
      updateData,
      { new: true }
    )
      .select('-password -failedAttempts -lockedUntil')
      .populate('roleId', 'name')
      .lean();

    if (!admin) {
      throw ApiError.notFound('Admin user not found');
    }

    return formatDocument(admin);
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(adminUserId, file) {
    if (!file) {
      throw ApiError.badRequest('No file uploaded');
    }

    // Get current admin
    const admin = await AdminUser.findById(adminUserId);
    if (!admin) {
      throw ApiError.notFound('Admin user not found');
    }

    // Delete old avatar from Cloudinary if exists
    if (admin.avatarPublicId) {
      try {
        await deleteFromCloudinary(admin.avatarPublicId);
      } catch (err) {
        console.error('Failed to delete old avatar from Cloudinary:', err.message);
      }
    }

    // Upload new avatar to Cloudinary
    const { url, publicId } = await uploadToCloudinary(file.buffer, 'savitri-shipping/admin-avatars');

    const updatedAdmin = await AdminUser.findByIdAndUpdate(
      adminUserId,
      { avatar: url, avatarPublicId: publicId },
      { new: true }
    )
      .select('name avatar')
      .lean();

    return formatDocument(updatedAdmin);
  }

  /**
   * Remove avatar
   */
  async removeAvatar(adminUserId) {
    const admin = await AdminUser.findById(adminUserId);
    if (!admin) {
      throw ApiError.notFound('Admin user not found');
    }

    // Delete from Cloudinary if exists
    if (admin.avatarPublicId) {
      try {
        await deleteFromCloudinary(admin.avatarPublicId);
      } catch (err) {
        console.error('Failed to delete avatar from Cloudinary:', err.message);
      }
    }

    const updatedAdmin = await AdminUser.findByIdAndUpdate(
      adminUserId,
      { $unset: { avatar: 1, avatarPublicId: 1 } },
      { new: true }
    )
      .select('name avatar')
      .lean();

    return formatDocument(updatedAdmin);
  }

  /**
   * Change password
   */
  async changePassword(adminUserId, currentPassword, newPassword) {
    const admin = await AdminUser.findById(adminUserId);

    if (!admin) {
      throw ApiError.notFound('Admin user not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, admin.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await AdminUser.findByIdAndUpdate(adminUserId, {
      password: hashedPassword,
    });

    return { message: 'Password changed successfully' };
  }
}

module.exports = new AdminProfileService();
