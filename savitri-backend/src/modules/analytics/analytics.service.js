const { SpeedBoatBooking, PartyBoatBooking, Customer } = require('../../models');

class AnalyticsService {
  _getDateRange(period) {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start;
    switch (period) {
      case '7d':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start = new Date(now);
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'all':
        start = new Date(2020, 0, 1);
        break;
      default:
        start = new Date(now);
        start.setDate(start.getDate() - 30);
    }
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  async getOverview(period = '30d') {
    const { start, end } = this._getDateRange(period);
    const dateFilter = { createdAt: { $gte: start, $lte: end } };
    const activeFilter = { ...dateFilter, isDeleted: false };

    // Fetch all bookings in period
    const speedBookings = await SpeedBoatBooking.find(activeFilter).lean();
    const partyBookings = await PartyBoatBooking.find(activeFilter).lean();

    const allBookings = [...speedBookings, ...partyBookings];
    const totalBookings = allBookings.length;

    // Revenue (from PAID bookings only)
    const paidBookings = allBookings.filter(b => b.paymentStatus === 'PAID');
    const totalRevenue = paidBookings.reduce((sum, b) => {
      return sum + (b.pricing?.finalAmount || b.pricing?.totalAmount || 0);
    }, 0);

    const avgBookingValue = paidBookings.length > 0 ? totalRevenue / paidBookings.length : 0;

    // Cancellation rate
    const cancelledCount = allBookings.filter(b => b.status === 'CANCELLED').length;
    const cancellationRate = totalBookings > 0 ? (cancelledCount / totalBookings) * 100 : 0;

    // New customers in period
    const newCustomers = await Customer.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: 'ACTIVE',
    });

    // Pending payments
    const pendingPayments = allBookings.filter(b => b.paymentStatus === 'PENDING').length;

    return {
      totalRevenue: Math.round(totalRevenue),
      totalBookings,
      avgBookingValue: Math.round(avgBookingValue),
      cancellationRate: Math.round(cancellationRate * 10) / 10,
      newCustomers,
      pendingPayments,
      speedBoatBookings: speedBookings.length,
      partyBoatBookings: partyBookings.length,
    };
  }

  async getRevenueChart(period = '30d') {
    const { start, end } = this._getDateRange(period);
    const dateFilter = { createdAt: { $gte: start, $lte: end }, isDeleted: false, paymentStatus: 'PAID' };

    const speedBookings = await SpeedBoatBooking.find(dateFilter).select('createdAt pricing').lean();
    const partyBookings = await PartyBoatBooking.find(dateFilter).select('createdAt pricing').lean();

    // Group by date
    const revenueByDate = {};

    const addToDate = (booking, type) => {
      const dateKey = booking.createdAt.toISOString().split('T')[0];
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = { date: dateKey, speedBoat: 0, partyBoat: 0, total: 0 };
      }
      const amount = booking.pricing?.finalAmount || booking.pricing?.totalAmount || 0;
      revenueByDate[dateKey][type] += amount;
      revenueByDate[dateKey].total += amount;
    };

    speedBookings.forEach(b => addToDate(b, 'speedBoat'));
    partyBookings.forEach(b => addToDate(b, 'partyBoat'));

    // Fill in missing dates so the chart has continuous data
    const result = [];
    const current = new Date(start);
    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];
      result.push(revenueByDate[dateKey] || { date: dateKey, speedBoat: 0, partyBoat: 0, total: 0 });
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  async getBookingStats(period = '30d') {
    const { start, end } = this._getDateRange(period);
    const dateFilter = { createdAt: { $gte: start, $lte: end }, isDeleted: false };

    const speedBookings = await SpeedBoatBooking.find(dateFilter).select('status paymentStatus paymentMode').lean();
    const partyBookings = await PartyBoatBooking.find(dateFilter).select('status paymentStatus paymentMode').lean();
    const allBookings = [...speedBookings, ...partyBookings];

    // By status
    const byStatus = {};
    allBookings.forEach(b => {
      byStatus[b.status] = (byStatus[b.status] || 0) + 1;
    });

    // By payment mode
    const byPaymentMode = {};
    allBookings.filter(b => b.paymentMode).forEach(b => {
      byPaymentMode[b.paymentMode] = (byPaymentMode[b.paymentMode] || 0) + 1;
    });

    // By payment status
    const byPaymentStatus = {};
    allBookings.forEach(b => {
      byPaymentStatus[b.paymentStatus] = (byPaymentStatus[b.paymentStatus] || 0) + 1;
    });

    return {
      byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
      byPaymentMode: Object.entries(byPaymentMode).map(([name, value]) => ({ name, value })),
      byPaymentStatus: Object.entries(byPaymentStatus).map(([name, value]) => ({ name, value })),
      byType: [
        { name: 'Speed Boat', value: speedBookings.length },
        { name: 'Party Boat', value: partyBookings.length },
      ],
    };
  }

  async getTopBoats(period = '30d') {
    const { start, end } = this._getDateRange(period);
    const dateFilter = { createdAt: { $gte: start, $lte: end }, isDeleted: false, paymentStatus: 'PAID' };

    // SpeedBoatBooking uses numberOfBoats (generic count) without a boatId reference,
    // so we aggregate speed boat revenue as a single "Speed Boats" entry.
    const speedBookings = await SpeedBoatBooking.find(dateFilter)
      .select('pricing')
      .lean();

    // PartyBoatBooking has a boatId reference to PartyBoat, so we can break down by boat.
    const partyBookings = await PartyBoatBooking.find(dateFilter)
      .select('boatId pricing')
      .populate('boatId', 'name')
      .lean();

    const boatStats = {};

    // Aggregate all speed boat bookings as one entry
    if (speedBookings.length > 0) {
      const speedRevenue = speedBookings.reduce((sum, b) => {
        return sum + (b.pricing?.finalAmount || b.pricing?.totalAmount || 0);
      }, 0);
      boatStats['speed_all'] = {
        name: 'Speed Boats (All)',
        type: 'Speed Boat',
        bookings: speedBookings.length,
        revenue: Math.round(speedRevenue),
      };
    }

    // Break down party boat bookings by individual boat
    partyBookings.forEach(b => {
      const boatName = b.boatId?.name || 'Unknown';
      const boatKey = `party_${b.boatId?._id || 'unknown'}`;
      if (!boatStats[boatKey]) {
        boatStats[boatKey] = { name: boatName, type: 'Party Boat', bookings: 0, revenue: 0 };
      }
      boatStats[boatKey].bookings++;
      boatStats[boatKey].revenue += b.pricing?.finalAmount || b.pricing?.totalAmount || 0;
    });

    return Object.values(boatStats)
      .map(b => ({ ...b, revenue: Math.round(b.revenue) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }
}

module.exports = new AnalyticsService();
