// src/modules/adminAuth/adminAuth.service.js

const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');
const { hashPassword, comparePassword, sanitizeUser, getClientIP, getUserAgent, addHours } = require('../../utils/helpers');
const { generateAccessToken, setTokenCookie, clearTokenCookie } = require('../../utils/jwt');
const { createOTP, verifyOTP } = require('../../utils/otp');
const { sendLoginOTP, sendPasswordResetOTP, sendPasswordChangedEmail } = require('../../utils/email');
const { USER_STATUS, OTP_TYPE, ACCOUNT_LOCK } = require('../../config/constants');

class AdminAuthService {
  /**
   * Admin login - Step 1: Verify credentials and send OTP
   */
  async login(email, password, req) {
    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!adminUser) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if account is active
    if (adminUser.status !== USER_STATUS.ACTIVE) {
      throw ApiError.forbidden('Account is not active');
    }

    // Check if account is locked
    if (adminUser.lockedUntil && new Date() < adminUser.lockedUntil) {
      const remainingMinutes = Math.ceil((adminUser.lockedUntil - new Date()) / (1000 * 60));
      throw ApiError.forbidden(`Account is locked. Try again in ${remainingMinutes} minutes`);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, adminUser.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = adminUser.failedAttempts + 1;
      const updateData = { failedAttempts };

      // Lock account after max failed attempts
      if (failedAttempts >= ACCOUNT_LOCK.MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = addHours(new Date(), ACCOUNT_LOCK.LOCK_DURATION_MINUTES / 60);
      }

      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: updateData,
      });

      throw ApiError.unauthorized('Invalid email or password');
    }

    // Reset failed attempts if password is correct
    if (adminUser.failedAttempts > 0) {
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    }

    // Generate and send OTP
    const otp = await createOTP(email, OTP_TYPE.LOGIN);
    await sendLoginOTP(email, adminUser.name, otp);

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminUserId: adminUser.id,
        action: 'LOGIN_ATTEMPT',
        module: 'auth',
        description: 'Login OTP sent',
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
      },
    });

    return {
      message: 'OTP sent to your email',
      email: adminUser.email,
    };
  }

  /**
   * Admin login - Step 2: Verify OTP and complete login
   */
  async verifyOTP(email, otp, req) {
    // Verify OTP
    const otpResult = await verifyOTP(email, otp, OTP_TYPE.LOGIN);

    if (!otpResult.success) {
      throw ApiError.unauthorized(otpResult.message);
    }

    // Get admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!adminUser) {
      throw ApiError.unauthorized('Admin user not found');
    }

    // Generate JWT token
    const token = generateAccessToken({
      adminUserId: adminUser.id,
      email: adminUser.email,
      roleId: adminUser.roleId,
    });

    // Create session
    await prisma.adminSession.create({
      data: {
        adminUserId: adminUser.id,
        token,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        expiresAt: addHours(new Date(), 24 * 7), // 7 days
      },
    });

    // Update last login
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLogin: new Date() },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminUserId: adminUser.id,
        action: 'LOGIN',
        module: 'auth',
        description: 'Successful login',
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
      },
    });

    return {
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        phone: adminUser.phone,
        avatar: adminUser.avatar,
        role: {
          id: adminUser.role.id,
          name: adminUser.role.name,
          permissions: adminUser.role.permissions,
        },
      },
    };
  }

  /**
   * Admin logout
   */
  async logout(adminUserId, token, req) {
    // Delete session
    await prisma.adminSession.deleteMany({
      where: {
        adminUserId,
        token,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminUserId,
        action: 'LOGOUT',
        module: 'auth',
        description: 'User logged out',
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
      },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Forgot password - Send OTP
   */
  async forgotPassword(email) {
    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    // Don't reveal if email exists (security)
    if (!adminUser) {
      return { message: 'If the email exists, a password reset OTP has been sent' };
    }

    // Generate and send OTP
    const otp = await createOTP(email, OTP_TYPE.PASSWORD_RESET);
    await sendPasswordResetOTP(email, adminUser.name, otp);

    return { message: 'Password reset OTP sent to your email' };
  }

  /**
   * Reset password
   */
  async resetPassword(email, otp, newPassword) {
    // Verify OTP
    const otpResult = await verifyOTP(email, otp, OTP_TYPE.PASSWORD_RESET);

    if (!otpResult.success) {
      throw ApiError.unauthorized(otpResult.message);
    }

    // Find admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!adminUser) {
      throw ApiError.notFound('Admin user not found');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: {
        password: hashedPassword,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    // Delete all sessions (force re-login)
    await prisma.adminSession.deleteMany({
      where: { adminUserId: adminUser.id },
    });

    // Send confirmation email
    await sendPasswordChangedEmail(email, adminUser.name);

    // Log activity
    await prisma.activityLog.create({
      data: {
        adminUserId: adminUser.id,
        action: 'PASSWORD_RESET',
        module: 'auth',
        description: 'Password reset successfully',
      },
    });

    return { message: 'Password reset successfully. Please login with your new password' };
  }

  /**
   * Refresh token
   */
  async refreshToken(adminUserId) {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: adminUserId },
      include: { role: true },
    });

    if (!adminUser) {
      throw ApiError.unauthorized('Admin user not found');
    }

    const token = generateAccessToken({
      adminUserId: adminUser.id,
      email: adminUser.email,
      roleId: adminUser.roleId,
    });

    return { token };
  }
}

module.exports = new AdminAuthService();