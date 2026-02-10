// src/jobs/bookingReminder.js
const { SpeedBoatBooking, PartyBoatBooking } = require('../models');
const { sendBookingReminder } = require('../utils/email');
const config = require('../config/env');

/**
 * Booking Reminder Job
 * Sends email reminders for bookings scheduled for tomorrow.
 * Runs daily at 9 AM IST via the scheduler.
 */
const BookingReminderJob = {
  async run() {
    // Calculate tomorrow's date range (start and end of day)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfTomorrow = new Date(tomorrow);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const dateFilter = {
      date: { $gte: startOfTomorrow, $lte: endOfTomorrow },
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      isDeleted: false,
    };

    // Fetch speed boat bookings for tomorrow
    const speedBookings = await SpeedBoatBooking.find(dateFilter)
      .populate('customerId', 'name email phone')
      .lean();

    // Fetch party boat bookings for tomorrow
    const partyBookings = await PartyBoatBooking.find(dateFilter)
      .populate('customerId', 'name email phone')
      .populate('boatId', 'name')
      .lean();

    let remindersSent = 0;

    // Send reminders for speed boat bookings
    for (const booking of speedBookings) {
      if (!booking.customerId?.email) continue;

      try {
        const formattedDate = new Date(booking.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        await sendBookingReminder(booking.customerId.email, {
          name: booking.customerId.name,
          bookingNumber: booking.bookingNumber,
          boatName: `Speed Boat (${booking.numberOfBoats} boat${booking.numberOfBoats > 1 ? 's' : ''})`,
          date: formattedDate,
          time: booking.startTime || '',
          duration: `${booking.duration} hour${booking.duration > 1 ? 's' : ''}`,
          bookingType: 'Speed Boat',
          hoursUntil: '24',
        });

        remindersSent++;
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking.bookingNumber}:`, error.message);
      }
    }

    // Send reminders for party boat bookings
    for (const booking of partyBookings) {
      if (!booking.customerId?.email) continue;

      try {
        const formattedDate = new Date(booking.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        const timeSlotLabels = {
          MORNING: 'Morning',
          AFTERNOON: 'Afternoon',
          EVENING: 'Evening',
          FULL_DAY: 'Full Day',
        };

        await sendBookingReminder(booking.customerId.email, {
          name: booking.customerId.name,
          bookingNumber: booking.bookingNumber,
          boatName: booking.boatId?.name || 'Party Boat',
          date: formattedDate,
          time: timeSlotLabels[booking.timeSlot] || booking.timeSlot || '',
          duration: timeSlotLabels[booking.timeSlot] || '',
          bookingType: 'Party Boat',
          hoursUntil: '24',
        });

        remindersSent++;
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking.bookingNumber}:`, error.message);
      }
    }

    if (remindersSent > 0 && config.enableLogs) {
      console.log(`Booking reminders sent: ${remindersSent} (${speedBookings.length} speed, ${partyBookings.length} party)`);
    }

    return { remindersSent, speedBookings: speedBookings.length, partyBookings: partyBookings.length };
  },
};

module.exports = BookingReminderJob;
