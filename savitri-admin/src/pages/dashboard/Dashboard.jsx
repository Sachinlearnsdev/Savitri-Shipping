import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import useUIStore from '../../store/uiStore';
import { getAllBookings, getRecentModifications } from '../../services/bookings.service';
import { getAllBoats } from '../../services/speedBoats.service';
import { getAllCustomers } from '../../services/customers.service';
import { getCurrentWeather, getCalendar } from '../../services/calendar.service';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  CALENDAR_STATUS,
  CURRENCY,
} from '../../utils/constants';
import styles from './Dashboard.module.css';

const INDIAN_FESTIVALS_2026 = {
  '2026-01-01': 'New Year',
  '2026-01-14': 'Makar Sankranti',
  '2026-01-26': 'Republic Day',
  '2026-02-14': "Valentine's Day",
  '2026-03-10': 'Maha Shivaratri',
  '2026-03-17': 'Holi',
  '2026-03-30': 'Ugadi',
  '2026-03-31': 'Eid ul-Fitr',
  '2026-04-02': 'Ram Navami',
  '2026-04-06': 'Mahavir Jayanti',
  '2026-04-14': 'Ambedkar Jayanti',
  '2026-05-01': 'May Day',
  '2026-05-12': 'Buddha Purnima',
  '2026-06-07': 'Eid ul-Adha',
  '2026-07-07': 'Muharram',
  '2026-08-06': 'Raksha Bandhan',
  '2026-08-15': 'Independence Day',
  '2026-08-14': 'Janmashtami',
  '2026-09-05': 'Milad-un-Nabi',
  '2026-09-17': 'Ganesh Chaturthi',
  '2026-10-02': 'Gandhi Jayanti',
  '2026-10-12': 'Dussehra',
  '2026-10-20': 'Karwa Chauth',
  '2026-10-31': 'Diwali',
  '2026-11-02': 'Bhai Dooj',
  '2026-11-14': "Children's Day",
  '2026-11-19': 'Guru Nanak Jayanti',
  '2026-12-25': 'Christmas',
  '2026-12-31': "New Year's Eve",
};

const WEATHER_EMOJI = {
  0: '\u2600\uFE0F', 1: '\uD83C\uDF24\uFE0F', 2: '\u26C5', 3: '\u2601\uFE0F',
  45: '\uD83C\uDF2B\uFE0F', 48: '\uD83C\uDF2B\uFE0F',
  51: '\uD83C\uDF26\uFE0F', 53: '\uD83C\uDF26\uFE0F', 55: '\uD83C\uDF27\uFE0F',
  61: '\uD83C\uDF27\uFE0F', 63: '\uD83C\uDF27\uFE0F', 65: '\uD83C\uDF27\uFE0F',
  80: '\uD83C\uDF26\uFE0F', 81: '\uD83C\uDF27\uFE0F', 82: '\u26C8\uFE0F',
  95: '\u26C8\uFE0F', 96: '\u26C8\uFE0F', 99: '\u26C8\uFE0F',
};

const getWeatherEmoji = (code) => WEATHER_EMOJI[code] || '\uD83C\uDF24\uFE0F';

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
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [todayCalendarStatus, setTodayCalendarStatus] = useState(null);
  const [recentMods, setRecentMods] = useState([]);

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

  const getTodayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayFestival = INDIAN_FESTIVALS_2026[getTodayStr()] || null;

  const getUpcomingFestivals = () => {
    const todayKey = getTodayStr();
    return Object.entries(INDIAN_FESTIVALS_2026)
      .filter(([date]) => date > todayKey)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 3)
      .map(([date, name]) => {
        const d = new Date(date + 'T00:00:00');
        const formatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
        return { date, name, formatted };
      });
  };

  const upcomingFestivals = getUpcomingFestivals();

  const getRecommendationBadge = (recommendation) => {
    if (recommendation === 'dangerous') return { label: 'Dangerous', className: styles.badgeDangerous };
    if (recommendation === 'caution') return { label: 'Caution', className: styles.badgeCaution };
    return { label: 'Safe', className: styles.badgeSafe };
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

        // Fetch weather, calendar status, and recent modifications (non-critical)
        try {
          const [weatherRes, calendarRes, modsRes] = await Promise.all([
            getCurrentWeather().catch(() => null),
            getCalendar({ month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}` }).catch(() => null),
            getRecentModifications(7).catch(() => null),
          ]);

          if (modsRes?.data) {
            setRecentMods(Array.isArray(modsRes.data) ? modsRes.data : []);
          }

          if (weatherRes?.success) {
            setWeatherInfo(weatherRes.data);
          }

          if (calendarRes?.success) {
            const items = Array.isArray(calendarRes.data) ? calendarRes.data : calendarRes.data?.items || [];
            const todayEntry = items.find((entry) => {
              const dateKey = entry.date ? entry.date.split('T')[0] : null;
              return dateKey === todayStr;
            });
            setTodayCalendarStatus(todayEntry?.status || CALENDAR_STATUS.OPEN);
          }
        } catch {
          // Weather/calendar fetch failure is non-critical
        }
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

      {/* Weather & Calendar Row */}
      <div className={styles.weatherCalendarRow}>
        {/* Today's Weather Card */}
        <div className={styles.weatherCard}>
          <h2 className={styles.sectionTitle}>Today's Weather - Mumbai</h2>
          {weatherInfo ? (
            <>
              <div className={styles.weatherMain}>
                <span className={styles.weatherEmoji}>{getWeatherEmoji(weatherInfo.weatherCode)}</span>
                <div>
                  <span className={styles.weatherTemp}>{Math.round(weatherInfo.temperature)}&deg;C</span>
                  <span className={styles.weatherDesc}>{weatherInfo.weatherDescription}</span>
                </div>
              </div>
              <div className={styles.weatherGrid}>
                <div className={styles.weatherDetail}>
                  <span className={styles.weatherDetailLabel}>Wind Speed</span>
                  <span className={styles.weatherDetailValue}>{Math.round(weatherInfo.windSpeed)} km/h</span>
                </div>
                <div className={styles.weatherDetail}>
                  <span className={styles.weatherDetailLabel}>Wave Height</span>
                  <span className={styles.weatherDetailValue}>{weatherInfo.waveHeight.toFixed(1)} m</span>
                </div>
                <div className={styles.weatherDetail}>
                  <span className={styles.weatherDetailLabel}>Humidity</span>
                  <span className={styles.weatherDetailValue}>{weatherInfo.humidity}%</span>
                </div>
                <div className={styles.weatherDetail}>
                  <span className={styles.weatherDetailLabel}>Wind Gusts</span>
                  <span className={styles.weatherDetailValue}>{Math.round(weatherInfo.windGusts)} km/h</span>
                </div>
              </div>
              <div className={styles.weatherBadgeRow}>
                <span className={`${styles.weatherBadge} ${getRecommendationBadge(weatherInfo.recommendation).className}`}>
                  {getRecommendationBadge(weatherInfo.recommendation).label} for Boating
                </span>
              </div>
            </>
          ) : (
            <p className={styles.weatherUnavailable}>Weather data unavailable</p>
          )}
        </div>

        {/* Today's Calendar & Festivals Card */}
        <div className={styles.festivalCard}>
          <h2 className={styles.sectionTitle}>Today's Calendar</h2>
          <div className={styles.calendarStatusRow}>
            <span className={styles.calendarStatusLabel}>Operations Status:</span>
            <span className={`${styles.calendarStatusBadge} ${
              todayCalendarStatus === CALENDAR_STATUS.CLOSED ? styles.calendarStatusClosed
                : todayCalendarStatus === CALENDAR_STATUS.PARTIAL_CLOSED ? styles.calendarStatusPartial
                  : styles.calendarStatusOpen
            }`}>
              {todayCalendarStatus === CALENDAR_STATUS.CLOSED ? 'Closed'
                : todayCalendarStatus === CALENDAR_STATUS.PARTIAL_CLOSED ? 'Partial Close'
                  : 'Open'}
            </span>
          </div>
          {todayFestival && (
            <div className={styles.todayFestival}>
              <span className={styles.todayFestivalIcon}>{'\uD83C\uDF89'}</span>
              <span>Today is <strong>{todayFestival}</strong></span>
            </div>
          )}
          <div className={styles.upcomingFestivals}>
            <h3 className={styles.upcomingTitle}>Upcoming Festivals</h3>
            {upcomingFestivals.length > 0 ? (
              upcomingFestivals.map((f) => (
                <div key={f.date} className={styles.festivalItem}>
                  <span className={styles.festivalName}>{f.name}</span>
                  <span className={styles.festivalDate}>{f.formatted}</span>
                </div>
              ))
            ) : (
              <p className={styles.noFestivals}>No upcoming festivals</p>
            )}
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

      {/* Recent Modifications */}
      {recentMods.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Modifications (Last 7 Days)</h2>
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Customer</th>
                    <th>Old Date</th>
                    <th>New Date</th>
                    <th>Modified At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMods.map((booking) => {
                    // Get the most recent modification
                    const mods = booking.dateModifications || [];
                    const latestMod = mods[mods.length - 1];
                    if (!latestMod) return null;
                    return (
                      <tr
                        key={booking.id || booking._id}
                        className={styles.clickableRow}
                        onClick={() => navigate(`/bookings/${booking.id || booking._id}`)}
                      >
                        <td className={styles.bookingNumber}>
                          {booking.bookingNumber || booking.id || booking._id}
                        </td>
                        <td>{booking.customerId?.name || '-'}</td>
                        <td style={{ color: '#ef4444', textDecoration: 'line-through' }}>
                          {formatDate(latestMod.previousDate)} {latestMod.previousStartTime || ''}
                        </td>
                        <td style={{ color: '#059669', fontWeight: 'var(--font-weight-semibold)' }}>
                          {formatDate(latestMod.newDate)} {latestMod.newStartTime || ''}
                        </td>
                        <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                          {latestMod.modifiedAt ? new Date(latestMod.modifiedAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          }) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
