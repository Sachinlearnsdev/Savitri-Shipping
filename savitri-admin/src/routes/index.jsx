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
import AdminProfile from '../pages/profile/AdminProfile';
import Preferences from '../pages/profile/Preferences';

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

// Inquiries Pages
import Inquiries from '../pages/inquiries/Inquiries';

// Reviews Pages
import Reviews from '../pages/reviews/Reviews';

// Coupons Pages
import Coupons from '../pages/coupons/Coupons';
import CouponDetail from '../pages/coupons/CouponDetail';

// Marketing Pages
import Marketing from '../pages/marketing/Marketing';
import CampaignAnalytics from '../pages/marketing/CampaignAnalytics';
import CustomerSegments from '../pages/marketing/CustomerSegments';

// Reports Pages
import Reports from '../pages/reports/Reports';
import RevenueReports from '../pages/reports/RevenueReports';
import BookingReports from '../pages/reports/BookingReports';
import BoatPerformance from '../pages/reports/BoatPerformance';

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
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="/preferences" element={<Preferences />} />
            
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

            {/* Inquiries */}
            <Route path="/inquiries" element={<Inquiries />} />

            {/* Reviews */}
            <Route path="/reviews" element={<Navigate to="/reviews/company" replace />} />
            <Route path="/reviews/company" element={<Reviews category="company" />} />
            <Route path="/reviews/product" element={<Reviews category="product" />} />

            {/* Coupons */}
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/coupons/new" element={<CouponDetail />} />
            <Route path="/coupons/:id" element={<CouponDetail />} />

            {/* Marketing */}
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/marketing/analytics" element={<CampaignAnalytics />} />
            <Route path="/marketing/segments" element={<CustomerSegments />} />

            {/* Reports */}
            <Route path="/reports" element={<Navigate to="/reports/revenue" replace />} />
            <Route path="/reports/revenue" element={<RevenueReports />} />
            <Route path="/reports/bookings" element={<BookingReports />} />
            <Route path="/reports/boats" element={<BoatPerformance />} />
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