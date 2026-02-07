import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Layout from '../components/layout/Layout';

// Auth Pages
import Login from '../pages/auth/Login';
import VerifyOTP from '../pages/auth/VerifyOTP';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Users Pages
import AdminUsers from '../pages/users/AdminUsers';
import AdminUserDetail from '../pages/users/AdminUserDetail';
import Roles from '../pages/users/Roles';
import Customers from '../pages/users/Customers';
import CustomerDetail from '../pages/users/CustomerDetail';

// Profile Page
import Profile from '../pages/profile/Profile';

// Settings Pages
import GeneralSettings from '../pages/settings/GeneralSettings';
import BillingSettings from '../pages/settings/BillingSettings';
import BookingSettings from '../pages/settings/BookingSettings';
import NotificationSettings from '../pages/settings/NotificationSettings';
import ContentSettings from '../pages/settings/ContentSettings';

// Speed Boats Pages
import SpeedBoats from '../pages/speedBoats/SpeedBoats';
import BoatDetail from '../pages/speedBoats/BoatDetail';
import Calendar from '../pages/speedBoats/Calendar';
import PricingRules from '../pages/speedBoats/PricingRules';

// Party Boats Pages
import PartyBoats from '../pages/partyBoats/PartyBoats';
import PartyBoatDetail from '../pages/partyBoats/PartyBoatDetail';

// Bookings Pages
import Bookings from '../pages/bookings/Bookings';
import BookingDetail from '../pages/bookings/BookingDetail';

// Party Bookings Pages
import PartyBookings from '../pages/partyBookings/PartyBookings';
import PartyBookingDetail from '../pages/partyBookings/PartyBookingDetail';

/**
 * App Routes Configuration
 */
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Users */}
            <Route path="/users/admins" element={<AdminUsers />} />
            <Route path="/users/admins/:id" element={<AdminUserDetail />} />
            <Route path="/users/roles" element={<Roles />} />
            <Route path="/users/customers" element={<Customers />} />
            <Route path="/users/customers/:id" element={<CustomerDetail />} />
            
            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
            
            {/* Settings */}
            <Route path="/settings/general" element={<GeneralSettings />} />
            <Route path="/settings/billing" element={<BillingSettings />} />
            <Route path="/settings/booking" element={<BookingSettings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/settings/content" element={<ContentSettings />} />

            {/* Speed Boats */}
            <Route path="/speed-boats" element={<SpeedBoats />} />
            <Route path="/speed-boats/calendar" element={<Calendar />} />
            <Route path="/speed-boats/pricing" element={<PricingRules />} />
            <Route path="/speed-boats/:id" element={<BoatDetail />} />

            {/* Party Boats */}
            <Route path="/party-boats" element={<PartyBoats />} />
            <Route path="/party-boats/:id" element={<PartyBoatDetail />} />

            {/* Bookings */}
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />

            {/* Party Bookings */}
            <Route path="/party-bookings" element={<PartyBookings />} />
            <Route path="/party-bookings/:id" element={<PartyBookingDetail />} />
          </Route>
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Simple 404 component
const NotFound = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: '1rem',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#666' }}>Page not found</p>
      <a href="/dashboard" style={{ color: '#0891b2', textDecoration: 'none' }}>
        Go to Dashboard
      </a>
    </div>
  );
};

export default AppRoutes;