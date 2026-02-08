const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: {
    type: String,
  },
  avatarPublicId: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
  },
  address: {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true },
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    promotional: { type: Boolean, default: true },
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'LOCKED', 'DELETED'],
    default: 'ACTIVE',
  },
  failedAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  smsNotifications: {
    type: Boolean,
    default: true,
  },
  promotionalEmails: {
    type: Boolean,
    default: true,
  },
  deletedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});


customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema);
