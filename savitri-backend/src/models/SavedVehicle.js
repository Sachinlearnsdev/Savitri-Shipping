const mongoose = require('mongoose');

const savedVehicleSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  type: {
    type: String,
    enum: ['CAR', 'BIKE', 'CYCLE'],
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  registrationNo: {
    type: String,
  },
  nickname: {
    type: String,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

savedVehicleSchema.index({ customerId: 1 });

module.exports = mongoose.model('SavedVehicle', savedVehicleSchema);
