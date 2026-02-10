// src/utils/scheduler.js
const cron = require('node-cron');
const config = require('../config/env');

class Scheduler {
  constructor() {
    this.jobs = [];
  }

  init() {
    // Booking reminders - run daily at 9 AM IST (3:30 UTC)
    this.addJob('booking-reminders', '30 3 * * *', async () => {
      try {
        const BookingReminderJob = require('../jobs/bookingReminder');
        await BookingReminderJob.run();
      } catch (error) {
        console.error('Booking reminder job failed:', error.message);
      }
    });

    // Expired OTP cleanup - run every hour
    this.addJob('otp-cleanup', '0 * * * *', async () => {
      try {
        const OTP = require('../models/OTP');
        const result = await OTP.deleteMany({
          expiresAt: { $lt: new Date() },
        });
        if (result.deletedCount > 0 && config.enableLogs) {
          console.log(`Cleaned up ${result.deletedCount} expired OTPs`);
        }
      } catch (error) {
        console.error('OTP cleanup failed:', error.message);
      }
    });

    // Auto-complete past bookings - run daily at midnight IST (18:30 UTC previous day)
    this.addJob('auto-complete', '30 18 * * *', async () => {
      try {
        const AutoCompleteJob = require('../jobs/autoComplete');
        await AutoCompleteJob.run();
      } catch (error) {
        console.error('Auto-complete job failed:', error.message);
      }
    });

    if (config.enableLogs) {
      console.log(`Scheduler initialized with ${this.jobs.length} jobs`);
    }
  }

  addJob(name, schedule, handler) {
    const job = cron.schedule(schedule, handler, { timezone: 'Asia/Kolkata' });
    this.jobs.push({ name, job });
  }

  stop() {
    this.jobs.forEach(({ name, job }) => {
      job.stop();
    });
  }
}

module.exports = new Scheduler();
