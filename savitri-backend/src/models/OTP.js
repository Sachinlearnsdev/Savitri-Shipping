const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'LOGIN', 'PASSWORD_RESET', 'EMAIL_CHANGE', 'PHONE_CHANGE'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

otpSchema.index({ identifier: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
