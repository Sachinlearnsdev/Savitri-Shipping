// src/utils/sms.js
const config = require('../config/env');

// ============================================================
// SMS Provider Abstraction
// ============================================================
// To integrate a real SMS provider (MSG91, Twilio, etc.):
//
// 1. Set SMS_SERVICE env variable to your provider name (e.g., 'msg91', 'twilio')
// 2. Add provider credentials to .env and config/env.js
// 3. Implement the provider's send function in the switch case below
// 4. Register with DLT (Distributed Ledger Technology) for Indian SMS compliance
//    - Register sender ID (e.g., SAVTRI)
//    - Register SMS templates with DLT portal
//    - Use approved template IDs when sending
//
// Current providers:
//   'master'  - Development mode, uses master OTP (default)
//   'msg91'   - MSG91 (placeholder, needs implementation)
//   'twilio'  - Twilio (placeholder, needs implementation)
// ============================================================

/**
 * Send SMS using configured service
 * @param {string} phone - Phone number (10-digit Indian)
 * @param {string} message - SMS message text
 * @returns {Promise<{success: boolean, mode?: string, error?: string}>}
 */
const sendSMS = async (phone, message) => {
  try {
    const provider = config.smsService || 'master';

    switch (provider) {
      case 'master':
        // Master OTP mode - just log it (development/testing)
        if (config.nodeEnv === 'development' && config.enableLogs) {
          console.log('SMS (Master Mode):');
          console.log(`   To: ${phone}`);
          console.log(`   Message: ${message}`);
        }
        return { success: true, mode: 'master' };

      case 'msg91':
        // -------------------------------------------------------
        // MSG91 Integration (requires DLT registration)
        // -------------------------------------------------------
        // Prerequisites:
        //   - MSG91 account with API key
        //   - DLT registered sender ID and templates
        //   - Add to .env: MSG91_API_KEY, MSG91_SENDER_ID, MSG91_ROUTE
        //
        // Implementation:
        //   const response = await fetch('https://api.msg91.com/api/v5/flow/', {
        //     method: 'POST',
        //     headers: {
        //       'authkey': config.msg91ApiKey,
        //       'content-type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //       sender: config.msg91SenderId,
        //       route: config.msg91Route || '4',
        //       country: '91',
        //       sms: [{ message, to: [phone] }],
        //     }),
        //   });
        //   const data = await response.json();
        //   return { success: data.type === 'success', messageId: data.request_id };
        // -------------------------------------------------------
        console.warn('MSG91 integration not yet implemented. Register with DLT first.');
        return { success: false, error: 'MSG91 not configured' };

      case 'twilio':
        // -------------------------------------------------------
        // Twilio Integration
        // -------------------------------------------------------
        // Prerequisites:
        //   - Twilio account with SID, auth token, and phone number
        //   - Add to .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
        //
        // Implementation:
        //   const twilio = require('twilio');
        //   const client = twilio(config.twilioAccountSid, config.twilioAuthToken);
        //   const result = await client.messages.create({
        //     body: message,
        //     from: config.twilioPhoneNumber,
        //     to: `+91${phone}`,
        //   });
        //   return { success: true, messageId: result.sid };
        // -------------------------------------------------------
        console.warn('Twilio integration not yet implemented.');
        return { success: false, error: 'Twilio not configured' };

      default:
        throw new Error(`Unknown SMS provider: ${provider}`);
    }
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send phone verification OTP
 * @param {string} phone - 10-digit Indian phone number
 * @param {string} otp - OTP code
 */
const sendPhoneVerificationOTP = async (phone, otp) => {
  const message = `Your ${config.companyName} phone verification OTP is: ${otp}. Valid for 10 minutes.`;
  return sendSMS(phone, message);
};

/**
 * Send login OTP
 * @param {string} phone - 10-digit Indian phone number
 * @param {string} otp - OTP code
 */
const sendLoginOTP = async (phone, otp) => {
  const message = `Your ${config.companyName} login OTP is: ${otp}. Valid for 10 minutes.`;
  return sendSMS(phone, message);
};

/**
 * Send booking confirmation SMS (stub - logs only)
 * @param {string} phone - Customer phone number
 * @param {object} data - Booking data
 * @param {string} data.bookingNumber - Booking reference number
 * @param {string} data.boatName - Boat name
 * @param {string} data.date - Booking date (formatted)
 * @param {string} data.time - Booking time
 * @param {string} data.total - Total amount (formatted)
 */
const sendBookingConfirmationSMS = async (phone, data) => {
  const message = `${config.companyName}: Booking ${data.bookingNumber} confirmed! ${data.boatName} on ${data.date} at ${data.time}. Total: ${data.total}. Have a great ride!`;

  if (config.smsService === 'master') {
    console.log('[SMS Stub] Booking confirmation SMS:');
    console.log(`   To: ${phone}`);
    console.log(`   Booking: ${data.bookingNumber}`);
    return { success: true, mode: 'stub' };
  }

  return sendSMS(phone, message);
};

/**
 * Send booking cancellation SMS (stub - logs only)
 * @param {string} phone - Customer phone number
 * @param {object} data - Cancellation data
 * @param {string} data.bookingNumber - Booking reference number
 * @param {string} data.boatName - Boat name
 * @param {string} data.date - Booking date
 * @param {string} data.refundAmount - Refund amount (formatted)
 */
const sendBookingCancellationSMS = async (phone, data) => {
  const message = `${config.companyName}: Booking ${data.bookingNumber} for ${data.boatName} on ${data.date} has been cancelled. Refund: ${data.refundAmount}. Contact us for queries.`;

  if (config.smsService === 'master') {
    console.log('[SMS Stub] Booking cancellation SMS:');
    console.log(`   To: ${phone}`);
    console.log(`   Booking: ${data.bookingNumber}`);
    return { success: true, mode: 'stub' };
  }

  return sendSMS(phone, message);
};

/**
 * Send booking reminder SMS (stub - logs only)
 * @param {string} phone - Customer phone number
 * @param {object} data - Reminder data
 * @param {string} data.bookingNumber - Booking reference number
 * @param {string} data.boatName - Boat name
 * @param {string} data.date - Booking date
 * @param {string} data.time - Booking time
 */
const sendBookingReminderSMS = async (phone, data) => {
  const message = `${config.companyName}: Reminder - Your booking ${data.bookingNumber} for ${data.boatName} is tomorrow (${data.date}) at ${data.time}. See you there!`;

  if (config.smsService === 'master') {
    console.log('[SMS Stub] Booking reminder SMS:');
    console.log(`   To: ${phone}`);
    console.log(`   Booking: ${data.bookingNumber}`);
    return { success: true, mode: 'stub' };
  }

  return sendSMS(phone, message);
};

/**
 * Format phone number for India
 * @param {string} phone - Phone number in any format
 * @returns {string} Cleaned 10-digit number
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
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether the phone number is valid
 */
const isValidPhoneNumber = (phone) => {
  const cleaned = formatPhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
};

module.exports = {
  sendSMS,
  sendPhoneVerificationOTP,
  sendLoginOTP,
  sendBookingConfirmationSMS,
  sendBookingCancellationSMS,
  sendBookingReminderSMS,
  formatPhoneNumber,
  isValidPhoneNumber,
};
