const mongoose = require('mongoose');

const speedBoatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  description: {
    type: String,
    trim: true,
  },
  features: [{
    type: String,
    trim: true,
  }],
  images: [{
    type: String,
  }],
  baseRate: {
    type: Number,
    required: true,
    min: 0,
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

speedBoatSchema.index({ status: 1, isDeleted: 1 });

module.exports = mongoose.model('SpeedBoat', speedBoatSchema);
