// src/utils/availability.js

const SpeedBoatBooking = require('../models/SpeedBoatBooking');

/**
 * Convert time string (HH:MM) to minutes
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes to time string (HH:MM)
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Add hours to time string
 */
const addHoursToTime = (timeStr, hours) => {
  const minutes = timeToMinutes(timeStr) + (hours * 60);
  return minutesToTime(minutes);
};

/**
 * Check if two time slots overlap
 * Returns true if overlap exists (NOT available)
 * Returns false if no overlap (available)
 */
const checkTimeOverlap = (newStart, newEnd, existingStart, existingEnd) => {
  const newStartMin = timeToMinutes(newStart);
  const newEndMin = timeToMinutes(newEnd);
  const existingStartMin = timeToMinutes(existingStart);
  const existingEndMin = timeToMinutes(existingEnd);
  
  // Overlap logic: new slot starts before existing ends AND new slot ends after existing starts
  return newStartMin < existingEndMin && newEndMin > existingStartMin;
};

/**
 * Check if booking time is within operating hours
 */
const isWithinOperatingHours = (startTime, endTime, operatingHours) => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const opStartMin = timeToMinutes(operatingHours.start);
  const opEndMin = timeToMinutes(operatingHours.end);
  
  return startMin >= opStartMin && endMin <= opEndMin;
};

/**
 * Check availability for a boat on a specific date and time
 */
const checkAvailability = async (boatId, date, startTime, duration, excludeBookingId = null) => {
  // Calculate end time
  const endTime = addHoursToTime(startTime, duration);
  
  // Build query
  const query = {
    speedBoat: boatId,
    bookingDate: new Date(date),
    bookingStatus: { $in: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'] },
  };
  
  // Exclude specific booking (for updates)
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  // Get all bookings for this boat on this date
  const existingBookings = await SpeedBoatBooking.find(query)
    .select('startTime endTime bookingId')
    .lean();
  
  // Check each existing booking for overlap
  const conflicts = [];
  for (const booking of existingBookings) {
    if (checkTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)) {
      conflicts.push({
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingId: booking.bookingId,
      });
    }
  }
  
  if (conflicts.length > 0) {
    return {
      available: false,
      conflicts,
    };
  }
  
  return { 
    available: true 
  };
};

/**
 * Get suggested available time slots
 */
const getSuggestedSlots = async (boatId, date, duration, operatingHours, maxSuggestions = 3) => {
  // Get all bookings for the day
  const existingBookings = await SpeedBoatBooking.find({
    speedBoat: boatId,
    bookingDate: new Date(date),
    bookingStatus: { $in: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'] },
  })
    .select('startTime endTime')
    .sort({ startTime: 1 })
    .lean();
  
  const suggestions = [];
  const opStartMin = timeToMinutes(operatingHours.start);
  const opEndMin = timeToMinutes(operatingHours.end);
  const durationMin = duration * 60;
  
  // Check each 30-minute slot throughout the day
  for (let currentMin = opStartMin; currentMin <= opEndMin - durationMin; currentMin += 30) {
    const slotStart = minutesToTime(currentMin);
    const slotEnd = addHoursToTime(slotStart, duration);
    
    // Check if this slot conflicts with any booking
    let hasConflict = false;
    for (const booking of existingBookings) {
      if (checkTimeOverlap(slotStart, slotEnd, booking.startTime, booking.endTime)) {
        hasConflict = true;
        break;
      }
    }
    
    if (!hasConflict) {
      suggestions.push({
        startTime: slotStart,
        endTime: slotEnd,
      });
      
      if (suggestions.length >= maxSuggestions) {
        break;
      }
    }
  }
  
  return suggestions;
};

/**
 * Validate booking time against operating hours and advance booking rules
 */
const validateBookingTime = (bookingDate, startTime, duration, boat, currentDate = new Date()) => {
  const errors = [];
  
  // Check if date is in the past
  const bookingDateTime = new Date(bookingDate);
  bookingDateTime.setHours(0, 0, 0, 0);
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);
  
  if (bookingDateTime < today) {
    errors.push('Booking date cannot be in the past');
  }
  
  // Check advance booking rule
  const daysDifference = Math.floor((bookingDateTime - today) / (1000 * 60 * 60 * 24));
  if (daysDifference < boat.advanceBookingDays) {
    errors.push(`Bookings must be made at least ${boat.advanceBookingDays} days in advance`);
  }
  
  // Check minimum duration
  if (duration < boat.minDuration) {
    errors.push(`Minimum booking duration is ${boat.minDuration} hours`);
  }
  
  // Check if duration is in multiples of 0.5
  if (duration % 0.5 !== 0) {
    errors.push('Duration must be in multiples of 0.5 hours (30 minutes)');
  }
  
  // Check operating hours
  const endTime = addHoursToTime(startTime, duration);
  if (!isWithinOperatingHours(startTime, endTime, boat.operatingHours)) {
    errors.push(`Booking must be within operating hours (${boat.operatingHours.start} - ${boat.operatingHours.end})`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  addHoursToTime,
  checkTimeOverlap,
  isWithinOperatingHours,
  checkAvailability,
  getSuggestedSlots,
  validateBookingTime,
};