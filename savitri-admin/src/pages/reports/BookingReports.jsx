import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getOverview, getBookingStats } from '../../services/reports.service';
import styles from './Reports.module.css';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

const COLORS = ['#0891b2', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899'];

const BookingReports = () => {
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, statsRes] = await Promise.all([
        getOverview({ period }),
        getBookingStats({ period }),
      ]);
      if (overviewRes.success) setOverview(overviewRes.data);
      if (statsRes.success) setBookingStats(statsRes.data);
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

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Booking Status Pie */}
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

        {/* Payment Mode Pie */}
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

        {/* Boat Type Comparison */}
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
    </div>
  );
};

export default BookingReports;
