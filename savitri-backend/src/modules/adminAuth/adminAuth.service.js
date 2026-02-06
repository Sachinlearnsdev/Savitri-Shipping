// src/modules/adminAuth/adminAuth.service.js
const { AdminUser, Role, AdminSession } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { hashPassword, comparePassword, getClientIP, getUserAgent, addHours } = require('../../utils/helpers');
const { generateAccessToken } = require('../../utils/jwt');
const { createOTP, verifyOTP } = require('../../utils/otp');
const { sendLoginOTP, sendPasswordResetOTP, sendPasswordChangedEmail } = require('../../utils/email');
const { formatDocument } = require('../../utils/responseFormatter');
const { USER_STATUS, OTP_TYPE, ACCOUNT_LOCK } = require('../../config/constants');

class AdminAuthService {
  /**
   * Admin login - Step 1: Verify credentials and send OTP
   */
  async login(email, password, req) {
    const adminUser = await AdminUser.findOne({ email }).populate('roleId');

    if (!adminUser) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (adminUser.status !== USER_STATUS.ACTIVE) {
      throw ApiError.forbidden('Account is not active');
    }

    if (adminUser.lockedUntil && new Date() < adminUser.lockedUntil) {
      const remainingMinutes = Math.ceil((adminUser.lockedUntil - new Date()) / (1000 * 60));
      throw ApiError.forbidden(`Account is locked. Try again in ${remainingMinutes} minutes`);
    }

    const isPasswordValid = await comparePassword(password, adminUser.password);

    if (!isPasswordValid) {
      const failedAttempts = adminUser.failedAttempts + 1;
      const updateData = { failedAttempts };

      if (failedAttempts >= ACCOUNT_LOCK.MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = addHours(new Date(), ACCOUNT_LOCK.LOCK_DURATION_MINUTES / 60);
      }

      await AdminUser.findByIdAndUpdate(adminUser._id, updateData);
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (adminUser.failedAttempts > 0) {
      await AdminUser.findByIdAndUpdate(adminUser._id, {
        failedAttempts: 0,
        lockedUntil: null,
      });
    }

    const otp = await createOTP(email, OTP_TYPE.LOGIN);
    await sendLoginOTP(email, adminUser.name, otp);

    return {
      message: 'OTP sent to your email',
      email: adminUser.email,
    };
  }

  /**
   * Admin login - Step 2: Verify OTP and complete login
   */
  async verifyOTP(email, otp, req) {
    const otpResult = await verifyOTP(email, otp, OTP_TYPE.LOGIN);

    if (!otpResult.success) {
      throw ApiError.unauthorized(otpResult.message);
    }

    const adminUser = await AdminUser.findOne({ email }).populate('roleId');

    if (!adminUser) {
      throw ApiError.unauthorized('Admin user not found');
    }

    const token = generateAccessToken({
      adminUserId: adminUser._id.toString(),
      email: adminUser.email,
      roleId: adminUser.roleId._id.toString(),
    });

    await AdminSession.create({
      adminUserId: adminUser._id,
      token,
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
      expiresAt: addHours(new Date(), 24 * 7),
    });

    await AdminUser.findByIdAndUpdate(adminUser._id, {
      lastLogin: new Date(),
    });

    return {
      token,
      user: formatDocument({
        id: adminUser._id.toString(),
        email: adminUser.email,
        name: adminUser.name,
        phone: adminUser.phone,
        avatar: adminUser.avatar,
        role: {
          id: adminUser.roleId._id.toString(),
          name: adminUser.roleId.name,
          permissions: adminUser.roleId.permissions,
        },
      }),
    };
  }

  /**
   * Admin logout
   */
  async logout(adminUserId, token, req) {
    await AdminSession.deleteMany({
      adminUserId,
      token,
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Forgot password - Send OTP
   */
  async forgotPassword(email) {
    const adminUser = await AdminUser.findOne({ email });

    if (!adminUser) {
      return { message: 'If the email exists, a password reset OTP has been sent' };
    }

    const otp = await createOTP(email, OTP_TYPE.PASSWORD_RESET);
    await sendPasswordResetOTP(email, adminUser.name, otp);

    return { message: 'Password reset OTP sent to your email' };
  }

  /**
   * Reset password
   */
  async resetPassword(email, otp, newPassword) {
    const otpResult = await verifyOTP(email, otp, OTP_TYPE.PASSWORD_RESET);

    if (!otpResult.success) {
      throw ApiError.unauthorized(otpResult.message);
    }

    const adminUser = await AdminUser.findOne({ email });

    if (!adminUser) {
      throw ApiError.notFound('Admin user not found');
    }

    const hashedPassword = await hashPassword(newPassword);

    await AdminUser.findByIdAndUpdate(adminUser._id, {
      password: hashedPassword,
      failedAttempts: 0,
      lockedUntil: null,
    });

    await AdminSession.deleteMany({ adminUserId: adminUser._id });

    await sendPasswordChangedEmail(email, adminUser.name);

    return { message: 'Password reset successfully. Please login with your new password' };
  }

  /**
   * Refresh token
   */
  async refreshToken(adminUserId) {
    const adminUser = await AdminUser.findById(adminUserId).populate('roleId');

    if (!adminUser) {
      throw ApiError.unauthorized('Admin user not found');
    }

    const token = generateAccessToken({
      adminUserId: adminUser._id.toString(),
      email: adminUser.email,
      roleId: adminUser.roleId._id.toString(),
    });

    return { token };
  }
}

module.exports = new AdminAuthService();