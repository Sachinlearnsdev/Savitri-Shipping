import useThemeStore from '../../store/themeStore';
import styles from './AdminProfile.module.css';

const THEME_OPTIONS = [
  { key: 'light', label: 'Light', desc: 'Always use light mode' },
  { key: 'dark', label: 'Dark', desc: 'Always use dark mode' },
  { key: 'system', label: 'System', desc: 'Follow your OS setting' },
  { key: 'auto', label: 'Auto', desc: 'Light 6AM-6PM, dark otherwise' },
];

const Preferences = () => {
  const { mode, setTheme } = useThemeStore();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Appearance</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-5)', fontSize: 'var(--font-size-sm)' }}>
          Choose how the admin panel looks. You can also quickly toggle between light and dark using the button in the header.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-3)' }}>
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTheme(opt.key)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: 'var(--spacing-4)',
                borderRadius: 'var(--radius-lg)',
                border: mode === opt.key ? '2px solid var(--color-primary)' : '2px solid var(--border-color)',
                background: mode === opt.key ? 'var(--color-primary-light, rgba(59,130,246,0.06))' : 'var(--bg-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>
                {opt.label}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Preferences;
