import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getAllCustomersForReports } from '../../services/reports.service';
import styles from '../reports/Reports.module.css';

const COLORS = ['#0891b2', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

const CustomerSegments = () => {
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllCustomersForReports({ limit: 1000 });
      const customers = response.success ? (response.data?.docs || response.data || []) : [];
      const customerArr = Array.isArray(customers) ? customers : [];

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // New Customers (registered in last 30 days)
      const newCustomers = customerArr.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);

      // Repeat Customers (5+ completed bookings)
      const repeatCustomers = customerArr.filter(c => (c.completedRidesCount || 0) >= 5);

      // Inactive Customers (no activity in 90+ days)
      const inactiveCustomers = customerArr.filter(c => {
        const lastActive = c.lastLoginAt || c.updatedAt || c.createdAt;
        return lastActive && new Date(lastActive) < ninetyDaysAgo;
      });

      // High-Value Customers (at least one completed ride and marked VIP or high ride count)
      const highValueCustomers = customerArr.filter(c => (c.completedRidesCount || 0) >= 3 || c.venuePaymentAllowed);

      setSegments({
        total: customerArr.length,
        new: { count: newCustomers.length, customers: newCustomers },
        repeat: { count: repeatCustomers.length, customers: repeatCustomers },
        inactive: { count: inactiveCustomers.length, customers: inactiveCustomers },
        highValue: { count: highValueCustomers.length, customers: highValueCustomers },
      });
    } catch (err) {
      console.error('Customer segments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading customer segments...</div>
      </div>
    );
  }

  const pieData = segments ? [
    { name: 'New (30d)', value: segments.new.count },
    { name: 'Repeat (5+)', value: segments.repeat.count },
    { name: 'Inactive (90d+)', value: segments.inactive.count },
    { name: 'High Value', value: segments.highValue.count },
  ].filter(d => d.value > 0) : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customer Segments</h1>
      </div>

      {/* Overview */}
      <div className={styles.overviewGrid}>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Total Customers</span>
          <span className={styles.overviewValue}>{segments?.total || 0}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>New (Last 30 Days)</span>
          <span className={styles.overviewValue}>{segments?.new?.count || 0}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Repeat (5+ Bookings)</span>
          <span className={styles.overviewValue}>{segments?.repeat?.count || 0}</span>
        </div>
        <div className={styles.overviewCard}>
          <span className={styles.overviewLabel}>Inactive (90+ Days)</span>
          <span className={styles.overviewValue}>{segments?.inactive?.count || 0}</span>
        </div>
      </div>

      {/* Segment Cards */}
      <div className={styles.segmentGrid}>
        <div className={styles.segmentCard}>
          <div className={styles.segmentHeader}>
            <div className={`${styles.segmentIcon} ${styles.segmentIconNew}`}>
              <span>+</span>
            </div>
            <div className={styles.segmentInfo}>
              <h3 className={styles.segmentName}>New Customers</h3>
              <p className={styles.segmentDesc}>Customers who registered in the last 30 days. Great targets for welcome offers and onboarding campaigns.</p>
            </div>
          </div>
          <div>
            <span className={styles.segmentCount}>{segments?.new?.count || 0}</span>
            <span className={styles.segmentCountLabel}> customers</span>
          </div>
        </div>

        <div className={styles.segmentCard}>
          <div className={styles.segmentHeader}>
            <div className={`${styles.segmentIcon} ${styles.segmentIconRepeat}`}>
              <span>R</span>
            </div>
            <div className={styles.segmentInfo}>
              <h3 className={styles.segmentName}>Repeat Customers</h3>
              <p className={styles.segmentDesc}>Customers with 5 or more completed bookings. Your most loyal customers - reward them with exclusive offers.</p>
            </div>
          </div>
          <div>
            <span className={styles.segmentCount}>{segments?.repeat?.count || 0}</span>
            <span className={styles.segmentCountLabel}> customers</span>
          </div>
        </div>

        <div className={styles.segmentCard}>
          <div className={styles.segmentHeader}>
            <div className={`${styles.segmentIcon} ${styles.segmentIconInactive}`}>
              <span>!</span>
            </div>
            <div className={styles.segmentInfo}>
              <h3 className={styles.segmentName}>Inactive Customers</h3>
              <p className={styles.segmentDesc}>No activity in 90+ days. Send re-engagement campaigns with special discounts to bring them back.</p>
            </div>
          </div>
          <div>
            <span className={styles.segmentCount}>{segments?.inactive?.count || 0}</span>
            <span className={styles.segmentCountLabel}> customers</span>
          </div>
        </div>

        <div className={styles.segmentCard}>
          <div className={styles.segmentHeader}>
            <div className={`${styles.segmentIcon} ${styles.segmentIconHighValue}`}>
              <span>V</span>
            </div>
            <div className={styles.segmentInfo}>
              <h3 className={styles.segmentName}>High-Value Customers</h3>
              <p className={styles.segmentDesc}>Customers with 3+ completed rides or venue payment enabled. Premium customers who drive the most revenue.</p>
            </div>
          </div>
          <div>
            <span className={styles.segmentCount}>{segments?.highValue?.count || 0}</span>
            <span className={styles.segmentCountLabel}> customers</span>
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className={styles.chartCard}>
        <h2 className={styles.chartTitle}>Customer Segment Distribution</h2>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noData}>No customer data available</div>
        )}
      </div>
    </div>
  );
};

export default CustomerSegments;
