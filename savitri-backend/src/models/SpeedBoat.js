// src/models/SpeedBoat.js

const mongoose = require('mongoose');

const speedBoatSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true,
  },
  
  model: {
    type: String,
    trim: true,
  },
  
  description: {
    type: String,
  },
  
  // Capacity
  capacity: {
    type: Number,
    required: true,
    min: 1,
  },
  
  // Pricing
  hourlyRate: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Tax
  taxRate: {
    type: Number,
    default: 18,
    min: 0,
    max: 100,
  },
  
  taxType: {
    type: String,
    enum: ['inclusive', 'exclusive'],
    default: 'exclusive',
  },
  
  // Booking Rules
  minDuration: {
    type: Number,
    default: 1,
    min: 0.5,
  },
  
  advanceBookingDays: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Operating Hours
  operatingHours: {
    start: {
      type: String,
      default: '06:00',
    },
    end: {
      type: String,
      default: '18:00',
    },
  },
  
  // Features
  features: [{
    type: String,
  }],
  
  // Images
  images: [{
    url: String,
    alt: String,
  }],
  
  // Safety Info
  safetyInfo: {
    type: String,
  },
  
  // Cancellation Policy
  cancellationPolicy: {
    type: String,
  },
  
  // Status
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
    default: 'ACTIVE',
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
  },
}, {
  timestamps: true,
});

speedBoatSchema.index({ status: 1 });
speedBoatSchema.index({ hourlyRate: 1 });

module.exports = mongoose.model('SpeedBoat', speedBoatSchema);