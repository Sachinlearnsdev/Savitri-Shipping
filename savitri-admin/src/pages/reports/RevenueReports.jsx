import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Button from '../../components/common/Button';
import { getOverview, getRevenueChart, exportCSV, exportPDF } from '../../services/reports.service';
import useUIStore from '../../store/uiStore';
import { CURRENCY } from '../../utils/constants';
import styles from './Reports.module.css';

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
];

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
  const [exporting, setExporting] = useState(null); // 'csv' | 'pdf' | null
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes] = await Promise.all([
        getOverview({ period }),
        getRevenueChart({ period }),
      ]);
      if (overviewRes.success) setOverview(overviewRes.data);
      if (revenueRes.success) setRevenueData(revenueRes.data || []);
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              loading={exporting === 'csv'}
              disabled={!!exporting}
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              loading={exporting === 'pdf'}
              disabled={!!exporting}
            >
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
    </div>
  );
};

export default RevenueReports;
