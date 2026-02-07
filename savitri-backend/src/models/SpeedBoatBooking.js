const mongoose = require('mongoose');

const speedBoatBookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true, // "10:00"
  },
  endTime: {
    type: String,
    required: true, // "12:00"
  },
  duration: {
    type: Number,
    required: true, // hours (supports 0.5 increments)
    min: 0.5,
  },
  numberOfBoats: {
    type: Number,
    required: true,
    min: 1,
  },
  // Pricing snapshot at time of booking
  pricing: {
    baseRate: {
      type: Number,
      required: true, // per boat per hour
    },
    appliedRule: {
      ruleId: { type: mongoose.Schema.Types.ObjectId, ref: 'PricingRule' },
      name: String,
      adjustmentPercent: Number,
    },
    adjustedRate: {
      type: Number,
      required: true, // baseRate after rule applied
    },
    subtotal: {
      type: Number,
      required: true, // adjustedRate * numberOfBoats * duration
    },
    gstPercent: {
      type: Number,
      default: 18,
    },
    gstAmount: Number,
    cgst: Number,
    sgst: Number,
    totalAmount: {
      type: Number,
      required: true, // subtotal + gstAmount
    },
    adminOverrideAmount: Number, // if admin manually set price (null = no override)
    finalAmount: {
      type: Number,
      required: true, // adminOverrideAmount || totalAmount
    },
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'PENDING',
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'],
    default: 'PENDING',
  },
  paymentMode: {
    type: String,
    enum: ['ONLINE', 'AT_VENUE'],
  },
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['CUSTOMER', 'ADMIN'],
    },
    reason: String,
    refundPercent: Number,
    refundAmount: Number,
  },
  customerNotes: {
    type: String,
    trim: true,
  },
  adminNotes: {
    type: String,
    trim: true,
  },
  createdByType: {
    type: String,
    enum: ['CUSTOMER', 'ADMIN'],
    default: 'CUSTOMER',
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel',
  },
  createdByModel: {
    type: String,
    enum: ['Customer', 'AdminUser'],
    default: 'Customer',
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

speedBoatBookingSchema.index({ customerId: 1 });
speedBoatBookingSchema.index({ date: 1, status: 1 });
speedBoatBookingSchema.index({ status: 1, isDeleted: 1 });
speedBoatBookingSchema.index({ date: 1, startTime: 1, endTime: 1 }); // availability queries

module.exports = mongoose.model('SpeedBoatBooking', speedBoatBookingSchema);
