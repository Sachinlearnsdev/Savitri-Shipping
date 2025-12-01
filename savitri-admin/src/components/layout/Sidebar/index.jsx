import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useUIStore from '../../../store/uiStore';
import useAuth from '../../../hooks/useAuth';
import { MENU_ITEMS } from '../../../utils/constants';
import styles from './Sidebar.module.css';

/**
 * Sidebar Component
 * Main navigation sidebar for admin panel
 */
const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { hasPermission } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});
  
  const sidebarClasses = [
    styles.sidebar,
    sidebarCollapsed && styles.collapsed,
  ].filter(Boolean).join(' ');
  
  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const isParentActive = (children) => {
    return children.some(child => location.pathname === child.path);
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
    <aside className={sidebarClasses}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>⛴️</span>
        {!sidebarCollapsed && (
          <span className={styles.logoText}>Savitri Shipping</span>
        )}
      </div>
      
      {/* Toggle Button */}
      <button
        className={styles.toggleButton}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? '›' : '‹'}
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
                    <span className={styles.menuIcon}>{item.icon}</span>
                    {!sidebarCollapsed && (
                      <>
                        <span className={styles.menuLabel}>{item.label}</span>
                        <span className={`${styles.arrow} ${isExpanded ? styles.arrowDown : ''}`}>
                          ›
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
                            className={`${styles.submenuLink} ${
                              isActive(child.path) ? styles.active : ''
                            }`}
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
                >
                  <span className={styles.menuIcon}>{item.icon}</span>
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
  );
};

export default Sidebar;