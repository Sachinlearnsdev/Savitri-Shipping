const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  boatId: { type: mongoose.Schema.Types.ObjectId, refPath: 'boatModel' },
  boatModel: { type: String, enum: ['SpeedBoat', 'PartyBoat'] },
  reviewType: { type: String, enum: ['COMPANY', 'SPEED_BOAT', 'PARTY_BOAT'], required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxlength: 1000 },
  customerName: { type: String, required: true, trim: true },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, { timestamps: true });

reviewSchema.index({ reviewType: 1, isApproved: 1, isDeleted: 1 });
reviewSchema.index({ boatId: 1, reviewType: 1 });

module.exports = mongoose.model('Review', reviewSchema);
