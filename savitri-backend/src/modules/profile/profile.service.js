// src/modules/profile/profile.service.js

const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');
const { hashPassword, comparePassword, sanitizeUser } = require('../../utils/helpers');
const { createOTP, verifyOTP } = require('../../utils/otp');
const { sendEmailVerificationOTP, sendPasswordChangedEmail } = require('../../utils/email');
const { sendPhoneVerificationOTP } = require('../../utils/sms');
const { OTP_TYPE } = require('../../config/constants');
const path = require('path');
const fs = require('fs');
const config = require('../../config/env');

class ProfileService {
  /**
   * Get profile
   */
  async getProfile(customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        emailVerified: true,
        phoneVerified: true,
        emailNotifications: true,
        smsNotifications: true,
        promotionalEmails: true,
        createdAt: true,
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    return customer;
  }

  /**
   * Update profile
   */
  async updateProfile(customerId, data) {
    const { name } = data;

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
      },
    });

    return customer;
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(customerId, file) {
    if (!file) {
      throw ApiError.badRequest('No file uploaded');
    }

    // Get current customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    // Delete old avatar if exists
    if (customer.avatar) {
      const oldAvatarPath = path.join(config.uploadPath, path.basename(customer.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update avatar URL
    const avatarUrl = `/uploads/${file.filename}`;
    
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    return updatedCustomer;
  }

  /**
   * Change password
   */
  async changePassword(customerId, currentPassword, newPassword) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

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
    await prisma.customer.update({
      where: { id: customerId },
      data: { password: hashedPassword },
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
    const existingEmail = await prisma.customer.findUnique({
      where: { email: newEmail },
    });

    if (existingEmail && existingEmail.id !== customerId) {
      throw ApiError.conflict('Email already in use');
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    // Generate and send OTP
    const otp = await createOTP(newEmail, OTP_TYPE.EMAIL_CHANGE);
    await sendEmailVerificationOTP(newEmail, customer.name, otp);

    // Store pending email in a temporary way (you could use a separate table or cache)
    // For now, we'll verify it in the next step
    
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

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        email: newEmail,
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return customer;
  }

  /**
   * Update phone - Step 1: Send OTP
   */
  async updatePhone(customerId, newPhone) {
    // Check if phone is already taken
    const existingPhone = await prisma.customer.findUnique({
      where: { phone: newPhone },
    });

    if (existingPhone && existingPhone.id !== customerId) {
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

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        phone: newPhone,
        phoneVerified: true,
      },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    return customer;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(customerId, preferences) {
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: preferences,
      select: {
        id: true,
        emailNotifications: true,
        smsNotifications: true,
        promotionalEmails: true,
      },
    });

    return customer;
  }

  /**
   * Get active sessions
   */
  async getSessions(customerId) {
    const sessions = await prisma.customerSession.findMany({
      where: {
        customerId,
        expiresAt: { gte: new Date() },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions;
  }

  /**
   * Delete specific session
   */
  async deleteSession(customerId, sessionId) {
    await prisma.customerSession.deleteMany({
      where: {
        id: sessionId,
        customerId,
      },
    });

    return { message: 'Session deleted successfully' };
  }

  /**
   * Delete all sessions (logout from all devices)
   */
  async deleteAllSessions(customerId) {
    await prisma.customerSession.deleteMany({
      where: { customerId },
    });

    return { message: 'Logged out from all devices successfully' };
  }

  /**
   * Get login history
   */
  async getLoginHistory(customerId) {
    const history = await prisma.loginHistory.findMany({
      where: { customerId },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    return history;
  }

  /**
   * Delete account (soft delete)
   */
  async deleteAccount(customerId) {
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });

    // Delete all sessions
    await prisma.customerSession.deleteMany({
      where: { customerId },
    });

    return { message: 'Account deleted successfully' };
  }
}

module.exports = new ProfileService();