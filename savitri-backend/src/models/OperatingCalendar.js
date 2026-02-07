const mongoose = require('mongoose');

const operatingCalendarSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN',
  },
  reason: {
    type: String,
    enum: ['TIDE', 'WEATHER', 'MAINTENANCE', 'HOLIDAY', 'OTHER', null],
  },
  notes: {
    type: String,
    trim: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
  },
}, {
  timestamps: true,
});

operatingCalendarSchema.index({ status: 1 });

module.exports = mongoose.model('OperatingCalendar', operatingCalendarSchema);
