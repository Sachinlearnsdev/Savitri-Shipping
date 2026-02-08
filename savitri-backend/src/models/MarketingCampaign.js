const mongoose = require('mongoose');

const marketingCampaignSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: true,
    },
    recipientCount: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failCount: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SENDING', 'SENT', 'FAILED'],
      default: 'DRAFT',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MarketingCampaign', marketingCampaignSchema);
