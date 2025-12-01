import useAuth from '../../hooks/useAuth';
import styles from './Dashboard.module.css';

/**
 * Dashboard Page
 * Main dashboard with welcome message and stats
 */
const Dashboard = () => {
  const { getUserName } = useAuth();
  
  return (
    <div className={styles.container}>
      {/* Welcome Section */}
      <div className={styles.welcome}>
        <h1 className={styles.title}>Welcome back, {getUserName()}! 👋</h1>
        <p className={styles.subtitle}>
          Here's what's happening with your ferry services today.
        </p>
      </div>
      
      {/* Stats Grid - Placeholder for Phase 2 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Total Bookings</h3>
            <p className={styles.statValue}>-</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⛴️</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Active Ferries</h3>
            <p className={styles.statValue}>-</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Revenue</h3>
            <p className={styles.statValue}>-</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <h3 className={styles.statLabel}>Total Customers</h3>
            <p className={styles.statValue}>-</p>
          </div>
        </div>
      </div>
      
      {/* Recent Activity - Placeholder */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}>📋</span>
          <p>Activity tracking will be available in Phase 2</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;