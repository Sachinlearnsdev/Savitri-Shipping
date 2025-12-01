// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ==================== ROLES ====================
  console.log('Creating roles...');

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Full system access',
      isSystem: true,
      permissions: {
        dashboard: { view: true },
        adminUsers: { view: true, create: true, edit: true, delete: true },
        roles: { view: true, create: true, edit: true, delete: true },
        customers: { view: true, edit: true, delete: true },
        ports: { view: true, create: true, edit: true, delete: true },
        passengerTypes: { view: true, create: true, edit: true, delete: true },
        vehicleBrands: { view: true, create: true, edit: true, delete: true },
        vehicleModels: { view: true, create: true, edit: true, delete: true },
        categories: { view: true, create: true, edit: true, delete: true },
        operators: { view: true, create: true, edit: true, delete: true },
        ferries: { view: true, create: true, edit: true, delete: true },
        routes: { view: true, create: true, edit: true, delete: true },
        trips: { view: true, create: true, edit: true, delete: true, cancel: true },
        speedBoats: { view: true, create: true, edit: true, delete: true },
        partyBoats: { view: true, create: true, edit: true, delete: true },
        packages: { view: true, create: true, edit: true, delete: true },
        addons: { view: true, create: true, edit: true, delete: true },
        inquiries: { view: true, respond: true, convert: true },
        bookings: { view: true, create: true, edit: true, cancel: true, refund: true, cashPayment: true },
        reviews: { view: true, moderate: true, delete: true },
        faqs: { view: true, create: true, edit: true, delete: true },
        pages: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, edit: true },
        reports: { view: true, export: true },
      },
    },
  });

  const operationsManagerRole = await prisma.role.upsert({
    where: { name: 'Operations Manager' },
    update: {},
    create: {
      name: 'Operations Manager',
      description: 'Manage operations and bookings',
      isSystem: true,
      permissions: {
        dashboard: { view: true },
        customers: { view: true },
        ports: { view: true, create: true, edit: true },
        routes: { view: true, create: true, edit: true },
        trips: { view: true, create: true, edit: true, cancel: true },
        inquiries: { view: true, respond: true, convert: true },
        bookings: { view: true, create: true, edit: true, cancel: true, refund: true, cashPayment: true },
        reviews: { view: true, moderate: true },
        settings: { view: true },
        reports: { view: true, export: true },
      },
    },
  });

  const fleetManagerRole = await prisma.role.upsert({
    where: { name: 'Fleet Manager' },
    update: {},
    create: {
      name: 'Fleet Manager',
      description: 'Manage fleet and vessels',
      isSystem: true,
      permissions: {
        dashboard: { view: true },
        customers: { view: true },
        ports: { view: true },
        ferries: { view: true, create: true, edit: true },
        speedBoats: { view: true, create: true, edit: true },
        partyBoats: { view: true, create: true, edit: true },
        categories: { view: true, edit: true },
        packages: { view: true, create: true, edit: true },
        bookings: { view: true },
        reports: { view: true },
      },
    },
  });

  const bookingAgentRole = await prisma.role.upsert({
    where: { name: 'Booking Agent' },
    update: {},
    create: {
      name: 'Booking Agent',
      description: 'Handle customer bookings',
      isSystem: true,
      permissions: {
        dashboard: { view: true },
        customers: { view: true },
        trips: { view: true },
        speedBoats: { view: true },
        partyBoats: { view: true },
        inquiries: { view: true, respond: true, convert: true },
        bookings: { view: true, create: true, edit: true, cancel: true },
        reviews: { view: true },
      },
    },
  });

  const contentManagerRole = await prisma.role.upsert({
    where: { name: 'Content Manager' },
    update: {},
    create: {
      name: 'Content Manager',
      description: 'Manage website content',
      isSystem: true,
      permissions: {
        dashboard: { view: true },
        categories: { view: true, edit: true },
        ferries: { view: true, edit: true },
        speedBoats: { view: true, edit: true },
        partyBoats: { view: true, edit: true },
        faqs: { view: true, create: true, edit: true, delete: true },
        pages: { view: true, create: true, edit: true, delete: true },
        reviews: { view: true, moderate: true },
      },
    },
  });

  const supportStaffRole = await prisma.role.upsert({
    where: { name: 'Support Staff' },
    update: {},
    create: {
      name: 'Support Staff',
      description: 'Customer support',
      isSystem: true,
      permissions: {
        dashboard: { view: true },
        customers: { view: true },
        bookings: { view: true },
        inquiries: { view: true },
        reviews: { view: true },
        faqs: { view: true },
      },
    },
  });

  console.log('✅ Roles created');

  // ==================== SUPER ADMIN USER ====================
  console.log('Creating Super Admin user...');

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@savitrishipping.in' },
    update: {},
    create: {
      email: 'admin@savitrishipping.in',
      password: hashedPassword,
      name: 'Super Administrator',
      phone: '9876543210',
      roleId: superAdminRole.id,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Super Admin created');
  console.log('   Email: admin@savitrishipping.in');
  console.log('   Password: Admin@123');

  // ==================== SETTINGS ====================
  console.log('Creating default settings...');

  // General Settings
  await prisma.setting.upsert({
    where: { group_key: { group: 'general', key: 'company' } },
    update: {},
    create: {
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
    },
  });

  // Billing Settings
  await prisma.setting.upsert({
    where: { group_key: { group: 'billing', key: 'config' } },
    update: {},
    create: {
      group: 'billing',
      key: 'config',
      value: {
        companyLegalName: 'Savitri Shipping Pvt Ltd',
        gstin: '',
        pan: '',
        bankDetails: {
          accountName: '',
          accountNumber: '',
          bankName: '',
          ifscCode: '',
          branch: '',
        },
        gstEnabled: false,
        gstPercentage: 18,
        gstType: 'exclusive',
        hsnSacCode: '996722',
        invoicePrefix: 'SAV-',
        invoiceStartNumber: 1001,
        invoiceFooter: 'Thank you for choosing Savitri Shipping!',
      },
    },
  });

  // Booking Settings
  await prisma.setting.upsert({
    where: { group_key: { group: 'booking', key: 'config' } },
    update: {},
    create: {
      group: 'booking',
      key: 'config',
      value: {
        speedBoatOperatingHours: { from: '06:00', to: '18:00' },
        partyBoatOperatingHours: { from: '06:00', to: '00:00' },
        ferryOperatingHours: { from: '06:00', to: '18:00' },
        defaultAdvanceBookingDays: 30,
        cancellationPolicy: {
          speedBoat: {
            freeHours: 24,
            partialRefundHours: 12,
            partialRefundPercent: 50,
          },
          partyBoat: {
            freeDays: 7,
            partialRefundDays: 3,
            partialRefundPercent: 50,
          },
          ferry: {
            freeHours: 24,
            partialRefundHours: 6,
            partialRefundPercent: 50,
          },
        },
        refundProcessingDays: 7,
      },
    },
  });

  // Notification Settings
  await prisma.setting.upsert({
    where: { group_key: { group: 'notification', key: 'config' } },
    update: {},
    create: {
      group: 'notification',
      key: 'config',
      value: {
        emailEnabled: true,
        smsEnabled: true,
        adminAlertEmail: 'admin@savitrishipping.in',
        reminderHoursBeforeTrip: 24,
        smsReminderHoursBeforeTrip: 2,
      },
    },
  });

  // Content Settings
  await prisma.setting.upsert({
    where: { group_key: { group: 'content', key: 'pages' } },
    update: {},
    create: {
      group: 'content',
      key: 'pages',
      value: {
        termsAndConditions: '<p>Terms and conditions content will be added here...</p>',
        privacyPolicy: '<p>Privacy policy content will be added here...</p>',
        refundPolicy: '<p>Refund policy content will be added here...</p>',
        aboutUs: '<p>About us content will be added here...</p>',
      },
    },
  });

  console.log('✅ Settings created');

  console.log('\n🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });