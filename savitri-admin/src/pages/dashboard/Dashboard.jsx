import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import useUIStore from '../../store/uiStore';
import { getAllBookings } from '../../services/bookings.service';
import { getAllBoats } from '../../services/speedBoats.service';
import { getAllCustomers } from '../../services/customers.service';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  CURRENCY,
} from '../../utils/constants';
import styles from './Dashboard.module.css';

/**
 * Dashboard Page
 * Main dashboard with welcome message, stats, today's schedule, and recent bookings
 */
const Dashboard = () => {
  const { getUserName } = useAuth();
  const { showError } = useUIStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayBookings: 0,
    monthRevenue: 0,
    activeBoats: 0,
    totalCustomers: 0,
    newCustomersThisMonth: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  const formatCurrency = (amount) => {
    if (amount == null) return `${CURRENCY.SYMBOL}0`;
    return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return timeStr;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Get first day of current month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        // Fetch all data in parallel
        const [
          todayBookingsRes,
          monthBookingsRes,
          boatsRes,
          customersRes,
          recentBookingsRes,
        ] = await Promise.all([
          getAllBookings({ date: todayStr, limit: 100 }).catch(() => null),
          getAllBookings({ startDate: monthStartStr, endDate: todayStr, limit: 1000 }).catch(() => null),
          getAllBoats({ status: 'ACTIVE', limit: 1 }).catch(() => null),
          getAllCustomers({ limit: 1 }).catch(() => null),
          getAllBookings({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => null),
        ]);

        // Process today's bookings
        const todayItems = todayBookingsRes?.data?.items || todayBookingsRes?.data || [];
        const todayCount = todayBookingsRes?.data?.pagination?.total || todayItems.length || 0;

        // Process month revenue
        const monthItems = monthBookingsRes?.data?.items || monthBookingsRes?.data || [];
        let monthRevenue = 0;
        if (Array.isArray(monthItems)) {
          monthRevenue = monthItems.reduce((sum, b) => {
            return sum + (Number(b.pricing?.finalAmount) || Number(b.pricing?.totalAmount) || 0);
          }, 0);
        }

        // Process boats count
        const boatsPagination = boatsRes?.data?.pagination || boatsRes?.pagination || {};
        const activeBoats = boatsPagination.total || (boatsRes?.data?.items || boatsRes?.data || []).length || 0;

        // Process customers count
        const customersPagination = customersRes?.data?.pagination || customersRes?.pagination || {};
        const totalCustomers = customersPagination.total || 0;

        // Process recent bookings
        const recent = recentBookingsRes?.data?.items || recentBookingsRes?.data || [];

        setStats({
          todayBookings: todayCount,
          monthRevenue,
          activeBoats,
          totalCustomers,
          newCustomersThisMonth: 0,
        });
        setTodaySchedule(Array.isArray(todayItems) ? todayItems : []);
        setRecentBookings(Array.isArray(recent) ? recent.slice(0, 5) : []);
      } catch (err) {
        showError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.welcome}>
          <h1 className={styles.title}>Welcome back, {getUserName()}!</h1>
          <p className={styles.subtitle}>Loading your dashboard...</p>
        </div>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Welcome Section */}
      <div className={styles.welcome}>
        <h1 className={styles.title}>Welcome back, {getUserName()}!</h1>
        <p className={styles.subtitle}>
          Here's what's happening with your boat services today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <span>📅</span>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Today's Bookings</h3>
            <p className={styles.statValue}>{stats.todayBookings}</p>
            <span className={styles.statSubInfo}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <span>💰</span>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Month Revenue</h3>
            <p className={styles.statValue}>{formatCurrency(stats.monthRevenue)}</p>
            <span className={styles.statSubInfo}>
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <span>🚤</span>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Active Boats</h3>
            <p className={styles.statValue}>{stats.activeBoats}</p>
            <span className={styles.statSubInfo}>Currently operational</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <span>👥</span>
          </div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Total Customers</h3>
            <p className={styles.statValue}>{stats.totalCustomers}</p>
            <span className={styles.statSubInfo}>Registered accounts</span>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Today's Schedule</h2>
        {todaySchedule.length === 0 ? (
          <div className={styles.emptyCard}>
            <p>No bookings scheduled for today.</p>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Boat</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedule.map((booking) => (
                    <tr
                      key={booking.id || booking._id}
                      className={styles.clickableRow}
                      onClick={() => navigate(`/bookings/${booking.id || booking._id}`)}
                    >
                      <td>{formatTime(booking.startTime)}</td>
                      <td>{booking.numberOfBoats || '-'} boat(s)</td>
                      <td>{booking.customerId?.name || '-'}</td>
                      <td>
                        <Badge variant={BOOKING_STATUS_COLORS[booking.status] || 'default'}>
                          {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={PAYMENT_STATUS_COLORS[booking.paymentStatus] || 'default'}>
                          {PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus || '-'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <div className={styles.emptyCard}>
            <p>No bookings yet. Create your first booking to get started.</p>
          </div>
        ) : (
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.id || booking._id}
                      className={styles.clickableRow}
                      onClick={() => navigate(`/bookings/${booking.id || booking._id}`)}
                    >
                      <td className={styles.bookingNumber}>
                        {booking.bookingNumber || booking.id || booking._id}
                      </td>
                      <td>{booking.customerId?.name || '-'}</td>
                      <td>{formatDate(booking.date)}</td>
                      <td className={styles.amount}>
                        {formatCurrency(booking.pricing?.finalAmount || booking.pricing?.totalAmount)}
                      </td>
                      <td>
                        <Badge variant={BOOKING_STATUS_COLORS[booking.status] || 'default'}>
                          {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActions}>
          <Button onClick={() => navigate('/bookings')}>
            View All Bookings
          </Button>
          <Button variant="outline" onClick={() => navigate('/speed-boats')}>
            Manage Boats
          </Button>
          <Button variant="outline" onClick={() => navigate('/speed-boats/calendar')}>
            Operating Calendar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
