import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from 'recharts';
import Badge from '../../components/common/Badge';
import { getTopBoats, getBookingStats, getAllBookingsForReports, getAllPartyBookingsForReports, getAllSpeedBoatsForReports, getAllPartyBoatsForReports } from '../../services/reports.service';
import { CURRENCY } from '../../utils/constants';
import styles from './Reports.module.css';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

const COLORS = ['#0891b2', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

const BoatPerformance = () => {
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [topBoats, setTopBoats] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);
  const [utilizationData, setUtilizationData] = useState([]);
  const [revenuePerBoatPerDay, setRevenuePerBoatPerDay] = useState([]);
  const [topPerformingDays, setTopPerformingDays] = useState([]);

  const getPeriodDays = (p) => {
    switch (p) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boatsRes, statsRes, bookingsRes, partyBookingsRes, speedBoatsRes, partyBoatsRes] = await Promise.all([
        getTopBoats({ period }),
        getBookingStats({ period }),
        getAllBookingsForReports({ limit: 500, period }).catch(() => ({ success: false })),
        getAllPartyBookingsForReports({ limit: 500, period }).catch(() => ({ success: false })),
        getAllSpeedBoatsForReports({ limit: 100 }).catch(() => ({ success: false })),
        getAllPartyBoatsForReports({ limit: 100 }).catch(() => ({ success: false })),
      ]);
      if (boatsRes.success) setTopBoats(boatsRes.data || []);
      if (statsRes.success) setBookingStats(statsRes.data);

      const speedBookings = bookingsRes.success ? (bookingsRes.data?.docs || bookingsRes.data || []) : [];
      const partyBookings = partyBookingsRes.success ? (partyBookingsRes.data?.docs || partyBookingsRes.data || []) : [];
      const allBookings = [...(Array.isArray(speedBookings) ? speedBookings : []), ...(Array.isArray(partyBookings) ? partyBookings : [])];

      const allSpeedBoats = speedBoatsRes.success ? (speedBoatsRes.data?.docs || speedBoatsRes.data || []) : [];
      const allPartyBoats = partyBoatsRes.success ? (partyBoatsRes.data?.docs || partyBoatsRes.data || []) : [];
      const totalBoats = (Array.isArray(allSpeedBoats) ? allSpeedBoats.length : 0) + (Array.isArray(allPartyBoats) ? allPartyBoats.length : 0);

      const periodDays = getPeriodDays(period);

      // Utilization Rate - booked slots per boat vs available slots
      // Each boat has ~3 time slots per day (morning, afternoon, evening)
      const slotsPerDay = 3;
      const boatBookingCounts = {};
      const boatNames = {};

      // Map all boats by ID
      if (Array.isArray(allSpeedBoats)) {
        allSpeedBoats.forEach(b => { boatNames[b.id || b._id] = b.name; });
      }
      if (Array.isArray(allPartyBoats)) {
        allPartyBoats.forEach(b => { boatNames[b.id || b._id] = b.name; });
      }

      allBookings.forEach(b => {
        if (['CONFIRMED', 'COMPLETED'].includes(b.status)) {
          // For speed boats with per-boat selection
          if (b.boatIds && b.boatIds.length > 0) {
            b.boatIds.forEach(bid => {
              const id = typeof bid === 'object' ? (bid._id || bid.id || bid) : bid;
              boatBookingCounts[id] = (boatBookingCounts[id] || 0) + 1;
            });
          } else if (b.boats && b.boats.length > 0) {
            b.boats.forEach(boat => {
              const name = boat.boatName || 'Unknown';
              boatBookingCounts[name] = (boatBookingCounts[name] || 0) + 1;
            });
          } else {
            const boatId = b.boatId?._id || b.boatId?.id || b.boatId || 'Unknown';
            boatBookingCounts[boatId] = (boatBookingCounts[boatId] || 0) + 1;
          }
        }
      });

      const totalAvailableSlots = slotsPerDay * periodDays;
      const utilization = Object.entries(boatBookingCounts)
        .map(([key, count]) => {
          const name = boatNames[key] || key;
          const rate = totalAvailableSlots > 0 ? Math.min(100, Math.round((count / totalAvailableSlots) * 100)) : 0;
          return { name: name.length > 15 ? name.slice(0, 15) + '...' : name, utilization: rate, bookings: count };
        })
        .sort((a, b) => b.utilization - a.utilization)
        .slice(0, 8);
      setUtilizationData(utilization);

      // Revenue per boat per day average
      const boatRevenue = {};
      const boatDays = {};
      allBookings.forEach(b => {
        if (b.paymentStatus === 'PAID' || b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
          const boatName = b.boats?.[0]?.boatName || b.boatId?.name || b.boatName || 'Unknown';
          const amount = b.pricing?.totalAmount || b.totalAmount || b.amount || 0;
          if (!boatRevenue[boatName]) {
            boatRevenue[boatName] = 0;
            boatDays[boatName] = new Set();
          }
          boatRevenue[boatName] += amount;
          const dateStr = new Date(b.date || b.createdAt).toISOString().split('T')[0];
          boatDays[boatName].add(dateStr);
        }
      });

      const revPerBoatPerDay = Object.entries(boatRevenue)
        .map(([name, revenue]) => {
          const activeDays = boatDays[name]?.size || 1;
          return {
            name: name.length > 15 ? name.slice(0, 15) + '...' : name,
            avgRevenue: Math.round(revenue / activeDays),
            totalRevenue: Math.round(revenue),
          };
        })
        .sort((a, b) => b.avgRevenue - a.avgRevenue)
        .slice(0, 8);
      setRevenuePerBoatPerDay(revPerBoatPerDay);

      // Top Performing Days of Week
      const dayRevenue = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
      const dayBookings = [0, 0, 0, 0, 0, 0, 0];
      allBookings.forEach(b => {
        const bDate = new Date(b.date || b.createdAt);
        const dayOfWeek = bDate.getDay();
        const amount = b.pricing?.totalAmount || b.totalAmount || b.amount || 0;
        if (b.paymentStatus === 'PAID' || b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
          dayRevenue[dayOfWeek] += amount;
        }
        dayBookings[dayOfWeek]++;
      });

      setTopPerformingDays(DAY_NAMES.map((name, i) => ({
        name,
        revenue: Math.round(dayRevenue[i]),
        bookings: dayBookings[i],
      })));
    } catch (err) {
      console.error('Boat performance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading boat performance...</div>
      </div>
    );
  }

  const boatTypeData = bookingStats?.byType || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Boat Performance</h1>
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

      {/* Top Performing Boats Table */}
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

      {/* Utilization + Revenue per Boat per Day */}
      <div className={styles.chartsRowTwo}>
        {/* Utilization Rate */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Utilization Rate (Booked vs Available Slots)</h2>
          {utilizationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={utilizationData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(value, name) => name === 'utilization' ? `${value}%` : value} />
                <Bar dataKey="utilization" fill="#0891b2" radius={[0, 4, 4, 0]}>
                  {utilizationData.map((entry, i) => (
                    <Cell key={i} fill={entry.utilization > 70 ? '#22c55e' : entry.utilization > 40 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No utilization data available</div>
          )}
        </div>

        {/* Revenue per Boat per Day */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Avg Revenue per Boat per Day</h2>
          {revenuePerBoatPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenuePerBoatPerDay} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(value, name) => [formatFullCurrency(value), name === 'avgRevenue' ? 'Avg/Day' : 'Total']} />
                <Bar dataKey="avgRevenue" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                  {revenuePerBoatPerDay.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No revenue data available</div>
          )}
        </div>
      </div>

      {/* Top Performing Days + Speed vs Party Boats */}
      <div className={styles.chartsRowTwo}>
        {/* Top Performing Days */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Revenue by Day of Week</h2>
          {topPerformingDays.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topPerformingDays}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name) => [name === 'revenue' ? formatFullCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Bookings']} />
                <Bar dataKey="revenue" fill="#0891b2" radius={[4, 4, 0, 0]}>
                  {topPerformingDays.map((entry, i) => {
                    const maxRev = Math.max(...topPerformingDays.map(d => d.revenue));
                    return <Cell key={i} fill={entry.revenue === maxRev ? '#22c55e' : '#0891b2'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No day-of-week data available</div>
          )}
        </div>

        {/* Speed vs Party Boats */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Speed vs Party Boats</h2>
          {boatTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
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

export default BoatPerformance;
