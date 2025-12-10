const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  group: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

settingSchema.index({ group: 1, key: 1 }, { unique: true });
settingSchema.index({ group: 1 });

module.exports = mongoose.model('Setting', settingSchema);
