// src/modules/auth/auth.service.js

const prisma = require('../../config/database');
const ApiError = require('../../utils/ApiError');
const { hashPassword, comparePassword, getClientIP, getUserAgent, addHours } = require('../../utils/helpers');
const { generateAccessToken } = require('../../utils/jwt');
const { createOTP, verifyOTP } = require('../../utils/otp');
const { sendWelcomeEmail, sendEmailVerificationOTP, sendLoginOTP, sendPasswordResetOTP, sendPasswordChangedEmail } = require('../../utils/email');
const { sendPhoneVerificationOTP, sendLoginOTP: sendPhoneLoginOTP } = require('../../utils/sms');
const { USER_STATUS, OTP_TYPE, ACCOUNT_LOCK } = require('../../config/constants');

class AuthService {
  /**
   * Customer registration
   */
  async register(data, req) {
    const { name, email, phone, password } = data;

    // Check if email already exists
    const existingEmail = await prisma.customer.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw ApiError.conflict('Email already registered');
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await prisma.customer.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        throw ApiError.conflict('Phone number already registered');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    // Generate and send email verification OTP
    const emailOTP = await createOTP(email, OTP_TYPE.EMAIL_VERIFICATION);
    await sendEmailVerificationOTP(email, name, emailOTP);

    // If phone provided, generate and send phone verification OTP
    if (phone) {
      const phoneOTP = await createOTP(phone, OTP_TYPE.PHONE_VERIFICATION);
      await sendPhoneVerificationOTP(phone, phoneOTP);
    }

    // Send welcome email
    await sendWelcomeEmail(email, name);

    return {
      message: 'Registration successful. Please verify your email',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
    };
  }

  /**
   * Verify email
   */
  async verifyEmail(email, otp) {
    const otpResult = await verifyOTP(email, otp, OTP_TYPE.EMAIL_VERIFICATION);

    if (!otpResult.success) {
      throw ApiError.unauthorized(otpResult.message);
    }

    // Update customer
    await prisma.customer.update({
      where: { email },
      data: { emailVerified: true },
    });

    return { message: 'Email verified successfully' };
  }

  /**
   * Verify phone
   */
  async verifyPhone(phone, otp) {
    const otpResult = await verifyOTP(phone, otp, OTP_TYPE.PHONE_VERIFICATION);

    if (!otpResult.success) {
      throw ApiError.unauthorized(otpResult.message);
    }

    // Update customer
    await prisma.customer.update({
      where: { phone },
      data: { phoneVerified: true },
    });

    return { message: 'Phone verified successfully' };
  }

  /**
   * Login with email and password
   */
  async login(email, password, req) {
    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if account is active
    if (customer.status !== USER_STATUS.ACTIVE) {
      throw ApiError.forbidden('Account is not active');
    }

    // Check if account is locked
    if (customer.lockedUntil && new Date() < customer.lockedUntil) {
      const remainingMinutes = Math.ceil((customer.lockedUntil - new Date()) / (1000 * 60));
      throw ApiError.forbidden(`Account is locked. Try again in ${remainingMinutes} minutes`);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, customer.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = customer.failedAttempts + 1;
      const updateData = { failedAttempts };

      if (failedAttempts >= ACCOUNT_LOCK.MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = addHours(new Date(), ACCOUNT_LOCK.LOCK_DURATION_MINUTES / 60);
      }

      await prisma.customer.update({
        where: { id: customer.id },
        data: updateData,
      });

      throw ApiError.unauthorized('Invalid email or password');
    }

    // Reset failed attempts
    if (customer.failedAttempts > 0) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    }

    // Generate JWT token
    const token = generateAccessToken({
      customerId: customer.id,
      email: customer.email,
    });

    // Create session
    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        token,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        expiresAt: addHours(new Date(), 24 * 7), // 7 days
      },
    });

    // Update last login
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLogin: new Date() },
    });

    // Add to login history
    await prisma.loginHistory.create({
      data: {
        customerId: customer.id,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        success: true,
      },
    });

    return {
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
        emailVerified: customer.emailVerified,
        phoneVerified: customer.phoneVerified,
      },
    };
  }

  /**
   * Login with phone - Step 1: Send OTP
   */
  async loginWithPhone(phone, req) {
    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer) {
      throw ApiError.unauthorized('Phone number not registered');
    }

    if (customer.status !== USER_STATUS.ACTIVE) {
      throw ApiError.forbidden('Account is not active');
    }

    if (!customer.phoneVerified) {
      throw ApiError.forbidden('Phone number not verified. Please verify your phone first');
    }

    // Generate and send OTP
    const otp = await createOTP(phone, OTP_TYPE.LOGIN);
    await sendPhoneLoginOTP(phone, otp);

    return { message: 'OTP sent to your phone', phone };
  }

  /**
   * Login with phone - Step 2: Verify OTP
   */
  async verifyLoginOTP(phone, otp, req) {
    const otpResult = await verifyOTP(phone, otp, OTP_TYPE.LOGIN);

    if (!otpResult.success) {
      throw ApiError.unauthorized(otpResult.message);
    }

    // Find customer
    const customer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer) {
      throw ApiError.unauthorized('Customer not found');
    }

    // Generate JWT token
    const token = generateAccessToken({
      customerId: customer.id,
      email: customer.email,
    });

    // Create session
    await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        token,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        expiresAt: addHours(new Date(), 24 * 7),
      },
    });

    // Update last login
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLogin: new Date() },
    });

    // Add to login history
    await prisma.loginHistory.create({
      data: {
        customerId: customer.id,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        success: true,
      },
    });

    return {
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
        emailVerified: customer.emailVerified,
        phoneVerified: customer.phoneVerified,
      },
    };
  }

  /**
   * Logout
   */
  async logout(customerId, token) {
    await prisma.customerSession.deleteMany({
      where: { customerId, token },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return { message: 'If the email exists, a password reset OTP has been sent' };
    }

    const otp = await createOTP(email, OTP_TYPE.PASSWORD_RESET);
    await sendPasswordResetOTP(email, customer.name, otp);

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

    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    // Delete all sessions
    await prisma.customerSession.deleteMany({
      where: { customerId: customer.id },
    });

    await sendPasswordChangedEmail(email, customer.name);

    return { message: 'Password reset successfully. Please login with your new password' };
  }

  /**
   * Resend OTP
   */
  async resendOTP(identifier, type) {
    let otpType, customer;

    if (type === 'email') {
      otpType = OTP_TYPE.EMAIL_VERIFICATION;
      customer = await prisma.customer.findUnique({ where: { email: identifier } });
      
      if (!customer) {
        throw ApiError.notFound('Email not found');
      }

      const otp = await createOTP(identifier, otpType);
      await sendEmailVerificationOTP(identifier, customer.name, otp);
    } else {
      otpType = OTP_TYPE.PHONE_VERIFICATION;
      customer = await prisma.customer.findUnique({ where: { phone: identifier } });
      
      if (!customer) {
        throw ApiError.notFound('Phone number not found');
      }

      const otp = await createOTP(identifier, otpType);
      await sendPhoneVerificationOTP(identifier, otp);
    }

    return { message: 'OTP sent successfully' };
  }
}

module.exports = new AuthService();