// src/models/index.js

module.exports = {
  AdminUser: require("./AdminUser"),
  Role: require("./Role"),
  Customer: require("./Customer"),
  AdminSession: require("./AdminSession"),
  CustomerSession: require("./CustomerSession"),
  OTP: require("./OTP"),
  SavedVehicle: require("./SavedVehicle"),
  ActivityLog: require("./ActivityLog"),
  LoginHistory: require("./LoginHistory"),
  Setting: require("./Setting"),
  // Phase 2A: Speed Boat Rentals
  Counter: require("./Counter"),
  SpeedBoat: require("./SpeedBoat"),
  SpeedBoatBooking: require("./SpeedBoatBooking"),
};
