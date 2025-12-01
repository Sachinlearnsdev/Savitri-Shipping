import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header from '../Header';
import ToastContainer from '../../common/Toast';
import useUIStore from '../../../store/uiStore';
import styles from './Layout.module.css';

/**
 * Layout Component
 * Main layout wrapper with sidebar, header, and content area
 */
const Layout = () => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  
  const mainClasses = [
    styles.main,
    sidebarCollapsed && styles.collapsed,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={styles.layout}>
      <Sidebar />
      <Header />
      
      <main className={mainClasses}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      
      <ToastContainer />
    </div>
  );
};

export default Layout;