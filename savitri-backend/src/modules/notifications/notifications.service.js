const { Review, SpeedBoatBooking, PartyBoatBooking } = require('../../models');

class NotificationsService {
  async getCounts() {
    const [pendingReviews, pendingBookings, pendingPartyBookings] = await Promise.all([
      Review.countDocuments({ isApproved: false, isDeleted: false }),
      SpeedBoatBooking.countDocuments({ status: 'PENDING', isDeleted: false }),
      PartyBoatBooking.countDocuments({ status: 'PENDING', isDeleted: false }),
    ]);

    return {
      pendingReviews,
      pendingBookings,
      pendingPartyBookings,
      total: pendingReviews + pendingBookings + pendingPartyBookings,
    };
  }
}

module.exports = new NotificationsService();
