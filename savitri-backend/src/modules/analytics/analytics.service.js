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

  /**
   * Get structured export data for a given period
   */
  async getExportData(period = '30d') {
    const { start, end } = this._getDateRange(period);
    const dateFilter = { createdAt: { $gte: start, $lte: end }, isDeleted: false };

    // Get overview stats
    const overview = await this.getOverview(period);

    // Get top boats
    const topBoats = await this.getTopBoats(period);

    // Get bookings with details for the table
    const speedBookings = await SpeedBoatBooking.find(dateFilter)
      .populate('customerId', 'name email')
      .sort({ date: -1 })
      .lean();

    const partyBookings = await PartyBoatBooking.find(dateFilter)
      .populate('customerId', 'name email')
      .populate('boatId', 'name')
      .sort({ date: -1 })
      .lean();

    // Build unified booking list
    const bookings = [];

    speedBookings.forEach((b) => {
      bookings.push({
        bookingNumber: b.bookingNumber,
        date: b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
        customer: b.customerId?.name || 'N/A',
        customerEmail: b.customerId?.email || '',
        boat: `Speed Boat (${b.numberOfBoats} boat${b.numberOfBoats > 1 ? 's' : ''})`,
        type: 'Speed Boat',
        duration: `${b.duration}h`,
        amount: b.pricing?.finalAmount || b.pricing?.totalAmount || 0,
        status: b.status,
        paymentStatus: b.paymentStatus,
      });
    });

    partyBookings.forEach((b) => {
      bookings.push({
        bookingNumber: b.bookingNumber,
        date: b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
        customer: b.customerId?.name || 'N/A',
        customerEmail: b.customerId?.email || '',
        boat: b.boatId?.name || 'Party Boat',
        type: 'Party Boat',
        duration: b.timeSlot || '',
        amount: b.pricing?.finalAmount || b.pricing?.totalAmount || 0,
        status: b.status,
        paymentStatus: b.paymentStatus,
      });
    });

    // Sort by date (newest first)
    bookings.sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('-');
      const dateB = b.date.split('/').reverse().join('-');
      return dateB.localeCompare(dateA);
    });

    const periodLabels = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', '1y': 'Last 1 Year', all: 'All Time' };

    return {
      period: periodLabels[period] || periodLabels['30d'],
      exportDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      overview,
      topBoats,
      bookings,
    };
  }

  /**
   * Generate CSV string from export data
   */
  generateCSV(data) {
    const lines = [];

    // Header comment rows
    lines.push(`"Savitri Shipping - Analytics Report"`);
    lines.push(`"Period: ${data.period}"`);
    lines.push(`"Generated: ${data.exportDate}"`);
    lines.push('');

    // Revenue Summary
    lines.push('"--- Revenue Summary ---"');
    lines.push(`"Total Revenue","${data.overview.totalRevenue}"`);
    lines.push(`"Total Bookings","${data.overview.totalBookings}"`);
    lines.push(`"Avg Booking Value","${data.overview.avgBookingValue}"`);
    lines.push(`"Cancellation Rate","${data.overview.cancellationRate}%"`);
    lines.push(`"New Customers","${data.overview.newCustomers}"`);
    lines.push(`"Pending Payments","${data.overview.pendingPayments}"`);
    lines.push(`"Speed Boat Bookings","${data.overview.speedBoatBookings}"`);
    lines.push(`"Party Boat Bookings","${data.overview.partyBoatBookings}"`);
    lines.push('');

    // Top Boats
    if (data.topBoats.length > 0) {
      lines.push('"--- Top Performing Boats ---"');
      lines.push('"Boat Name","Type","Bookings","Revenue"');
      data.topBoats.forEach((b) => {
        lines.push(`"${b.name}","${b.type}","${b.bookings}","${b.revenue}"`);
      });
      lines.push('');
    }

    // Bookings table
    lines.push('"--- Booking Details ---"');
    lines.push('"Booking Number","Date","Customer","Boat","Type","Duration","Amount (INR)","Status","Payment Status"');

    data.bookings.forEach((b) => {
      lines.push(
        `"${b.bookingNumber}","${b.date}","${b.customer}","${b.boat}","${b.type}","${b.duration}","${b.amount}","${b.status}","${b.paymentStatus}"`
      );
    });

    return lines.join('\n');
  }

  /**
   * Generate print-friendly HTML from export data (for PDF via browser print)
   */
  generatePrintHTML(data) {
    const formatCurrency = (amount) => {
      return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
    };

    const topBoatsRows = data.topBoats.map((b) => `
      <tr>
        <td>${b.name}</td>
        <td>${b.type}</td>
        <td>${b.bookings}</td>
        <td style="text-align:right">${formatCurrency(b.revenue)}</td>
      </tr>
    `).join('');

    const bookingRows = data.bookings.map((b) => `
      <tr>
        <td>${b.bookingNumber}</td>
        <td>${b.date}</td>
        <td>${b.customer}</td>
        <td>${b.boat}</td>
        <td>${b.duration}</td>
        <td style="text-align:right">${formatCurrency(b.amount)}</td>
        <td><span class="badge badge-${b.status.toLowerCase()}">${b.status}</span></td>
        <td><span class="badge badge-${b.paymentStatus.toLowerCase()}">${b.paymentStatus}</span></td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Savitri Shipping - Analytics Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; padding: 40px; font-size: 12px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0891b2; padding-bottom: 16px; }
    .header h1 { font-size: 22px; color: #0891b2; margin-bottom: 4px; }
    .header p { color: #666; font-size: 13px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 15px; font-weight: 600; color: #0891b2; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
    .stat-value { font-size: 20px; font-weight: 700; color: #1a1a1a; }
    .stat-label { font-size: 11px; color: #64748b; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f1f5f9; color: #475569; font-weight: 600; text-align: left; padding: 8px 10px; border-bottom: 2px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:last-child td { border-bottom: none; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
    .badge-confirmed, .badge-paid { background: #dcfce7; color: #166534; }
    .badge-completed { background: #dbeafe; color: #1e40af; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-cancelled { background: #fee2e2; color: #991b1b; }
    .badge-no_show { background: #fee2e2; color: #991b1b; }
    .badge-refunded, .badge-partially_refunded { background: #f3e8ff; color: #6b21a8; }
    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Savitri Shipping</h1>
    <p>Analytics Report - ${data.period} | Generated on ${data.exportDate}</p>
  </div>

  <div class="section">
    <div class="section-title">Revenue Summary</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${formatCurrency(data.overview.totalRevenue)}</div>
        <div class="stat-label">Total Revenue</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.overview.totalBookings}</div>
        <div class="stat-label">Total Bookings</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${formatCurrency(data.overview.avgBookingValue)}</div>
        <div class="stat-label">Avg Booking Value</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.overview.cancellationRate}%</div>
        <div class="stat-label">Cancellation Rate</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${data.overview.newCustomers}</div>
        <div class="stat-label">New Customers</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.overview.pendingPayments}</div>
        <div class="stat-label">Pending Payments</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.overview.speedBoatBookings}</div>
        <div class="stat-label">Speed Boat Bookings</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.overview.partyBoatBookings}</div>
        <div class="stat-label">Party Boat Bookings</div>
      </div>
    </div>
  </div>

  ${data.topBoats.length > 0 ? `
  <div class="section">
    <div class="section-title">Top Performing Boats</div>
    <table>
      <thead>
        <tr><th>Boat</th><th>Type</th><th>Bookings</th><th style="text-align:right">Revenue</th></tr>
      </thead>
      <tbody>${topBoatsRows}</tbody>
    </table>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Booking Details (${data.bookings.length} bookings)</div>
    <table>
      <thead>
        <tr><th>Booking #</th><th>Date</th><th>Customer</th><th>Boat</th><th>Duration</th><th style="text-align:right">Amount</th><th>Status</th><th>Payment</th></tr>
      </thead>
      <tbody>${bookingRows}</tbody>
    </table>
  </div>

  <div class="footer">
    Savitri Shipping - Confidential Report | Generated from Admin Panel
  </div>

  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
  }
}

module.exports = new AnalyticsService();
