import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useClickOutside from '../../../hooks/useClickOutside';
import useAuth from '../../../hooks/useAuth';
import useUIStore from '../../../store/uiStore';
import { ROUTE_TITLES, ROUTE_PARENTS } from '../../../utils/constants';
import { getInitials, getAvatarColor } from '../../../utils/helpers';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, getUserName, getRoleName } = useAuth();
  const { toggleMobileSidebar } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useClickOutside(() => setShowUserMenu(false));

  const handleLogout = async () => {
    await logout();
  };

  const userInitials = getInitials(getUserName());
  const avatarColor = getAvatarColor(getUserName());

  // Get page title from current path
  const currentPath = location.pathname;
  const pageTitle = ROUTE_TITLES[currentPath] || 'Dashboard';
  const parent = ROUTE_PARENTS[currentPath];

  return (
    <header className={styles.header}>
      {/* Left Section */}
      <div className={styles.left}>
        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={toggleMobileSidebar}
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className={styles.titleArea}>
          {/* Breadcrumbs */}
          {parent && (
            <div className={styles.breadcrumbs}>
              <Link to="/dashboard" className={styles.breadcrumbLink}>Home</Link>
              <span className={styles.breadcrumbSep}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
              <Link to={parent.path} className={styles.breadcrumbLink}>{parent.label}</Link>
              <span className={styles.breadcrumbSep}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
              <span className={styles.breadcrumbCurrent}>{pageTitle}</span>
            </div>
          )}
          {!parent && currentPath !== '/dashboard' && (
            <div className={styles.breadcrumbs}>
              <Link to="/dashboard" className={styles.breadcrumbLink}>Home</Link>
              <span className={styles.breadcrumbSep}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
              <span className={styles.breadcrumbCurrent}>{pageTitle}</span>
            </div>
          )}
          <h1 className={styles.title}>{pageTitle}</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.right}>
        {/* Search */}
        <button className={styles.iconButton} aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Notifications */}
        <button className={styles.iconButton} aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* User Menu */}
        <div className={styles.userMenuContainer} ref={userMenuRef}>
          <button
            className={styles.userButton}
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={getUserName()}
                className={styles.avatar}
              />
            ) : (
              <div
                className={styles.avatarPlaceholder}
                style={{ backgroundColor: avatarColor }}
              >
                {userInitials}
              </div>
            )}

            <div className={styles.userInfo}>
              <span className={styles.userName}>{getUserName()}</span>
              <span className={styles.userRole}>{getRoleName()}</span>
            </div>

            <span className={styles.chevron}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>

          {showUserMenu && (
            <div className={styles.userMenu}>
              <div className={styles.userMenuHeader}>
                <span className={styles.menuUserName}>{getUserName()}</span>
                <span className={styles.menuUserEmail}>{user?.email}</span>
              </div>

              <div className={styles.userMenuDivider}></div>

              <button
                className={styles.menuItem}
                onClick={() => {
                  navigate('/profile');
                  setShowUserMenu(false);
                }}
              >
                <span className={styles.menuIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                Profile
              </button>

              <button
                className={styles.menuItem}
                onClick={() => {
                  navigate('/settings/general');
                  setShowUserMenu(false);
                }}
              >
                <span className={styles.menuIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </span>
                Settings
              </button>

              <div className={styles.userMenuDivider}></div>

              <button
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={handleLogout}
              >
                <span className={styles.menuIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
