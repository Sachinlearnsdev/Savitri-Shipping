const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

activityLogSchema.index({ adminUserId: 1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
