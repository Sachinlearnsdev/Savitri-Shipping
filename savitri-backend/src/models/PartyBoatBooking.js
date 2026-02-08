const mongoose = require('mongoose');

const partyBoatBookingSchema = new mongoose.Schema({
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
  boatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartyBoat',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    enum: ['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'],
    required: true,
  },
  eventType: {
    type: String,
    enum: ['WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FAREWELL', 'OTHER'],
    required: true,
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1,
  },
  locationType: {
    type: String,
    enum: ['HARBOR', 'CRUISE'],
    required: true,
  },
  selectedAddOns: [{
    type: { type: String },
    label: String,
    price: Number,
    priceType: { type: String, enum: ['FIXED', 'PER_PERSON'] },
    quantity: Number,
    total: Number,
  }],
  pricing: {
    basePrice: {
      type: Number,
      required: true,
    },
    addOnsTotal: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
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
      required: true,
    },
    adminOverrideAmount: Number,
    discountAmount: { type: Number, default: 0 },
    coupon: {
      code: String,
      discountType: String,
      discountValue: Number,
      discountAmount: Number,
    },
    finalAmount: {
      type: Number,
      required: true,
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
    default: 'ADMIN',
  },
  createdById: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel',
  },
  createdByModel: {
    type: String,
    enum: ['Customer', 'AdminUser'],
    default: 'AdminUser',
  },
  dateModifications: [{
    previousDate: Date,
    previousTimeSlot: String,
    newDate: Date,
    newTimeSlot: String,
    modifiedAt: { type: Date, default: Date.now },
  }],
  dateModificationCount: {
    type: Number,
    default: 0,
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

partyBoatBookingSchema.index({ customerId: 1 });
partyBoatBookingSchema.index({ date: 1, status: 1 });
partyBoatBookingSchema.index({ status: 1, isDeleted: 1 });
partyBoatBookingSchema.index({ boatId: 1, date: 1 });

module.exports = mongoose.model('PartyBoatBooking', partyBoatBookingSchema);
