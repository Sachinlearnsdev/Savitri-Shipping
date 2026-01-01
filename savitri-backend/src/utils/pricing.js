// src/utils/pricing.js

/**
 * Calculate speed boat pricing with tax
 */
const calculateSpeedBoatPricing = (hourlyRate, duration, taxRate, taxType) => {
  let subtotal, taxAmount, total;
  
  if (taxType === 'exclusive') {
    // Tax added on top
    subtotal = hourlyRate * duration;
    taxAmount = (subtotal * taxRate) / 100;
    total = subtotal + taxAmount;
  } else {
    // Tax included in price
    total = hourlyRate * duration;
    taxAmount = (total * taxRate) / (100 + taxRate);
    subtotal = total - taxAmount;
  }
  
  return {
    hourlyRate: parseFloat(hourlyRate.toFixed(2)),
    duration: parseFloat(duration.toFixed(2)),
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxRate: parseFloat(taxRate.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

/**
 * Calculate refund amount based on cancellation policy
 */
const calculateRefundAmount = (totalAmount, hoursUntilTrip) => {
  let refundPercentage = 0;
  
  if (hoursUntilTrip >= 24) {
    // 24+ hours before: 100% refund
    refundPercentage = 100;
  } else if (hoursUntilTrip >= 12) {
    // 12-24 hours before: 50% refund
    refundPercentage = 50;
  } else {
    // Less than 12 hours: No refund
    refundPercentage = 0;
  }
  
  const refundAmount = (totalAmount * refundPercentage) / 100;
  
  return {
    refundPercentage,
    refundAmount: parseFloat(refundAmount.toFixed(2)),
    hoursUntilTrip: parseFloat(hoursUntilTrip.toFixed(2)),
  };
};

/**
 * Calculate hours between two dates
 */
const calculateHoursBetween = (fromDate, toDate) => {
  const diff = toDate.getTime() - fromDate.getTime();
  return diff / (1000 * 60 * 60);
};

module.exports = {
  calculateSpeedBoatPricing,
  calculateRefundAmount,
  calculateHoursBetween,
};