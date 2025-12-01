// src/utils/otp.js

const prisma = require('../config/database');
const { OTP } = require('../config/constants');

/**
 * Generate random OTP
 */
const generateOTP = (length = OTP.LENGTH) => {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

/**
 * Create and store OTP
 */
const createOTP = async (identifier, type) => {
  // Delete any existing OTPs for this identifier and type
  await prisma.oTP.deleteMany({
    where: {
      identifier,
      type,
    },
  });

  // Generate new OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP.EXPIRY_MINUTES * 60 * 1000);

  // Store OTP
  await prisma.oTP.create({
    data: {
      identifier,
      otp,
      type,
      expiresAt,
    },
  });

  return otp;
};

/**
 * Verify OTP
 */
const verifyOTP = async (identifier, otp, type) => {
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      identifier,
      type,
      verified: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // OTP not found
  if (!otpRecord) {
    return { success: false, message: 'Invalid OTP' };
  }

  // OTP expired
  if (new Date() > otpRecord.expiresAt) {
    await prisma.oTP.delete({ where: { id: otpRecord.id } });
    return { success: false, message: 'OTP has expired' };
  }

  // Too many attempts
  if (otpRecord.attempts >= OTP.MAX_ATTEMPTS) {
    await prisma.oTP.delete({ where: { id: otpRecord.id } });
    return { success: false, message: 'Too many failed attempts. Please request a new OTP' };
  }

  // Incorrect OTP
  if (otpRecord.otp !== otp) {
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 },
    });
    return { 
      success: false, 
      message: `Invalid OTP. ${OTP.MAX_ATTEMPTS - otpRecord.attempts - 1} attempts remaining` 
    };
  }

  // Mark as verified and delete
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  // Delete verified OTP
  await prisma.oTP.delete({ where: { id: otpRecord.id } });

  return { success: true, message: 'OTP verified successfully' };
};

/**
 * Clean up expired OTPs (should be run periodically)
 */
const cleanupExpiredOTPs = async () => {
  await prisma.oTP.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
  cleanupExpiredOTPs,
};