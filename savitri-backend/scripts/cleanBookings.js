// scripts/cleanBookings.js
// Deletes ALL speed boat and party boat bookings from the database.
// Usage: node savitri-backend/scripts/cleanBookings.js

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('../src/config/database');
const { SpeedBoatBooking, PartyBoatBooking } = require('../src/models');

async function cleanBookings() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // Count existing bookings before deletion
    const speedCount = await SpeedBoatBooking.countDocuments();
    const partyCount = await PartyBoatBooking.countDocuments();

    console.log(`Found ${speedCount} speed boat booking(s) and ${partyCount} party boat booking(s).`);

    if (speedCount === 0 && partyCount === 0) {
      console.log('No bookings to delete. Database is already clean.');
      process.exit(0);
    }

    // Delete all speed boat bookings
    if (speedCount > 0) {
      const speedResult = await SpeedBoatBooking.deleteMany({});
      console.log(`Deleted ${speedResult.deletedCount} speed boat booking(s).`);
    }

    // Delete all party boat bookings
    if (partyCount > 0) {
      const partyResult = await PartyBoatBooking.deleteMany({});
      console.log(`Deleted ${partyResult.deletedCount} party boat booking(s).`);
    }

    console.log('All test bookings have been deleted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning bookings:', error.message);
    process.exit(1);
  }
}

cleanBookings();
