import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import Badge from '../../components/common/Badge';
import { getOverview, getRevenueChart, getBookingStats, getTopBoats } from '../../services/reports.service';
import { CURRENCY } from '../../utils/constants';
import styles from './Reports.module.css';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

const COLORS = ['#0891b2', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [topBoats, setTopBoats] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes, statsRes, boatsRes] = await Promise.all([
        getOverview({ period }),
        getRevenueChart({ period }),
        getBookingStats({ period }),
        getTopBoats({ period }),
      ]);
      if (overviewRes.success) setOverview(overviewRes.data);
      if (revenueRes.success) setRevenueData(revenueRes.data || []);
      if (statsRes.success) setBookingStats(statsRes.data);
      if (boatsRes.success) setTopBoats(boatsRes.data || []);
    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  const formatCurrency = (amount) => {
    if (amount == null) return `${CURRENCY.SYMBOL}0`;
    if (amount >= 100000) return `${CURRENCY.SYMBOL}${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `${CURRENCY.SYMBOL}${(amount / 1000).toFixed(1)}K`;
    return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatFullCurrency = (amount) => {
    if (amount == null) return `${CURRENCY.SYMBOL}0`;
    return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading reports...</div>
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
        <h1 className={styles.title}>Reports & Insights</h1>
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
          <span className={styles.overviewLabel}>Total Revenue</span>
          <span className={styles.overviewValue}>{formatFullCurrency(overview?.totalRevenue)}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Total Bookings</span>
          <span className={styles.overviewValue}>{overview?.totalBookings || 0}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Avg Booking Value</span>
          <span className={styles.overviewValue}>{formatFullCurrency(overview?.avgBookingValue)}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Cancellation Rate</span>
          <span className={styles.overviewValue}>{overview?.cancellationRate?.toFixed(1) || 0}%</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>New Customers</span>
          <span className={styles.overviewValue}>{overview?.newCustomers || 0}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Pending Payments</span>
          <span className={styles.overviewValue}>{overview?.pendingPayments || 0}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Speed Boat Bookings</span>
          <span className={styles.overviewValue}>{overview?.speedBoatBookings || 0}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Party Boat Bookings</span>
          <span className={styles.overviewValue}>{overview?.partyBoatBookings || 0}</span>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Revenue Over Time</h2>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip formatter={(value, name) => [formatFullCurrency(value), name === 'total' ? 'Total' : name === 'speedBoat' ? 'Speed Boat' : 'Party Boat']} />
              <Legend formatter={(value) => value === 'total' ? 'Total' : value === 'speedBoat' ? 'Speed Boat' : 'Party Boat'} />
              <Line type="monotone" dataKey="total" stroke="#0891b2" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="speedBoat" stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="partyBoat" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noData}>No revenue data for this period</div>
        )}
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

      {/* Top Boats Table */}
      <div className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Top Performing Boats</h2>
        {topBoats.length > 0 ? (
          <table className={styles.topBoatsTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>Boat Name</th>
                <th>Type</th>
                <th>Bookings</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topBoats.map((boat, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className={styles.boatName}>{boat.name || 'Unknown'}</td>
                  <td>
                    <Badge variant={boat.type === 'Speed Boat' ? 'success' : 'warning'}>
                      {boat.type}
                    </Badge>
                  </td>
                  <td>{boat.bookings || 0}</td>
                  <td className={styles.revenueCell}>{formatFullCurrency(boat.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.noData}>No boat data for this period</div>
        )}
      </div>
    </div>
  );
};

export default Reports;
