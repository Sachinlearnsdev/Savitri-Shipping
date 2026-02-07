const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['PEAK_HOURS', 'OFF_PEAK_HOURS', 'WEEKEND', 'SEASONAL', 'HOLIDAY', 'SPECIAL'],
    required: true,
  },
  adjustmentPercent: {
    type: Number,
    required: true, // positive = markup, negative = discount (e.g., 25 = +25%, -20 = -20%)
  },
  priority: {
    type: Number,
    default: 0, // higher priority wins when multiple rules match
  },
  conditions: {
    startTime: String,     // "14:00" - for time-based rules
    endTime: String,       // "18:00"
    daysOfWeek: [Number],  // 0=Sun, 1=Mon, ..., 6=Sat - for weekend/weekday rules
    startDate: Date,       // for seasonal/date-range rules
    endDate: Date,
    specificDates: [Date], // for holiday/special rules
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

pricingRuleSchema.index({ type: 1, isActive: 1 });
pricingRuleSchema.index({ priority: -1 });

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
