const mongoose = require('mongoose');

const selectedAddOnSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
}, { _id: false });

const inquirySchema = new mongoose.Schema({
  inquiryNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true,
  },
  boatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartyBoat',
    required: true,
  },
  eventType: {
    type: String,
    enum: ['WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FAREWELL', 'OTHER'],
    required: true,
  },
  numberOfGuests: {
    type: Number,
    min: 1,
  },
  preferredDate: {
    type: Date,
  },
  preferredTimeSlot: {
    type: String,
    enum: ['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'],
  },
  locationType: {
    type: String,
    enum: ['HARBOR', 'CRUISE'],
  },
  specialRequests: {
    type: String,
    trim: true,
  },
  budget: {
    type: Number,
    min: 0,
  },
  selectedAddOns: [selectedAddOnSchema],
  status: {
    type: String,
    enum: ['PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'EXPIRED'],
    default: 'PENDING',
  },
  quotedAmount: {
    type: Number,
  },
  quotedDetails: {
    type: String,
    trim: true,
  },
  quotedAt: {
    type: Date,
  },
  respondedAt: {
    type: Date,
  },
  convertedBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartyBoatBooking',
  },
  adminNotes: {
    type: String,
    trim: true,
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

inquirySchema.index({ status: 1, isDeleted: 1 });
inquirySchema.index({ customerId: 1 });
inquirySchema.index({ boatId: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
