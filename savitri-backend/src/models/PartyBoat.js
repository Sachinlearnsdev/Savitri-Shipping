const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['CATERING_VEG', 'CATERING_NONVEG', 'LIVE_BAND', 'PHOTOGRAPHER', 'DECORATION_STANDARD'],
    required: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  priceType: {
    type: String,
    enum: ['FIXED', 'PER_PERSON'],
    default: 'FIXED',
  },
}, { _id: false });

const partyBoatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  images: [{
    type: String,
  }],
  capacityMin: {
    type: Number,
    required: true,
    min: 1,
  },
  capacityMax: {
    type: Number,
    required: true,
    min: 1,
  },
  locationOptions: [{
    type: String,
    enum: ['HARBOR', 'CRUISE'],
  }],
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  operatingStartTime: {
    type: String,
    default: '06:00',
  },
  operatingEndTime: {
    type: String,
    default: '00:00',
  },
  timeSlots: [{
    type: String,
    enum: ['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'],
  }],
  eventTypes: [{
    type: String,
    enum: ['WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FAREWELL', 'OTHER'],
  }],
  addOns: [addOnSchema],
  djIncluded: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
    default: 'ACTIVE',
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

partyBoatSchema.index({ status: 1, isDeleted: 1 });

module.exports = mongoose.model('PartyBoat', partyBoatSchema);
