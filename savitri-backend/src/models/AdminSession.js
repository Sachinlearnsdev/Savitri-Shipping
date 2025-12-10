const mongoose = require('mongoose');

const adminSessionSchema = new mongoose.Schema({
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
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
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

adminSessionSchema.index({ adminUserId: 1 });
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AdminSession', adminSessionSchema);
