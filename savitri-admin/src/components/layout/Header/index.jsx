import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useClickOutside from '../../../hooks/useClickOutside';
import useAuth from '../../../hooks/useAuth';
import { getInitials, getAvatarColor } from '../../../utils/helpers';
import styles from './Header.module.css';

/**
 * Header Component
 * Top navigation bar with user menu
 */
const Header = () => {
  const navigate = useNavigate();
  const { user, logout, getUserName, getRoleName } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const userMenuRef = useClickOutside(() => setShowUserMenu(false));
  
  const handleLogout = async () => {
    await logout();
  };
  
  const userInitials = getInitials(getUserName());
  const avatarColor = getAvatarColor(getUserName());
  
  return (
    <header className={styles.header}>
      {/* Left Section */}
      <div className={styles.left}>
        <h1 className={styles.title}>Dashboard</h1>
      </div>
      
      {/* Right Section */}
      <div className={styles.right}>
        {/* Search - Placeholder */}
        <button className={styles.iconButton} aria-label="Search">
          🔍
        </button>
        
        {/* Notifications - Placeholder */}
        <button className={styles.iconButton} aria-label="Notifications">
          🔔
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
            
            <span className={styles.chevron}>▼</span>
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
                <span className={styles.menuIcon}>👤</span>
                Profile
              </button>
              
              <button
                className={styles.menuItem}
                onClick={() => {
                  navigate('/settings/general');
                  setShowUserMenu(false);
                }}
              >
                <span className={styles.menuIcon}>⚙️</span>
                Settings
              </button>
              
              <div className={styles.userMenuDivider}></div>
              
              <button
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={handleLogout}
              >
                <span className={styles.menuIcon}>🚪</span>
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