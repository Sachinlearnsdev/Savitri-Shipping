/**
 * MenuIcon Component
 * Maps icon name strings to inline SVG icons for the sidebar menu.
 *
 * Parent menu items use 20x20 / viewBox 24x24 / strokeWidth 2 (bolder).
 * Sub-menu items use viewBox 16x16 / strokeWidth 1.5 (lighter) and are
 * rendered at size={14} by the Sidebar component.
 */
const icons = {
  // ==================== PARENT MENU ICONS (20x20, viewBox 24, strokeWidth 2) ====================

  // Dashboard - grid of 4 squares
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),

  // Users - two people
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),

  // Boats - sailing vessel with mast and waves
  boats: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
      <path d="M12 2v8" />
      <path d="M12 10l-4-2" />
    </svg>
  ),

  // Bookings - calendar with checkmark
  bookings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M9 16l2 2 4-4" />
    </svg>
  ),

  // Reviews - star
  reviews: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),

  // Marketing - megaphone
  marketing: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  ),

  // Reports / Analytics - bar chart with trend line
  analytics: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <polyline points="4 9 8 5 12 8 20 3" />
    </svg>
  ),

  // Settings - gear
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),

  // ==================== USERS SUB-MENU ICONS (16x16 viewBox, strokeWidth 1.5) ====================

  // Admin Users - person with shield badge
  'admin-users': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="4.5" r="2.5" />
      <path d="M1 14c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M12 4l2 1v2c0 1.2-.8 2.3-2 2.8-1.2-.5-2-1.6-2-2.8V5l2-1z" />
    </svg>
  ),

  // Roles & Permissions - key
  'roles-perms': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="5.5" r="3" />
      <path d="M8 8l6 6" />
      <path d="M12 12l2-2" />
      <path d="M10 10l2-2" />
    </svg>
  ),

  // Customers - group of people
  'customers': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="4" r="2.5" />
      <path d="M1 13.5c0-2.5 2-4.5 5-4.5s5 2 5 4.5" />
      <circle cx="12" cy="5" r="2" />
      <path d="M15 13.5c0-2-1.5-3.5-3.5-3.7" />
    </svg>
  ),

  // ==================== BOATS SUB-MENU ICONS ====================

  // Speed Boats - fast boat with speed lines
  'speed-boats': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 10l2-4h9l3 4" />
      <path d="M1 10c2 2 5 2.5 7 2.5s5-.5 7-2.5" />
      <line x1="1" y1="6" x2="3" y2="6" />
      <line x1="1" y1="8" x2="2.5" y2="8" />
    </svg>
  ),

  // Party Boats - boat with flag/pennant (party vibe)
  'party-boats': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 11l2-5h8l2 5" />
      <path d="M2 11c2 2 5 2 6 2s4 0 6-2" />
      <path d="M7 6V2" />
      <path d="M7 2l4 2-4 2" />
    </svg>
  ),

  // Calendar & Weather - calendar with sun
  'calendar-weather': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="10" height="10" rx="1" />
      <line x1="1" y1="7" x2="11" y2="7" />
      <line x1="4" y1="1.5" x2="4" y2="4.5" />
      <line x1="8" y1="1.5" x2="8" y2="4.5" />
      <circle cx="13" cy="5" r="2" />
      <line x1="13" y1="1.5" x2="13" y2="2" />
      <line x1="13" y1="8" x2="13" y2="8.5" />
      <line x1="10" y1="5" x2="10.5" y2="5" />
      <line x1="15.5" y1="5" x2="15" y2="5" />
    </svg>
  ),

  // Pricing Rules - rupee/currency tag
  'pricing-rules': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 1.5L8 8 6 6l-4.5 4.5" />
      <path d="M14 1.5h-4v4" />
      <line x1="1" y1="14.5" x2="15" y2="14.5" />
      <line x1="4" y1="12" x2="4" y2="14.5" />
      <line x1="8" y1="10" x2="8" y2="14.5" />
      <line x1="12" y1="8" x2="12" y2="14.5" />
    </svg>
  ),

  // ==================== BOOKINGS SUB-MENU ICONS ====================

  // Speed Boat Bookings - ticket/booking slip with checkmark
  'speed-bookings': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h12v3.5a1.5 1.5 0 0 0 0 3V13H2V9.5a1.5 1.5 0 0 0 0-3V3z" />
      <path d="M6 8l1.5 1.5L10 7" />
    </svg>
  ),

  // Party Boat Bookings - ticket with party hat/confetti
  'party-bookings': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h12v3.5a1.5 1.5 0 0 0 0 3V13H2V9.5a1.5 1.5 0 0 0 0-3V3z" />
      <path d="M7 6l1 4 1-4" />
      <circle cx="8" cy="5.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),

  // Inquiries - question mark in speech bubble
  'inquiries': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h12v9H6l-3 3v-3H2V2z" />
      <path d="M6.5 5.5a1.5 1.5 0 0 1 3 0c0 1-1.5 1-1.5 2" />
      <circle cx="8" cy="9" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  ),

  // ==================== REVIEWS SUB-MENU ICONS ====================

  // Company Reviews - building with star
  'company-reviews': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="8" height="10" rx="0.5" />
      <line x1="5" y1="8" x2="7" y2="8" />
      <line x1="5" y1="11" x2="7" y2="11" />
      <polygon points="13,2 13.8,4 15,4 14,5 14.4,7 13,6 11.6,7 12,5 11,4 12.2,4" />
    </svg>
  ),

  // Boat Reviews - boat with star
  'boat-reviews': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 11l2-4h10l2 4" />
      <path d="M1 11c2 1.5 5 2 7 2s5-.5 7-2" />
      <polygon points="8,1 9,3.5 11,3.5 9.5,5 10,7 8,6 6,7 6.5,5 5,3.5 7,3.5" />
    </svg>
  ),

  // ==================== MARKETING SUB-MENU ICONS ====================

  // Coupons - discount ticket with percentage
  'coupon-list': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12v2.5a1.5 1.5 0 0 0 0 3V12H2V9.5a1.5 1.5 0 0 0 0-3V4z" />
      <line x1="6" y1="6.5" x2="10" y2="9.5" />
      <circle cx="6.5" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="9.5" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  ),

  // Email Campaigns - envelope with arrow/send
  'email-campaigns': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="11" height="8" rx="1" />
      <path d="M1 4l5.5 4L12 4" />
      <polyline points="11 8 15 5 11 2" />
      <line x1="12" y1="5" x2="15" y2="5" />
    </svg>
  ),

  // ==================== REPORTS SUB-MENU ICONS ====================

  // Revenue - upward trending line with currency bar chart
  'revenue': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="14" x2="15" y2="14" />
      <rect x="2" y="9" width="2.5" height="5" rx="0.3" />
      <rect x="6.5" y="6" width="2.5" height="8" rx="0.3" />
      <rect x="11" y="3" width="2.5" height="11" rx="0.3" />
      <polyline points="2 7 6.5 4 11 2 14 1" />
    </svg>
  ),

  // Booking Reports - clipboard with list
  'booking-reports': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="10" height="13" rx="1" />
      <path d="M6 1h4v2H6z" />
      <line x1="6" y1="6" x2="10" y2="6" />
      <line x1="6" y1="9" x2="10" y2="9" />
      <line x1="6" y1="12" x2="8" y2="12" />
    </svg>
  ),

  // Boat Performance - speedometer/gauge
  'boat-performance': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12a6 6 0 0 1 12 0" />
      <path d="M8 12l2.5-4.5" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <line x1="2" y1="12" x2="3" y2="12" />
      <line x1="13" y1="12" x2="14" y2="12" />
      <line x1="8" y1="6" x2="8" y2="7" />
    </svg>
  ),

  // ==================== SETTINGS SUB-MENU ICONS ====================

  // General Settings - sliders/adjustments
  'general-settings': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="3" x2="4" y2="13" />
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="12" y1="3" x2="12" y2="13" />
      <circle cx="4" cy="5.5" r="1.5" fill="currentColor" />
      <circle cx="8" cy="10" r="1.5" fill="currentColor" />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" />
    </svg>
  ),

  // Billing Settings - credit card
  'billing-settings': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="10" rx="1.5" />
      <line x1="1" y1="7" x2="15" y2="7" />
      <line x1="4" y1="10" x2="7" y2="10" />
    </svg>
  ),

  // Booking Settings - calendar with gear
  'booking-settings': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="11" height="11" rx="1" />
      <line x1="1" y1="7" x2="12" y2="7" />
      <line x1="4" y1="1.5" x2="4" y2="4.5" />
      <line x1="9" y1="1.5" x2="9" y2="4.5" />
      <circle cx="13" cy="12" r="1.2" />
      <path d="M13 9.5v.8M13 13.2v.8M15 12h-.8M11.8 12H11M14.5 10.5l-.6.6M12.1 12.9l-.6.6M14.5 13.5l-.6-.6M12.1 11.1l-.6-.6" />
    </svg>
  ),

  // Notification Settings - bell
  'notification-settings': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6a4 4 0 0 1 8 0c0 2 1 3 2 4H2c1-1 2-2 2-4z" />
      <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
    </svg>
  ),

  // Content Settings - file with text lines
  'content-settings': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5l-4-4z" />
      <polyline points="9 1 9 5 13 5" />
      <line x1="5.5" y1="8" x2="10.5" y2="8" />
      <line x1="5.5" y1="11" x2="10.5" y2="11" />
    </svg>
  ),

  // ==================== UNUSED BUT KEPT FOR COMPATIBILITY ====================

  'coupon-create': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <line x1="8" y1="5" x2="8" y2="11" />
      <line x1="5" y1="8" x2="11" y2="8" />
    </svg>
  ),
  'send-email': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3l14 5-14 5V9l10-1-10-1V3z" />
    </svg>
  ),
  'campaigns': (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l6 4 6-4" />
      <rect x="1" y="3" width="14" height="10" rx="1" />
    </svg>
  ),
};

const MenuIcon = ({ name, size }) => {
  const icon = icons[name];
  if (!icon) return null;
  if (size) {
    return <span style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>{icon}</span>;
  }
  return icon;
};

export default MenuIcon;
