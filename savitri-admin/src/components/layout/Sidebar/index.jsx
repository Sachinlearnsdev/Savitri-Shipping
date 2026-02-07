import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useUIStore from '../../../store/uiStore';
import useAuth from '../../../hooks/useAuth';
import { MENU_ITEMS } from '../../../utils/constants';
import MenuIcon from './MenuIcon';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const { hasPermission } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const sidebarClasses = [
    styles.sidebar,
    sidebarCollapsed && styles.collapsed,
    mobileSidebarOpen && styles.mobileOpen,
  ].filter(Boolean).join(' ');

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const isActive = (path) => location.pathname === path;

  const isParentActive = (children) => children.some(child => location.pathname === child.path);

  const handleLinkClick = () => {
    closeMobileSidebar();
  };

  const filteredMenuItems = MENU_ITEMS.filter(item => {
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    if (item.children) {
      item.children = item.children.filter(child =>
        !child.permission || hasPermission(child.permission)
      );
      return item.children.length > 0;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div className={styles.overlay} onClick={closeMobileSidebar} />
      )}

      <aside className={sidebarClasses}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
              <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
              <path d="M12 2v8" />
              <path d="M12 10l-4-2" />
            </svg>
          </span>
          {!sidebarCollapsed && (
            <span className={styles.logoText}>Savitri Shipping</span>
          )}
        </div>

        {/* Toggle Button (desktop only) */}
        <button
          className={styles.toggleButton}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {sidebarCollapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.menu}>
            {filteredMenuItems.map((item) => {
              if (item.children) {
                const isExpanded = expandedMenus[item.id];
                const isChildActive = isParentActive(item.children);

                return (
                  <li key={item.id} className={styles.menuItem}>
                    <button
                      className={`${styles.menuButton} ${isChildActive ? styles.active : ''}`}
                      onClick={() => toggleMenu(item.id)}
                    >
                      <span className={styles.menuIcon}>
                        <MenuIcon name={item.icon} />
                      </span>
                      {!sidebarCollapsed && (
                        <>
                          <span className={styles.menuLabel}>{item.label}</span>
                          <span className={`${styles.arrow} ${isExpanded ? styles.arrowDown : ''}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </span>
                        </>
                      )}
                    </button>

                    {isExpanded && !sidebarCollapsed && (
                      <ul className={styles.submenu}>
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              to={child.path}
                              className={`${styles.submenuLink} ${isActive(child.path) ? styles.active : ''}`}
                              onClick={handleLinkClick}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return (
                <li key={item.id} className={styles.menuItem}>
                  <Link
                    to={item.path}
                    className={`${styles.menuLink} ${isActive(item.path) ? styles.active : ''}`}
                    onClick={handleLinkClick}
                  >
                    <span className={styles.menuIcon}>
                      <MenuIcon name={item.icon} />
                    </span>
                    {!sidebarCollapsed && (
                      <span className={styles.menuLabel}>{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
