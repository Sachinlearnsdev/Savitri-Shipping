// src/utils/sms.js
const config = require('../config/env');

/**
 * Send SMS using configured service
 */
const sendSMS = async (phone, message) => {
  try {
    if (config.smsService === 'master') {
      // Master OTP mode - just log it
      if (config.nodeEnv === 'development') {
        console.log('📱 SMS (Master Mode):');
        console.log(`   To: ${phone}`);
        console.log(`   Message: ${message}`);
      }
      return { success: true, mode: 'master' };
    }
    
    if (config.smsService === 'msg91') {
      // MSG91 integration (to be implemented)
      // const response = await fetch('https://api.msg91.com/api/v5/flow/', {
      //   method: 'POST',
      //   headers: {
      //     'authkey': config.msg91ApiKey,
      //     'content-type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     mobile: phone,
      //     message: message
      //   })
      // });
      
      console.warn('⚠️  MSG91 integration not yet implemented');
      return { success: false, error: 'MSG91 not configured' };
    }
    
    throw new Error('SMS service not configured');
  } catch (error) {
    console.error('❌ SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send phone verification OTP
 */
const sendPhoneVerificationOTP = async (phone, otp) => {
  const message = `Your ${config.companyName} phone verification OTP is: ${otp}. Valid for 10 minutes.`;
  return sendSMS(phone, message);
};

/**
 * Send login OTP
 */
const sendLoginOTP = async (phone, otp) => {
  const message = `Your ${config.companyName} login OTP is: ${otp}. Valid for 10 minutes.`;
  return sendSMS(phone, message);
};

/**
 * Format phone number for India
 */
const formatPhoneNumber = (phone) => {
  // Remove any spaces, dashes, or special characters
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove +91 if present
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  return cleaned;
};

/**
 * Validate Indian phone number
 */
const isValidPhoneNumber = (phone) => {
  const cleaned = formatPhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
};

module.exports = {
  sendSMS,
  sendPhoneVerificationOTP,
  sendLoginOTP,
  formatPhoneNumber,
  isValidPhoneNumber,
};