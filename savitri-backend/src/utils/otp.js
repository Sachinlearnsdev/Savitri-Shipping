// src/utils/otp.js
const OTP = require("../models/OTP");
const { OTP: OTP_CONFIG } = require("../config/constants");

/**
 * Generate random OTP
 */
const generateOTP = (length = OTP_CONFIG.LENGTH) => {
  let otp = "";
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
  await OTP.deleteMany({
    identifier,
    type,
  });

  // Generate new OTP
  const otp = generateOTP();
  const expiresAt = new Date(
    Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000
  );

  // Store OTP
  await OTP.create({
    identifier,
    otp,
    type,
    expiresAt,
  });

  return otp;
};

/**
 * Verify OTP
 */
const verifyOTP = async (identifier, otp, type) => {
  const otpRecord = await OTP.findOne({
    identifier,
    type,
    verified: false,
  }).sort({ createdAt: -1 });

  // OTP not found
  if (!otpRecord) {
    return { success: false, message: "Invalid OTP" };
  }

  // OTP expired
  if (new Date() > otpRecord.expiresAt) {
    await OTP.findByIdAndDelete(otpRecord._id);
    return { success: false, message: "OTP has expired" };
  }

  // Too many attempts
  if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    await OTP.findByIdAndDelete(otpRecord._id);
    return {
      success: false,
      message: "Too many failed attempts. Please request a new OTP",
    };
  }

  // Incorrect OTP
  if (otpRecord.otp !== otp) {
    await OTP.findByIdAndUpdate(otpRecord._id, {
      $inc: { attempts: 1 },
    });
    return {
      success: false,
      message: `Invalid OTP. ${
        OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts - 1
      } attempts remaining`,
    };
  }

  // Mark as verified and delete
  await OTP.findByIdAndUpdate(otpRecord._id, {
    verified: true,
  });

  // Delete verified OTP
  await OTP.findByIdAndDelete(otpRecord._id);

  return { success: true, message: "OTP verified successfully" };
};

/**
 * Clean up expired OTPs (should be run periodically)
 */
const cleanupExpiredOTPs = async () => {
  await OTP.deleteMany({
    expiresAt: {
      $lt: new Date(),
    },
  });
};

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP,
  cleanupExpiredOTPs,
};
