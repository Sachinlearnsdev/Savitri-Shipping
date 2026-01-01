// src/models/SpeedBoatBooking.js

const mongoose = require('mongoose');
const Counter = require('./Counter');

const speedBoatBookingSchema = new mongoose.Schema({
  // Booking ID (auto-generated)
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  
  // References
  speedBoat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpeedBoat',
    required: true,
  },
  
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  
  // Booking Details
  bookingDate: {
    type: Date,
    required: true,
  },
  
  startTime: {
    type: String,
    required: true,
  },
  
  endTime: {
    type: String,
    required: true,
  },
  
  duration: {
    type: Number,
    required: true,
    min: 0.5,
  },
  
  passengers: {
    type: Number,
    required: true,
    min: 1,
  },
  
  // Pricing Breakdown
  pricing: {
    hourlyRate: Number,
    subtotal: Number,
    taxRate: Number,
    taxAmount: Number,
    total: Number,
  },
  
  // Payment
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },
  
  paymentMethod: {
    type: String,
    enum: ['ONLINE', 'CASH', 'BANK_TRANSFER', 'UPI', 'CARD'],
  },
  
  transactionId: String,
  paymentDate: Date,
  
  // Payment deadline (for auto-cancellation - future)
  paymentDeadline: Date,
  
  // Status
  bookingStatus: {
    type: String,
    enum: ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
    default: 'PENDING_PAYMENT',
  },
  
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'cancelledByModel',
  },
  cancelledByModel: {
    type: String,
    enum: ['Customer', 'AdminUser'],
  },
  
  // Refund
  refundAmount: { 
    type: Number, 
    default: 0 
  },
  refundPercentage: {
    type: Number,
    default: 0,
  },
  refundStatus: {
    type: String,
    enum: ['NOT_APPLICABLE', 'PENDING', 'PROCESSED', 'FAILED'],
    default: 'NOT_APPLICABLE',
  },
  refundDate: Date,
  
  // Invoice
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  invoiceUrl: String,
  
  // Notes
  customerNotes: String,
  adminNotes: String,
  
  // Reminders (TODO - implement cron jobs in future)
  remindersSent: {
    reminder24h: { 
      type: Boolean, 
      default: false 
    },
    reminder2h: { 
      type: Boolean, 
      default: false 
    },
    reviewRequest: { 
      type: Boolean, 
      default: false 
    },
  },
  
  // Review (future)
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel',
  },
  createdByModel: {
    type: String,
    enum: ['Customer', 'AdminUser'],
    default: 'Customer',
  },
}, {
  timestamps: true,
});

speedBoatBookingSchema.index({ bookingId: 1 });
speedBoatBookingSchema.index({ speedBoat: 1, bookingDate: 1 });
speedBoatBookingSchema.index({ customer: 1, createdAt: -1 });
speedBoatBookingSchema.index({ bookingStatus: 1 });
speedBoatBookingSchema.index({ paymentStatus: 1 });

/**
 * Auto-generate bookingId using atomic counter
 */
speedBoatBookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingId) {
    try {
      const year = new Date().getFullYear();
      const seq = await Counter.getNextSequence('speedBoatBooking');
      this.bookingId = `SB-${year}-${String(seq).padStart(6, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('SpeedBoatBooking', speedBoatBookingSchema);