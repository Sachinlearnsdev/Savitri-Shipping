import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import Badge from '../../components/common/Badge';
import { getTopBoats, getBookingStats } from '../../services/reports.service';
import { CURRENCY } from '../../utils/constants';
import styles from './Reports.module.css';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

const COLORS = ['#0891b2', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899'];

const formatFullCurrency = (amount) => {
  if (amount == null) return `${CURRENCY.SYMBOL}0`;
  return `${CURRENCY.SYMBOL}${Number(amount).toLocaleString('en-IN')}`;
};

const BoatPerformance = () => {
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [topBoats, setTopBoats] = useState([]);
  const [bookingStats, setBookingStats] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boatsRes, statsRes] = await Promise.all([
        getTopBoats({ period }),
        getBookingStats({ period }),
      ]);
      if (boatsRes.success) setTopBoats(boatsRes.data || []);
      if (statsRes.success) setBookingStats(statsRes.data);
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

      {/* Speed vs Party Boats Comparison */}
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
  );
};

export default BoatPerformance;
