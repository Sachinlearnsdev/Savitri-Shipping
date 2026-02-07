import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header from '../Header';
import Footer from '../Footer';
import ToastContainer from '../../common/Toast';
import useUIStore from '../../../store/uiStore';
import styles from './Layout.module.css';

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

      <div className={mainClasses}>
        <main className={styles.content}>
          <Outlet />
        </main>
        <Footer />
      </div>

      <ToastContainer />
    </div>
  );
};

export default Layout;
