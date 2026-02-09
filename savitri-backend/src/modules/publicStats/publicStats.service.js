// src/modules/publicStats/publicStats.service.js
const { SpeedBoat, PartyBoat, Customer, PartyBoatBooking, Setting } = require('../../models');
const { BOAT_STATUS, USER_STATUS, BOOKING_STATUS, SETTINGS_GROUPS } = require('../../config/constants');

class PublicStatsService {
  /**
   * Get public website stats
   * - boatsInFleet: active speed boats + active party boats
   * - happyCustomers: active customers
   * - eventsHosted: completed party boat bookings (or override from settings)
   * - yearsExperience: from general settings
   */
  async getStats() {
    // Run all queries in parallel for performance
    const [
      activeSpeedBoats,
      activePartyBoats,
      activeCustomers,
      completedPartyBookings,
      generalSettings,
    ] = await Promise.all([
      SpeedBoat.countDocuments({ status: BOAT_STATUS.ACTIVE, isDeleted: { $ne: true } }),
      PartyBoat.countDocuments({ status: BOAT_STATUS.ACTIVE, isDeleted: { $ne: true } }),
      Customer.countDocuments({ status: USER_STATUS.ACTIVE }),
      PartyBoatBooking.countDocuments({ status: BOOKING_STATUS.COMPLETED, isDeleted: { $ne: true } }),
      Setting.findOne({ group: SETTINGS_GROUPS.GENERAL, key: 'config' }).lean(),
    ]);

    const config = generalSettings?.value || {};
    const yearsExperience = config.yearsExperience || 10;
    const eventsHostedOverride = config.eventsHostedOverride;

    return {
      boatsInFleet: activeSpeedBoats + activePartyBoats,
      happyCustomers: activeCustomers,
      eventsHosted: eventsHostedOverride || completedPartyBookings,
      yearsExperience,
    };
  }
}

module.exports = new PublicStatsService();
