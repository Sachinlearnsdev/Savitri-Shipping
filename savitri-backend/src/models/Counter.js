// src/models/Counter.js

const mongoose = require('mongoose');

/**
 * Counter schema for generating sequential booking IDs
 * Uses atomic findOneAndUpdate to prevent race conditions
 */
const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

/**
 * Get next sequence number (atomic operation)
 */
counterSchema.statics.getNextSequence = async function(sequenceName) {
  const counter = await this.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

module.exports = mongoose.model('Counter', counterSchema);