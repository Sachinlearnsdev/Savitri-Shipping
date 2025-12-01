import { Link, useLocation } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

/**
 * Breadcrumbs Component
 * 
 * @param {object} props - Component props
 * @param {Array} props.items - Breadcrumb items [{label, path}]
 */
const Breadcrumbs = ({ items = [], className = '' }) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if items not provided
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs(location.pathname);
  
  if (breadcrumbItems.length === 0) return null;
  
  const wrapperClasses = [
    styles.wrapper,
    className,
  ].filter(Boolean).join(' ');
  
  return (
    <nav className={wrapperClasses} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={index} className={styles.item}>
              {!isLast && item.path ? (
                <Link to={item.path} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current}>{item.label}</span>
              )}
              
              {!isLast && (
                <span className={styles.separator}>›</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

/**
 * Generate breadcrumbs from pathname
 * @param {string} pathname - Current pathname
 * @returns {Array} Breadcrumb items
 */
const generateBreadcrumbs = (pathname) => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Dashboard', path: '/dashboard' }];
  
  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Skip if it's the dashboard itself
    if (path === 'dashboard') return;
    
    // Capitalize and format label
    const label = path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      label,
      path: index === paths.length - 1 ? null : currentPath,
    });
  });
  
  return breadcrumbs;
};

export default Breadcrumbs;