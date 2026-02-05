# Savitri Shipping - Project Memory

## 🎯 Project Overview
**Boat rental platform** for Savitri Shipping - Speed boats and party boats rental service in India.

**Tech Stack:**
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Public Site:** Next.js 14 (React) - Customer booking site
- **Admin Panel:** React (Vite) - Admin management

## 📊 Current Status (As of Feb 6, 2026)

### What We Did
1. ✅ **Complete project review** - Analyzed all 3 parts (backend, public, admin)
2. ✅ **Created comprehensive Phase 1 plan** - Ultra-simplified authentication focus
3. ✅ **User approved the plan** - Ready to implement

### What's Next
**Execute the approved plan at:** `C:\Users\Sasi\.claude\plans\effervescent-kindling-reef.md`

---

## 🚨 CRITICAL FINDINGS

### Security Issue
**Admin PrivateRoute NOT protecting routes** - Lines 16-18 commented out in:
- `savitri-admin/src/routes/PrivateRoute.jsx`
- **MUST FIX FIRST** - Anyone can access admin without login!

### Complexity Issues
- **6 roles** → Too complex, simplify to 2 (Admin, Staff)
- **6 OTP types** → Reduce to 2 (EMAIL_VERIFICATION, PASSWORD_RESET)
- **Phase 2 features already built** → Speed boats, bookings, vehicles (need to remove)
- **10 customer pages** → Reduce to 1 (Profile only)
- **Activity tracking everywhere** → Remove (ActivityLog, LoginHistory)

---

## 📋 APPROVED PLAN SUMMARY

**Plan Location:** `C:\Users\Sasi\.claude\plans\effervescent-kindling-reef.md`

**Goal:** Production-ready Phase 1 with ONLY essential auth features.

### Phase 1A: Critical Security Fix (30 min)
- Uncomment PrivateRoute auth check (lines 16-18)
- File: `savitri-admin/src/routes/PrivateRoute.jsx`

### Phase 1B: Remove Phase 2 Features (2-3 hours)
**Delete Models:**
- SpeedBoat.js, SpeedBoatBooking.js, Counter.js
- SavedVehicle.js, ActivityLog.js, LoginHistory.js

**Delete Modules:**
- speedBoats/, speedBoatsAdmin/, speedBoatBookings/
- speedBoatBookingsAdmin/, savedVehicles/, upload/

**Delete Customer Pages:**
- dashboard/, security/, sessions/, settings/
- bookings/, history/, reviews/, vehicles/
- Keep ONLY: profile/

**Clean Constants:**
- Remove: VEHICLE_TYPE, GST, ACTIVITY_ACTIONS, OPERATING_HOURS, CANCELLATION_POLICY
- Simplify: OTP_TYPE (6→2), ROLES (6→2), SETTINGS_GROUPS (5→2)

### Phase 1C: Complete Auth Features (4-5 hours)
- Implement admin ForgotPassword.jsx (currently stub)
- Implement admin ResetPassword.jsx (currently stub)
- Simplify customer profile to all-in-one page

### Phase 1D: Backend Simplification (2-3 hours)
- Simplify seed.js: Create only 2 roles (Admin, Staff)
- Simplify roleCheck middleware: Remove complex permissions
- Update routes to use simplified middleware

**Total Time:** 10-14 hours

---

## 🗂️ Project Structure

```
savitri-shipping/
├── savitri-backend/          # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── models/          # Mongoose models (7 after cleanup)
│   │   ├── modules/         # Feature modules (routes/controllers/services)
│   │   ├── middleware/      # Auth, roleCheck, errorHandler
│   │   ├── config/          # constants.js, env.js, database.js
│   │   └── utils/           # email.js, otp.js, validators.js
│   └── scripts/seed.js      # Database seeding
│
├── savitri-public/           # Next.js 14 - Customer site
│   └── src/
│       ├── app/             # Next.js app directory
│       │   ├── (auth)/      # Login, register, verify
│       │   └── account/     # Customer account (simplify to profile only)
│       ├── components/      # React components
│       ├── hooks/           # useAuth, useFetch, useToast
│       ├── services/        # API calls
│       └── store/           # Zustand state management
│
└── savitri-admin/            # React + Vite - Admin panel
    └── src/
        ├── pages/           # Page components
        │   ├── auth/        # Login, VerifyOTP, ForgotPassword (stub), ResetPassword (stub)
        │   └── dashboard/
        ├── routes/          # PrivateRoute.jsx (SECURITY ISSUE HERE)
        ├── hooks/           # useAuth
        ├── services/        # API calls
        └── store/           # Zustand state management
```

---

## 🔑 Key Files Reference

### Files to MODIFY:
1. `savitri-admin/src/routes/PrivateRoute.jsx` - Uncomment lines 16-18 (CRITICAL)
2. `savitri-backend/src/models/index.js` - Remove Phase 2 exports
3. `savitri-backend/src/app.js` - Remove Phase 2 routes (lines 110-125)
4. `savitri-backend/src/config/constants.js` - Clean up (remove Phase 2 sections)
5. `savitri-backend/src/modules/auth/auth.service.js` - Remove LoginHistory, comment out phone login
6. `savitri-backend/src/modules/adminAuth/adminAuth.service.js` - Remove ActivityLog
7. `savitri-backend/scripts/seed.js` - Simplify to 2 roles
8. `savitri-backend/src/middleware/roleCheck.js` - Simplify
9. `savitri-public/src/app/account/page.js` - Redirect to profile
10. `savitri-public/src/app/account/layout.js` - Remove navigation
11. `savitri-admin/src/pages/auth/ForgotPassword.jsx` - Implement (currently stub)
12. `savitri-admin/src/pages/auth/ResetPassword.jsx` - Implement (currently stub)

### Files to DELETE:
**Backend (6 models):**
- SpeedBoat.js, SpeedBoatBooking.js, Counter.js
- SavedVehicle.js, ActivityLog.js, LoginHistory.js

**Backend (6 module directories):**
- speedBoats/, speedBoatsAdmin/
- speedBoatBookings/, speedBoatBookingsAdmin/
- savedVehicles/, upload/

**Public (8 page directories):**
- dashboard/, security/, sessions/, settings/
- bookings/, history/, reviews/, vehicles/

---

## 🌐 Environment Variables

**Backend:** Database is MongoDB Atlas (already configured)
**Frontend:** API URLs need to match backend

See plan file for full `.env` examples.

---

## ✅ Todo List (From Approved Plan)

1. [ ] 🚨 PHASE 1A: Fix PrivateRoute security issue (IN PROGRESS)
2. [ ] PHASE 1B: Delete Phase 2 backend models and modules
3. [ ] PHASE 1B: Remove tracking systems and comment out phone login
4. [ ] PHASE 1B: Delete customer pages and clean up constants
5. [ ] PHASE 1C: Implement admin forgot/reset password pages
6. [ ] PHASE 1C: Simplify customer profile page
7. [ ] PHASE 1D: Simplify backend roles and middleware
8. [ ] Run verification tests and fix bugs

---

## 🎓 User Context

- **User is NOT a developer** but can understand code
- **Wants simplicity** - Easy to maintain after studying
- **Focus on Phase 1** - Login, registration, onboarding ONLY
- **Remove Phase 2** - Speed boats, bookings, all complex features
- **Production ready** - Must be secure and hostable

---

## 🚀 Next Chat Instructions

**To continue this work in a new chat, tell Claude:**

> "Continue the Savitri Shipping Phase 1 implementation. The plan is approved and located at `C:\Users\Sasi\.claude\plans\effervescent-kindling-reef.md`. Start with Phase 1A (fixing the PrivateRoute security issue) and proceed through all phases. Check memory.md for full context."

**Or simply:**

> "Continue where we left off on the Savitri Shipping project. Check memory.md and execute the approved plan."

---

## 📝 Important Notes

- Phone login is COMMENTED OUT (master OTP used for dev)
- Default admin: admin@savitrishipping.in / Admin@123
- SMS not configured (uses master OTP "123456")
- Email OTP works via Gmail SMTP
- JWT tokens stored in both localStorage and cookies

---

## 🔗 Related Files

- **Plan:** `C:\Users\Sasi\.claude\plans\effervescent-kindling-reef.md`
- **Rules:** `f:\Code\Savitri-Shipping\.clinerules`
- **Memory:** `C:\Users\Sasi\.claude\projects\f--Code-Savitri-Shipping\memory\`