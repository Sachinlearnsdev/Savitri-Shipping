import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList,
} from 'recharts';
import { getOverview, getBookingStats, getAllBookingsForReports, getAllPartyBookingsForReports, getAllCustomersForReports } from '../../services/reports.service';
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
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
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
