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
    default: false,
  },
  deletedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});


customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema);
