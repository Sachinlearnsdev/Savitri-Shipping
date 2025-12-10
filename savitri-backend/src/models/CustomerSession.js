const mongoose = require('mongoose');

const customerSessionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userAgent: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  deviceInfo: {
    type: String,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

customerSessionSchema.index({ customerId: 1 });
customerSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('CustomerSession', customerSessionSchema);
