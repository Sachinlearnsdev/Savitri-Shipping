// src/jobs/autoComplete.js
const { SpeedBoatBooking, PartyBoatBooking, Customer } = require('../models');
const config = require('../config/env');

/**
 * Auto-Complete Job
 * Marks past confirmed bookings as COMPLETED and updates customer ride counts.
 * Runs daily at midnight IST via the scheduler.
 */
const AutoCompleteJob = {
  async run() {
    // Start of today (any booking with a date before today should be completed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter = {
      date: { $lt: today },
      status: { $in: ['CONFIRMED'] },
      isDeleted: false,
    };

    let autoCompleted = 0;

    // Auto-complete speed boat bookings
    const speedBookings = await SpeedBoatBooking.find(filter).lean();

    if (speedBookings.length > 0) {
      // Mark all as completed
      await SpeedBoatBooking.updateMany(filter, {
        $set: { status: 'COMPLETED' },
      });

      // Update each customer's completedRidesCount
      const customerCounts = {};
      for (const booking of speedBookings) {
        const customerId = booking.customerId.toString();
        customerCounts[customerId] = (customerCounts[customerId] || 0) + 1;
      }

      for (const [customerId, count] of Object.entries(customerCounts)) {
        try {
          await Customer.findByIdAndUpdate(customerId, {
            $inc: { completedRidesCount: count },
          });
        } catch (error) {
          console.error(`Failed to update ride count for customer ${customerId}:`, error.message);
        }
      }

      autoCompleted += speedBookings.length;
    }

    // Auto-complete party boat bookings
    const partyBookings = await PartyBoatBooking.find(filter).lean();

    if (partyBookings.length > 0) {
      await PartyBoatBooking.updateMany(filter, {
        $set: { status: 'COMPLETED' },
      });

      autoCompleted += partyBookings.length;
    }

    if (autoCompleted > 0 && config.enableLogs) {
      console.log(`Auto-completed ${autoCompleted} bookings (${speedBookings.length} speed, ${partyBookings.length} party)`);
    }

    return { autoCompleted, speedBookings: speedBookings.length, partyBookings: partyBookings.length };
  },
};

module.exports = AutoCompleteJob;
