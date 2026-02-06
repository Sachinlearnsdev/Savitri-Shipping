// scripts/seed.js

require('dotenv').config();
const connectDB = require('../src/config/database');
const { Role, AdminUser, Setting } = require('../src/models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out in production)
    await Role.deleteMany({});
    await AdminUser.deleteMany({});
    await Setting.deleteMany({});

    // ==================== ROLES (PHASE 1 - SIMPLIFIED) ====================
    console.log('Creating roles...');

    // 1. Admin Role (Full Access)
    const adminRole = await Role.create({
      name: 'Admin',
      description: 'Full system access',
      isSystem: true,
      permissions: {
        dashboard: { view: true },
        adminUsers: { view: true, create: true, edit: true, delete: true },
        customers: { view: true, edit: true, delete: true },
        settings: { view: true, edit: true },
      },
    });

    // 2. Staff Role (Limited Access)
    await Role.create({
      name: 'Staff',
      description: 'Limited access for staff members',
      isSystem: true,
      permissions: {
        dashboard: { view: true },
        customers: { view: true },
        settings: { view: true },
      },
    });

    console.log('✅ Created 2 roles (Admin, Staff)');

    // ==================== DEFAULT ADMIN USER ====================
    console.log('Creating default admin user...');

    const hashedPassword = await bcrypt.hash('Test@1234', 10);

    await AdminUser.create({
      email: 'singhsachin09820@gmail.com',
      password: hashedPassword,
      name: 'Sachin Singh',
      phone: '9876543210',
      roleId: adminRole._id,
      status: 'ACTIVE',
    });

    console.log('✅ Default admin user created');
    console.log('   Email: singhsachin09820@gmail.com');
    console.log('   Password: Test@1234');
    console.log('   ⚠️  CHANGE PASSWORD IN PRODUCTION!');

    // ==================== SETTINGS (PHASE 1 - SIMPLIFIED) ====================
    console.log('Creating default settings...');

    // General Settings
    await Setting.create({
      group: 'general',
      key: 'company',
      value: {
        companyName: 'Savitri Shipping',
        companyLogo: null,
        companyAddress: 'Mumbai, Maharashtra, India',
        contactEmail: 'info@savitrishipping.in',
        contactPhone: '+91 98765 43210',
        websiteUrl: 'https://savitrishipping.in',
        socialLinks: {
          facebook: '',
          instagram: '',
          twitter: '',
        },
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR',
        currencySymbol: '₹',
      },
    });

    // Notification Settings
    await Setting.create({
      group: 'notification',
      key: 'config',
      value: {
        emailEnabled: true,
        smsEnabled: false, // SMS integration in Phase 2
        adminAlertEmail: 'singhsachin09820@gmail.com',
      },
    });

    // PHASE 2: Billing, Booking, and Content settings will be added later

    console.log('✅ Settings created (general + notification only)');

    console.log('\n🎉 Database seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();