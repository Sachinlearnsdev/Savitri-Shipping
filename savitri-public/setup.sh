#!/bin/bash

echo "🚀 Setting up Savitri Shipping Public Website..."

# ==================== CREATE FOLDER STRUCTURE ====================
echo "📁 Creating folder structure..."

# Root level folders
mkdir -p public/images

# App folders
mkdir -p src/app/\(auth\)/register
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/verify-email
mkdir -p src/app/\(auth\)/verify-phone
mkdir -p src/app/\(auth\)/forgot-password
mkdir -p src/app/\(auth\)/reset-password

mkdir -p src/app/account/dashboard
mkdir -p src/app/account/profile
mkdir -p src/app/account/security
mkdir -p src/app/account/vehicles
mkdir -p src/app/account/bookings
mkdir -p src/app/account/reviews
mkdir -p src/app/account/settings
mkdir -p src/app/account/sessions
mkdir -p src/app/account/history

mkdir -p src/app/about
mkdir -p src/app/terms
mkdir -p src/app/privacy
mkdir -p src/app/refund
mkdir -p src/app/contact

# Component folders
mkdir -p src/components/common/Button
mkdir -p src/components/common/Input
mkdir -p src/components/common/Select
mkdir -p src/components/common/Textarea
mkdir -p src/components/common/Checkbox
mkdir -p src/components/common/Radio
mkdir -p src/components/common/Modal
mkdir -p src/components/common/Toast
mkdir -p src/components/common/Loader
mkdir -p src/components/common/Card
mkdir -p src/components/common/Badge
mkdir -p src/components/common/Tabs
mkdir -p src/components/common/Avatar
mkdir -p src/components/common/Rating
mkdir -p src/components/common/FileUpload
mkdir -p src/components/common/DatePicker
mkdir -p src/components/common/EmptyState
mkdir -p src/components/common/ErrorState

mkdir -p src/components/layout/Header
mkdir -p src/components/layout/Footer
mkdir -p src/components/layout/MobileMenu
mkdir -p src/components/layout/Breadcrumbs

mkdir -p src/components/account/ProfileCard
mkdir -p src/components/account/VehicleCard
mkdir -p src/components/account/SessionCard
mkdir -p src/components/account/LoginHistoryCard

# Other folders
mkdir -p src/styles
mkdir -p src/services
mkdir -p src/store
mkdir -p src/hooks
mkdir -p src/utils

echo "✅ Folder structure created!"

# ==================== CREATE EMPTY FILES ====================
echo "📄 Creating empty files..."

# Auth pages
touch src/app/\(auth\)/register/register.jsx
touch src/app/\(auth\)/register/register.module.css
touch src/app/\(auth\)/login/login.jsx
touch src/app/\(auth\)/login/login.module.css
touch src/app/\(auth\)/verify-email/verify-email.jsx
touch src/app/\(auth\)/verify-email/verify-email.module.css
touch src/app/\(auth\)/verify-phone/verify-phone.jsx
touch src/app/\(auth\)/verify-phone/verify-phone.module.css
touch src/app/\(auth\)/forgot-password/forgot-password.jsx
touch src/app/\(auth\)/forgot-password/forgot-password.module.css
touch src/app/\(auth\)/reset-password/reset-password.jsx
touch src/app/\(auth\)/reset-password/reset-password.module.css

# Account pages
touch src/app/account/layout.js
touch src/app/account/layout.module.css
touch src/app/account/dashboard/dashboard.jsx
touch src/app/account/dashboard/dashboard.module.css
touch src/app/account/profile/profile.jsx
touch src/app/account/profile/profile.module.css
touch src/app/account/security/security.jsx
touch src/app/account/security/security.module.css
touch src/app/account/vehicles/vehicles.jsx
touch src/app/account/vehicles/vehicles.module.css
touch src/app/account/bookings/bookings.jsx
touch src/app/account/bookings/bookings.module.css
touch src/app/account/reviews/reviews.jsx
touch src/app/account/reviews/reviews.module.css
touch src/app/account/settings/settings.jsx
touch src/app/account/settings/settings.module.css
touch src/app/account/sessions/sessions.jsx
touch src/app/account/sessions/sessions.module.css
touch src/app/account/history/history.jsx
touch src/app/account/history/history.module.css

# Static pages
touch src/app/about/about.jsx
touch src/app/about/about.module.css
touch src/app/terms/terms.jsx
touch src/app/terms/terms.module.css
touch src/app/privacy/privacy.jsx
touch src/app/privacy/privacy.module.css
touch src/app/refund/refund.jsx
touch src/app/refund/refund.module.css
touch src/app/contact/contact.jsx
touch src/app/contact/contact.module.css

# Common components
touch src/components/common/Button/index.jsx
touch src/components/common/Button/Button.module.css
touch src/components/common/Input/index.jsx
touch src/components/common/Input/Input.module.css
touch src/components/common/Select/index.jsx
touch src/components/common/Select/Select.module.css
touch src/components/common/Textarea/index.jsx
touch src/components/common/Textarea/Textarea.module.css
touch src/components/common/Checkbox/index.jsx
touch src/components/common/Checkbox/Checkbox.module.css
touch src/components/common/Radio/index.jsx
touch src/components/common/Radio/Radio.module.css
touch src/components/common/Modal/index.jsx
touch src/components/common/Modal/Modal.module.css
touch src/components/common/Toast/index.jsx
touch src/components/common/Toast/Toast.module.css
touch src/components/common/Loader/index.jsx
touch src/components/common/Loader/Loader.module.css
touch src/components/common/Card/index.jsx
touch src/components/common/Card/Card.module.css
touch src/components/common/Badge/index.jsx
touch src/components/common/Badge/Badge.module.css
touch src/components/common/Tabs/index.jsx
touch src/components/common/Tabs/Tabs.module.css
touch src/components/common/Avatar/index.jsx
touch src/components/common/Avatar/Avatar.module.css
touch src/components/common/Rating/index.jsx
touch src/components/common/Rating/Rating.module.css
touch src/components/common/FileUpload/index.jsx
touch src/components/common/FileUpload/FileUpload.module.css
touch src/components/common/DatePicker/index.jsx
touch src/components/common/DatePicker/DatePicker.module.css
touch src/components/common/EmptyState/index.jsx
touch src/components/common/EmptyState/EmptyState.module.css
touch src/components/common/ErrorState/index.jsx
touch src/components/common/ErrorState/ErrorState.module.css

# Layout components
touch src/components/layout/Header/index.jsx
touch src/components/layout/Header/Header.module.css
touch src/components/layout/Footer/index.jsx
touch src/components/layout/Footer/Footer.module.css
touch src/components/layout/MobileMenu/index.jsx
touch src/components/layout/MobileMenu/MobileMenu.module.css
touch src/components/layout/Breadcrumbs/index.jsx
touch src/components/layout/Breadcrumbs/Breadcrumbs.module.css

# Account components
touch src/components/account/ProfileCard/index.jsx
touch src/components/account/ProfileCard/ProfileCard.module.css
touch src/components/account/VehicleCard/index.jsx
touch src/components/account/VehicleCard/VehicleCard.module.css
touch src/components/account/SessionCard/index.jsx
touch src/components/account/SessionCard/SessionCard.module.css
touch src/components/account/LoginHistoryCard/index.jsx
touch src/components/account/LoginHistoryCard/LoginHistoryCard.module.css

# Styles
touch src/styles/theme.css
touch src/styles/utilities.css

# Services
touch src/services/api.js
touch src/services/auth.service.js
touch src/services/profile.service.js
touch src/services/vehicle.service.js

# Store
touch src/store/authStore.js
touch src/store/uiStore.js
touch src/store/vehicleStore.js

# Hooks
touch src/hooks/useAuth.js
touch src/hooks/useFetch.js
touch src/hooks/useToast.js
touch src/hooks/useDebounce.js

# Utils
touch src/utils/constants.js
touch src/utils/formatters.js
touch src/utils/validators.js
touch src/utils/helpers.js

# Middleware
touch src/middleware.js

echo "✅ Empty files created!"

# ==================== WRITE CONFIGURATION FILES ====================
echo "⚙️ Writing configuration files..."

# package.json
cat > package.json << 'EOF'
{
  "name": "savitri-public",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.13",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "eslint": "^9.11.1",
    "eslint-config-next": "14.2.13"
  }
}
EOF

# next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.app.github.dev',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Savitri Shipping',
  },
};

module.exports = nextConfig;
EOF

# .env.example
cat > .env.example << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App Information
NEXT_PUBLIC_APP_NAME="Savitri Shipping"
NEXT_PUBLIC_COMPANY_PHONE="+91 98765 43210"
NEXT_PUBLIC_COMPANY_EMAIL="info@savitrishipping.in"
NEXT_PUBLIC_COMPANY_ADDRESS="Mumbai, Maharashtra, India"

# Social Media (optional)
NEXT_PUBLIC_FACEBOOK_URL=""
NEXT_PUBLIC_INSTAGRAM_URL=""
NEXT_PUBLIC_TWITTER_URL=""
EOF

# .env.local
cat > .env.local << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App Information
NEXT_PUBLIC_APP_NAME="Savitri Shipping"
NEXT_PUBLIC_COMPANY_PHONE="+91 98765 43210"
NEXT_PUBLIC_COMPANY_EMAIL="info@savitrishipping.in"
NEXT_PUBLIC_COMPANY_ADDRESS="Mumbai, Maharashtra, India"
EOF

# .gitignore additions
cat >> .gitignore << 'EOF'

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

echo "✅ Configuration files written!"

# ==================== INSTALL DEPENDENCIES ====================
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎉 ============================================"
echo "🎉 PROJECT SETUP COMPLETE!"
echo "🎉 ============================================"
echo ""
echo "📋 Next steps:"
echo "   1. Review the folder structure"
echo "   2. Wait for code artifacts for each file"
echo "   3. Copy code into respective files"
echo "   4. Run 'npm run dev' to start development"
echo ""
echo "🚀 Ready to receive code artifacts!"
echo ""