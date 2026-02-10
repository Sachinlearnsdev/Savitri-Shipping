import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import Button from '../../components/common/Button';
import { getOverview, getRevenueChart, getAllBookingsForReports, getAllPartyBookingsForReports, exportCSV, exportPDF } from '../../services/reports.service';
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

const RevenueReports = () => {
  const { showSuccess, showError } = useUIStore();
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [paymentModeRevenue, setPaymentModeRevenue] = useState([]);
  const [revenueByBoat, setRevenueByBoat] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes, bookingsRes, partyBookingsRes] = await Promise.all([
        getOverview({ period }),
        getRevenueChart({ period }),
        getAllBookingsForReports({ limit: 500, period }).catch(() => ({ success: false })),
        getAllPartyBookingsForReports({ limit: 500, period }).catch(() => ({ success: false })),
      ]);
      if (overviewRes.success) setOverview(overviewRes.data);
      if (revenueRes.success) setRevenueData(revenueRes.data || []);

      // Aggregate payment mode revenue from bookings data
      const speedBookings = bookingsRes.success ? (bookingsRes.data?.docs || bookingsRes.data || []) : [];
      const partyBookings = partyBookingsRes.success ? (partyBookingsRes.data?.docs || partyBookingsRes.data || []) : [];
      const allBookings = [...(Array.isArray(speedBookings) ? speedBookings : []), ...(Array.isArray(partyBookings) ? partyBookings : [])];

      // Revenue by payment mode
      const modeMap = {};
      allBookings.forEach(b => {
        if (b.paymentStatus === 'PAID' || b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
          const mode = b.paymentMode === 'AT_VENUE' ? 'At Venue' : 'Online';
          const amount = b.pricing?.totalAmount || b.totalAmount || b.amount || 0;
          modeMap[mode] = (modeMap[mode] || 0) + amount;
        }
      });
      setPaymentModeRevenue(Object.entries(modeMap).map(([name, value]) => ({ name, value: Math.round(value) })));

      // Revenue by boat
      const boatMap = {};
      allBookings.forEach(b => {
        if (b.paymentStatus === 'PAID' || b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
          const boatName = b.boats?.[0]?.boatName || b.boatId?.name || b.boatName || 'Unknown';
          const amount = b.pricing?.totalAmount || b.totalAmount || b.amount || 0;
          if (!boatMap[boatName]) boatMap[boatName] = 0;
          boatMap[boatName] += amount;
        }
      });
      const boatRevenue = Object.entries(boatMap)
        .map(([name, value]) => ({ name, value: Math.round(value) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      setRevenueByBoat(boatRevenue);

      // Monthly comparison
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      let currentMonthRevenue = 0;
      let previousMonthRevenue = 0;
      let currentMonthBookings = 0;
      let previousMonthBookings = 0;

      allBookings.forEach(b => {
        const bDate = new Date(b.date || b.createdAt);
        const amount = b.pricing?.totalAmount || b.totalAmount || b.amount || 0;
        if (bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear) {
          if (b.paymentStatus === 'PAID' || b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
            currentMonthRevenue += amount;
          }
          currentMonthBookings++;
        }
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        if (bDate.getMonth() === prevMonth && bDate.getFullYear() === prevYear) {
          if (b.paymentStatus === 'PAID' || b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
            previousMonthRevenue += amount;
          }
          previousMonthBookings++;
        }
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      setMonthlyComparison({
        currentMonth: monthNames[currentMonth],
        previousMonth: monthNames[prevMonthIdx],
        currentRevenue: Math.round(currentMonthRevenue),
        previousRevenue: Math.round(previousMonthRevenue),
        currentBookings: currentMonthBookings,
        previousBookings: previousMonthBookings,
        revenueChange: previousMonthRevenue > 0 ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100) : currentMonthRevenue > 0 ? 100 : 0,
        bookingChange: previousMonthBookings > 0 ? Math.round(((currentMonthBookings - previousMonthBookings) / previousMonthBookings) * 100) : currentMonthBookings > 0 ? 100 : 0,
      });
    } catch (err) {
      console.error('Revenue reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  const handleExportCSV = async () => {
    try {
      setExporting('csv');
      await exportCSV(period);
      showSuccess('CSV report downloaded successfully');
    } catch (err) {
      showError('Failed to export CSV report');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting('pdf');
      await exportPDF(period);
      showSuccess('PDF report opened in new tab');
    } catch (err) {
      showError('Failed to export PDF report');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading revenue reports...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Revenue Reports</h1>
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

      {/* Revenue Over Time Chart */}
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

      {/* New Charts Row */}
      <div className={styles.chartsRow}>
        {/* Revenue by Payment Mode */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Revenue by Payment Mode</h2>
          {paymentModeRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentModeRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {paymentModeRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => formatFullCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No payment mode data available</div>
          )}
        </div>

        {/* Revenue by Boat */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Revenue by Boat</h2>
          {revenueByBoat.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByBoat} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(value) => formatFullCurrency(value)} />
                <Bar dataKey="value" fill="#0891b2" radius={[0, 4, 4, 0]}>
                  {revenueByBoat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={styles.noData}>No boat revenue data available</div>
          )}
        </div>

        {/* Monthly Comparison */}
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Monthly Comparison</h2>
          {monthlyComparison ? (
            <div className={styles.monthlyComparison}>
              <div className={styles.monthCompareRow}>
                <div className={styles.monthCompareCard}>
                  <span className={styles.monthCompareLabel}>{monthlyComparison.currentMonth} (Current)</span>
                  <span className={styles.monthCompareValue}>{formatFullCurrency(monthlyComparison.currentRevenue)}</span>
                  <span className={styles.monthCompareBookings}>{monthlyComparison.currentBookings} bookings</span>
                </div>
                <div className={styles.monthCompareCard}>
                  <span className={styles.monthCompareLabel}>{monthlyComparison.previousMonth} (Previous)</span>
                  <span className={styles.monthCompareValue}>{formatFullCurrency(monthlyComparison.previousRevenue)}</span>
                  <span className={styles.monthCompareBookings}>{monthlyComparison.previousBookings} bookings</span>
                </div>
              </div>
              <div className={styles.monthChangeRow}>
                <div className={`${styles.monthChangeItem} ${monthlyComparison.revenueChange >= 0 ? styles.changePositive : styles.changeNegative}`}>
                  <span className={styles.changeLabel}>Revenue Change</span>
                  <span className={styles.changeValue}>{monthlyComparison.revenueChange >= 0 ? '+' : ''}{monthlyComparison.revenueChange}%</span>
                </div>
                <div className={`${styles.monthChangeItem} ${monthlyComparison.bookingChange >= 0 ? styles.changePositive : styles.changeNegative}`}>
                  <span className={styles.changeLabel}>Booking Change</span>
                  <span className={styles.changeValue}>{monthlyComparison.bookingChange >= 0 ? '+' : ''}{monthlyComparison.bookingChange}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noData}>No comparison data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueReports;
