import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList,
} from 'recharts';
import Button from '../../components/common/Button';
import { getOverview, getBookingStats, getAllBookingsForReports, getAllPartyBookingsForReports, getAllCustomersForReports } from '../../services/reports.service';
import useUIStore from '../../store/uiStore';
import { CURRENCY } from '../../utils/constants';
import styles from './Reports.module.css';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

const COLORS = ['#0891b2', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const formatFullCurrency = (amount) => {
  if (amount == null) return `${CURRENCY.SYMBOL}0`;
  return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
};

const BookingReports = () => {
  const { showSuccess, showError } = useUIStore();
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [overview, setOverview] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [conversionData, setConversionData] = useState([]);
  const [cancellationData, setCancellationData] = useState([]);
  const [peakHoursData, setPeakHoursData] = useState([]);
  const [customerRetention, setCustomerRetention] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, statsRes, bookingsRes, partyBookingsRes, customersRes] = await Promise.all([
        getOverview({ period }),
        getBookingStats({ period }),
        getAllBookingsForReports({ limit: 500, period }).catch(() => ({ success: false })),
        getAllPartyBookingsForReports({ limit: 500, period }).catch(() => ({ success: false })),
        getAllCustomersForReports({ limit: 500 }).catch(() => ({ success: false })),
      ]);
      if (overviewRes.success) setOverview(overviewRes.data);
      if (statsRes.success) setBookingStats(statsRes.data);

      const speedBookings = bookingsRes.success ? (bookingsRes.data?.docs || bookingsRes.data || []) : [];
      const partyBookings = partyBookingsRes.success ? (partyBookingsRes.data?.docs || partyBookingsRes.data || []) : [];
      const allBookings = [...(Array.isArray(speedBookings) ? speedBookings : []), ...(Array.isArray(partyBookings) ? partyBookings : [])];

      // Booking Conversion Rate (funnel)
      const totalCreated = allBookings.length;
      const confirmed = allBookings.filter(b => ['CONFIRMED', 'COMPLETED'].includes(b.status)).length;
      const completed = allBookings.filter(b => b.status === 'COMPLETED').length;
      setConversionData([
        { name: 'Created', value: totalCreated, fill: '#0891b2' },
        { name: 'Confirmed', value: confirmed, fill: '#22c55e' },
        { name: 'Completed', value: completed, fill: '#8b5cf6' },
      ]);

      // Cancellation Analysis
      const cancelledBookings = allBookings.filter(b => b.status === 'CANCELLED');
      const cancellationReasons = {};
      let totalRefundAmount = 0;
      cancelledBookings.forEach(b => {
        const reason = b.cancellation?.reason || b.cancelReason || 'Not specified';
        cancellationReasons[reason] = (cancellationReasons[reason] || 0) + 1;
        totalRefundAmount += b.cancellation?.refundAmount || 0;
      });
      setCancellationData({
        total: cancelledBookings.length,
        reasons: Object.entries(cancellationReasons).map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + '...' : name, value })),
        totalRefund: Math.round(totalRefundAmount),
        rate: totalCreated > 0 ? ((cancelledBookings.length / totalCreated) * 100).toFixed(1) : 0,
      });

      // Peak Hours / Time Slots
      const timeSlotMap = {};
      allBookings.forEach(b => {
        const slot = b.timeSlot || b.selectedTimeSlot || 'Unknown';
        const slotLabel = slot === 'MORNING' ? 'Morning' : slot === 'AFTERNOON' ? 'Afternoon' : slot === 'EVENING' ? 'Evening' : slot === 'FULL_DAY' ? 'Full Day' : slot;
        timeSlotMap[slotLabel] = (timeSlotMap[slotLabel] || 0) + 1;
      });
      setPeakHoursData(Object.entries(timeSlotMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));

      // Customer Retention
      const customers = customersRes.success ? (customersRes.data?.docs || customersRes.data || []) : [];
      const customerArr = Array.isArray(customers) ? customers : [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const newCustomers = customerArr.filter(c => new Date(c.createdAt) >= thirtyDaysAgo).length;
      const repeatCustomers = customerArr.filter(c => (c.completedRidesCount || 0) >= 2).length;
      const singleRideCustomers = customerArr.filter(c => (c.completedRidesCount || 0) === 1).length;
      const noRideCustomers = customerArr.filter(c => (c.completedRidesCount || 0) === 0).length;
      setCustomerRetention({
        total: customerArr.length,
        new: newCustomers,
        repeat: repeatCustomers,
        singleRide: singleRideCustomers,
        noRide: noRideCustomers,
        retentionRate: customerArr.length > 0 ? ((repeatCustomers / customerArr.length) * 100).toFixed(1) : 0,
      });
    } catch (err) {
      console.error('Booking reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  const handleExportCSV = () => {
    try {
      setExporting('csv');
      const statusData = bookingStats?.byStatus || [];
      const paymentData = bookingStats?.byPaymentMode || [];

      let csv = 'Savitri Shipping - Booking Reports\n';
      csv += `Period: ${PERIOD_OPTIONS.find(p => p.value === period)?.label || period}\n`;
      csv += `Generated: ${new Date().toLocaleDateString('en-IN')}\n\n`;

      // Booking Overview
      csv += '--- Booking Overview ---\n';
      csv += 'Metric,Value\n';
      csv += `Total Bookings,${overview?.totalBookings || 0}\n`;
      csv += `Speed Boat Bookings,${overview?.speedBoatBookings || 0}\n`;
      csv += `Party Boat Bookings,${overview?.partyBoatBookings || 0}\n`;
      csv += `Cancellation Rate,${overview?.cancellationRate?.toFixed(1) || 0}%\n\n`;

      // Status Distribution
      csv += '--- Status Distribution ---\n';
      csv += 'Status,Count\n';
      statusData.forEach(item => {
        csv += `${item.name},${item.value}\n`;
      });
      csv += '\n';

      // Payment Mode Breakdown
      csv += '--- Payment Mode Breakdown ---\n';
      csv += 'Payment Mode,Count\n';
      paymentData.forEach(item => {
        const name = item.name === 'ONLINE' ? 'Online' : item.name === 'AT_VENUE' ? 'At Venue' : item.name;
        csv += `${name},${item.value}\n`;
      });
      csv += '\n';

      // Cancellation Analysis
      csv += '--- Cancellation Analysis ---\n';
      csv += `Total Cancelled,${cancellationData?.total || 0}\n`;
      csv += `Cancellation Rate,${cancellationData?.rate || 0}%\n`;
      csv += `Total Refunded,${formatFullCurrency(cancellationData?.totalRefund)}\n`;
      if (cancellationData?.reasons?.length > 0) {
        csv += '\nReason,Count\n';
        cancellationData.reasons.forEach(item => {
          csv += `"${item.name}",${item.value}\n`;
        });
      }
      csv += '\n';

      // Conversion Funnel
      csv += '--- Booking Conversion Funnel ---\n';
      csv += 'Stage,Count\n';
      conversionData.forEach(item => {
        csv += `${item.name},${item.value}\n`;
      });
      csv += '\n';

      // Popular Time Slots
      csv += '--- Popular Time Slots ---\n';
      csv += 'Time Slot,Bookings\n';
      peakHoursData.forEach(item => {
        csv += `${item.name},${item.value}\n`;
      });
      csv += '\n';

      // Customer Retention
      if (customerRetention) {
        csv += '--- Customer Retention ---\n';
        csv += 'Metric,Value\n';
        csv += `Total Customers,${customerRetention.total}\n`;
        csv += `New Customers (30 days),${customerRetention.new}\n`;
        csv += `Repeat Customers (2+ rides),${customerRetention.repeat}\n`;
        csv += `Single Ride Customers,${customerRetention.singleRide}\n`;
        csv += `No Ride Customers,${customerRetention.noRide}\n`;
        csv += `Retention Rate,${customerRetention.retentionRate}%\n`;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `booking-reports-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('CSV report downloaded successfully');
    } catch (err) {
      console.error('CSV export error:', err);
      showError('Failed to export CSV report');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = () => {
    try {
      setExporting('pdf');
      const statusData = bookingStats?.byStatus || [];
      const paymentData = (bookingStats?.byPaymentMode || []).map(item => ({
        ...item,
        name: item.name === 'ONLINE' ? 'Online' : item.name === 'AT_VENUE' ? 'At Venue' : item.name,
      }));

      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Booking Reports - Savitri Shipping</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a2e; background: #fff; }
    h1 { font-size: 24px; margin-bottom: 4px; color: #0891b2; }
    h2 { font-size: 18px; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #0891b2; color: #1a1a2e; }
    .subtitle { font-size: 13px; color: #6b7280; margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat-card { padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
    .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .stat-value { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { text-align: left; padding: 10px 12px; background: #f1f5f9; border-bottom: 2px solid #e2e8f0; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
    tr:last-child td { border-bottom: none; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .section { margin-bottom: 24px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 20px; } .stats-grid { grid-template-columns: repeat(4, 1fr); } }
  </style>
</head>
<body>
  <h1>Booking Reports</h1>
  <p class="subtitle">Period: ${PERIOD_OPTIONS.find(p => p.value === period)?.label || period} | Generated: ${new Date().toLocaleDateString('en-IN')} | Savitri Shipping</p>

  <h2>Booking Overview</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total Bookings</div>
      <div class="stat-value">${overview?.totalBookings || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Speed Boat Bookings</div>
      <div class="stat-value">${overview?.speedBoatBookings || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Party Boat Bookings</div>
      <div class="stat-value">${overview?.partyBoatBookings || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Cancellation Rate</div>
      <div class="stat-value">${overview?.cancellationRate?.toFixed(1) || 0}%</div>
    </div>
  </div>

  <div class="two-col">
    <div class="section">
      <h2>Status Distribution</h2>
      <table>
        <thead><tr><th>Status</th><th>Count</th></tr></thead>
        <tbody>
          ${statusData.map(item => `<tr><td>${item.name}</td><td>${item.value}</td></tr>`).join('')}
          ${statusData.length === 0 ? '<tr><td colspan="2" style="text-align:center;color:#9ca3af;">No data</td></tr>' : ''}
        </tbody>
      </table>
    </div>
    <div class="section">
      <h2>Payment Mode Breakdown</h2>
      <table>
        <thead><tr><th>Payment Mode</th><th>Count</th></tr></thead>
        <tbody>
          ${paymentData.map(item => `<tr><td>${item.name}</td><td>${item.value}</td></tr>`).join('')}
          ${paymentData.length === 0 ? '<tr><td colspan="2" style="text-align:center;color:#9ca3af;">No data</td></tr>' : ''}
        </tbody>
      </table>
    </div>
  </div>

  <h2>Booking Conversion Funnel</h2>
  <table>
    <thead><tr><th>Stage</th><th>Count</th><th>Rate</th></tr></thead>
    <tbody>
      ${conversionData.map((item, i) => `<tr><td>${item.name}</td><td>${item.value}</td><td>${conversionData[0].value > 0 ? ((item.value / conversionData[0].value) * 100).toFixed(0) : 0}%</td></tr>`).join('')}
    </tbody>
  </table>

  <h2>Popular Time Slots</h2>
  <table>
    <thead><tr><th>Time Slot</th><th>Bookings</th></tr></thead>
    <tbody>
      ${peakHoursData.map(item => `<tr><td>${item.name}</td><td>${item.value}</td></tr>`).join('')}
      ${peakHoursData.length === 0 ? '<tr><td colspan="2" style="text-align:center;color:#9ca3af;">No data</td></tr>' : ''}
    </tbody>
  </table>

  <div class="two-col">
    <div class="section">
      <h2>Cancellation Analysis</h2>
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-card">
          <div class="stat-label">Total Cancelled</div>
          <div class="stat-value">${cancellationData?.total || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Cancel Rate</div>
          <div class="stat-value">${cancellationData?.rate || 0}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Refunded</div>
          <div class="stat-value">${formatFullCurrency(cancellationData?.totalRefund)}</div>
        </div>
      </div>
      ${cancellationData?.reasons?.length > 0 ? `
      <table>
        <thead><tr><th>Reason</th><th>Count</th></tr></thead>
        <tbody>
          ${cancellationData.reasons.map(item => `<tr><td>${item.name}</td><td>${item.value}</td></tr>`).join('')}
        </tbody>
      </table>` : ''}
    </div>
    <div class="section">
      <h2>Customer Retention</h2>
      ${customerRetention ? `
      <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="stat-card">
          <div class="stat-label">Total Customers</div>
          <div class="stat-value">${customerRetention.total}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">New (30 days)</div>
          <div class="stat-value">${customerRetention.new}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Repeat (2+ rides)</div>
          <div class="stat-value">${customerRetention.repeat}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Retention Rate</div>
          <div class="stat-value">${customerRetention.retentionRate}%</div>
        </div>
      </div>
      <table>
        <thead><tr><th>Segment</th><th>Count</th></tr></thead>
        <tbody>
          <tr><td>Repeat Customers (2+ rides)</td><td>${customerRetention.repeat}</td></tr>
          <tr><td>Single Ride Customers</td><td>${customerRetention.singleRide}</td></tr>
          <tr><td>No Ride Customers</td><td>${customerRetention.noRide}</td></tr>
        </tbody>
      </table>` : '<p style="color:#9ca3af;text-align:center;">No customer data available</p>'}
    </div>
  </div>

  <div class="footer">Savitri Shipping - Booking Reports | Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}</div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
      }
      showSuccess('PDF report opened in new tab');
    } catch (err) {
      console.error('PDF export error:', err);
      showError('Failed to export PDF report');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading booking reports...</div>
      </div>
    );
  }

  const statusData = bookingStats?.byStatus || [];
  const paymentData = (bookingStats?.byPaymentMode || []).map(item => ({
    ...item,
    name: item.name === 'ONLINE' ? 'Online' : item.name === 'AT_VENUE' ? 'At Venue' : item.name,
  }));
  const boatTypeData = bookingStats?.byType || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Booking Reports</h1>
        <div className={styles.headerActions}>
          <div className={styles.exportButtons}>
            <Button variant="outline" size="sm" onClick={handleExportCSV} loading={exporting === 'csv'} disabled={!!exporting}>
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} loading={exporting === 'pdf'} disabled={!!exporting}>
              Export PDF
            </Button>
          </div>
          <div className={styles.periodSelector}>
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.periodBtn} ${period === opt.value ? styles.periodBtnActive : ''}`}
                onClick={() => setPeriod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Total Bookings</span>
          <span className={styles.overviewValue}>{overview?.totalBookings || 0}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Speed Boat Bookings</span>
          <span className={styles.overviewValue}>{overview?.speedBoatBookings || 0}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Party Boat Bookings</span>
          <span className={styles.overviewValue}>{overview?.partyBoatBookings || 0}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Cancellation Rate</span>
          <span className={styles.overviewValue}>{overview?.cancellationRate?.toFixed(1) || 0}%</span>
        </div>
      </div>

      {/* Existing Charts Row */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Bookings by Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No booking data</div>
          )}
        </div>

        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Payment Mode</h2>
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No payment data</div>
          )}
        </div>

        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Speed vs Party Boats</h2>
          {boatTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={boatTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0891b2" radius={[4, 4, 0, 0]}>
                  {boatTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No boat type data</div>
          )}
        </div>
      </div>

      {/* New Analytics: Conversion Funnel + Peak Hours */}
      <div className={styles.chartsRowTwo}>
        {/* Booking Conversion Rate */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Booking Conversion Funnel</h2>
          {conversionData.length > 0 && conversionData[0].value > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={conversionData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {conversionData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className={styles.conversionStats}>
                <span>Confirmation Rate: <strong>{conversionData[0].value > 0 ? ((conversionData[1].value / conversionData[0].value) * 100).toFixed(0) : 0}%</strong></span>
                <span>Completion Rate: <strong>{conversionData[0].value > 0 ? ((conversionData[2].value / conversionData[0].value) * 100).toFixed(0) : 0}%</strong></span>
              </div>
            </div>
          ) : (
            <div className={styles.noData}>No conversion data available</div>
          )}
        </div>

        {/* Peak Hours / Time Slots */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Popular Time Slots</h2>
          {peakHoursData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {peakHoursData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No time slot data available</div>
          )}
        </div>
      </div>

      {/* Cancellation Analysis + Customer Retention */}
      <div className={styles.chartsRowTwo}>
        {/* Cancellation Analysis */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Cancellation Analysis</h2>
          {cancellationData?.total > 0 ? (
            <div>
              <div className={styles.cancellationStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Cancelled</span>
                  <span className={styles.statValue}>{cancellationData.total}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Cancel Rate</span>
                  <span className={styles.statValue}>{cancellationData.rate}%</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Refunded</span>
                  <span className={styles.statValue}>{formatFullCurrency(cancellationData.totalRefund)}</span>
                </div>
              </div>
              {cancellationData.reasons.length > 0 && (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={cancellationData.reasons} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {cancellationData.reasons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className={styles.noData}>No cancellations in this period</div>
          )}
        </div>

        {/* Customer Retention */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Customer Retention</h2>
          {customerRetention ? (
            <div>
              <div className={styles.retentionGrid}>
                <div className={styles.retentionCard}>
                  <span className={styles.retentionValue}>{customerRetention.total}</span>
                  <span className={styles.retentionLabel}>Total Customers</span>
                </div>
                <div className={styles.retentionCard}>
                  <span className={styles.retentionValue}>{customerRetention.new}</span>
                  <span className={styles.retentionLabel}>New (30 days)</span>
                </div>
                <div className={styles.retentionCard}>
                  <span className={styles.retentionValue}>{customerRetention.repeat}</span>
                  <span className={styles.retentionLabel}>Repeat (2+ rides)</span>
                </div>
                <div className={styles.retentionCard}>
                  <span className={styles.retentionValue}>{customerRetention.retentionRate}%</span>
                  <span className={styles.retentionLabel}>Retention Rate</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Repeat (2+)', value: customerRetention.repeat },
                      { name: 'Single ride', value: customerRetention.singleRide },
                      { name: 'No rides', value: customerRetention.noRide },
                    ].filter(d => d.value > 0)}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={styles.noData}>No customer data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingReports;
