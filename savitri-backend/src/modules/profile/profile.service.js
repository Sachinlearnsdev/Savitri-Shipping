// src/modules/profile/profile.service.js
const { Customer, CustomerSession, LoginHistory } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { hashPassword, comparePassword } = require('../../utils/helpers');
const { createOTP, verifyOTP } = require('../../utils/otp');
const { sendEmailVerificationOTP, sendPasswordChangedEmail } = require('../../utils/email');
const { sendPhoneVerificationOTP } = require('../../utils/sms');
const { OTP_TYPE } = require('../../config/constants');
const { formatDocument, formatDocuments } = require('../../utils/responseFormatter');
const { uploadToCloudinary, deleteFromCloudinary } = require('../../utils/cloudinaryUpload');

class ProfileService {
  /**
   * Get profile
   */
  async getProfile(customerId) {
    const customer = await Customer.findById(customerId)
      .select('id name email phone avatar dateOfBirth gender address notificationPreferences emailVerified phoneVerified emailNotifications smsNotifications promotionalEmails createdAt')
      .lean();

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    return formatDocument(customer);
  }

  /**
   * Update profile
   */
  async updateProfile(customerId, data) {
    const { name, dateOfBirth, gender, address, notificationPreferences } = data;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (notificationPreferences !== undefined) updateData.notificationPreferences = notificationPreferences;

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true }
    )
      .select('id name email phone avatar dateOfBirth gender address notificationPreferences')
      .lean();

    return formatDocument(customer);
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(customerId, file) {
    if (!file) {
      throw ApiError.badRequest('No file uploaded');
    }

    // Get current customer
    const customer = await Customer.findById(customerId);

    // Delete old avatar from Cloudinary if exists
    if (customer.avatarPublicId) {
      try {
        await deleteFromCloudinary(customer.avatarPublicId);
      } catch (err) {
        console.error('Failed to delete old avatar from Cloudinary:', err.message);
      }
    }

    // Upload new avatar to Cloudinary
    const { url, publicId } = await uploadToCloudinary(file.buffer, 'savitri-shipping/avatars');

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { avatar: url, avatarPublicId: publicId },
      { new: true }
    )
      .select('id name avatar')
      .lean();

    return formatDocument(updatedCustomer);
  }

  /**
   * Remove avatar (revert to initials)
   */
  async removeAvatar(customerId) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    // Delete from Cloudinary if exists
    if (customer.avatarPublicId) {
      try {
        await deleteFromCloudinary(customer.avatarPublicId);
      } catch (err) {
        console.error('Failed to delete avatar from Cloudinary:', err.message);
      }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $unset: { avatar: 1, avatarPublicId: 1 } },
      { new: true }
    )
      .select('id name avatar')
      .lean();

    return formatDocument(updatedCustomer);
  }

  /**
   * Change password
   */
  async changePassword(customerId, currentPassword, newPassword) {
    const customer = await Customer.findById(customerId);

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, customer.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await Customer.findByIdAndUpdate(customerId, {
      password: hashedPassword,
    });

    // Send confirmation email
    await sendPasswordChangedEmail(customer.email, customer.name);

    return { message: 'Password changed successfully' };
  }

  /**
   * Update email - Step 1: Send OTP
   */
  async updateEmail(customerId, newEmail) {
    // Check if email is already taken
    const existingEmail = await Customer.findOne({ email: newEmail });

    if (existingEmail && existingEmail._id.toString() !== customerId) {
      throw ApiError.conflict('Email already in use');
    }

    const customer = await Customer.findById(customerId);

    // Generate and send OTP
    const otp = await createOTP(newEmail, OTP_TYPE.EMAIL_CHANGE);
    await sendEmailVerificationOTP(newEmail, customer.name, otp);

    return { message: 'OTP sent to new email address', email: newEmail };
  }

  /**
   * Update email - Step 2: Verify OTP and update
   */
  async verifyEmailChange(customerId, newEmail, otp) {
    const otpResult = await verifyOTP(newEmail, otp, OTP_TYPE.EMAIL_CHANGE);

    if (!otpResult.success) {
      throw ApiError.unauthorized(otpResult.message);
    }

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      {
        email: newEmail,
        emailVerified: true,
      },
      { new: true }
    )
      .select('id name email')
      .lean();

    return formatDocument(customer);
  }

  /**
   * Update phone - Step 1: Send OTP
   */
  async updatePhone(customerId, newPhone) {
    // Check if phone is already taken
    const existingPhone = await Customer.findOne({ phone: newPhone });

    if (existingPhone && existingPhone._id.toString() !== customerId) {
      throw ApiError.conflict('Phone number already in use');
    }

    // Generate and send OTP
    const otp = await createOTP(newPhone, OTP_TYPE.PHONE_CHANGE);
    await sendPhoneVerificationOTP(newPhone, otp);

    return { message: 'OTP sent to new phone number', phone: newPhone };
  }

  /**
   * Update phone - Step 2: Verify OTP and update
   */
  async verifyPhoneChange(customerId, newPhone, otp) {
    const otpResult = await verifyOTP(newPhone, otp, OTP_TYPE.PHONE_CHANGE);

    if (!otpResult.success) {
      throw ApiError.unauthorized(otpResult.message);
    }

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      {
        phone: newPhone,
        phoneVerified: true,
      },
      { new: true }
    )
      .select('id name phone')
      .lean();

    return formatDocument(customer);
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(customerId, preferences) {
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      preferences,
      { new: true }
    )
      .select('id emailNotifications smsNotifications promotionalEmails')
      .lean();

    return formatDocument(customer);
  }

  /**
   * Get active sessions
   */
  async getSessions(customerId) {
    const sessions = await CustomerSession.find({
      customerId,
      expiresAt: { $gte: new Date() },
    })
      .select('id ipAddress userAgent createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return formatDocuments(sessions);
  }

  /**
   * Delete specific session
   */
  async deleteSession(customerId, sessionId) {
    await CustomerSession.deleteMany({
      _id: sessionId,
      customerId,
    });

    return { message: 'Session deleted successfully' };
  }

  /**
   * Delete all sessions (logout from all devices)
   */
  async deleteAllSessions(customerId) {
    await CustomerSession.deleteMany({ customerId });

    return { message: 'Logged out from all devices successfully' };
  }

  /**
   * Get login history
   */
  async getLoginHistory(customerId) {
    const history = await LoginHistory.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return formatDocuments(history);
  }

  /**
   * Delete account (soft delete)
   */
  async deleteAccount(customerId) {
    await Customer.findByIdAndUpdate(customerId, {
      status: 'DELETED',
      deletedAt: new Date(),
    });

    // Delete all sessions
    await CustomerSession.deleteMany({ customerId });

    return { message: 'Account deleted successfully' };
  }
}

module.exports = new ProfileService();