const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  deviceInfo: {
    type: String,
  },
  location: {
    type: String,
  },
  success: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

loginHistorySchema.index({ customerId: 1 });
loginHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
