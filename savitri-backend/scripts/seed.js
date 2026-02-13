// scripts/seed.js

require('dotenv').config();
const connectDB = require('../src/config/database');
const { Role, AdminUser, Setting, SpeedBoat, PartyBoat, OperatingCalendar, PricingRule, Coupon, Inquiry } = require('../src/models');
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
    await SpeedBoat.deleteMany({});
    await PartyBoat.deleteMany({});
    await OperatingCalendar.deleteMany({});
    await PricingRule.deleteMany({});
    await Coupon.deleteMany({});
    await Inquiry.deleteMany({});

    // ==================== ROLES ====================
    console.log('Creating roles...');

    // 1. Admin Role (Full Access)
    const adminRole = await Role.create({
      name: 'Admin',
      description: 'Full system access',
      isSystem: true,
      permissions: {
        dashboard: { view: true },
        adminUsers: { view: true, create: true, edit: true, delete: true },
        roles: { view: true, create: true, edit: true, delete: true },
        customers: { view: true, edit: true, delete: true },
        settings: { view: true, edit: true },
        speedBoats: { view: true, create: true, edit: true, delete: true },
        partyBoats: { view: true, create: true, edit: true, delete: true },
        bookings: { view: true, create: true, edit: true, cancel: true },
        partyBookings: { view: true, create: true, edit: true, cancel: true },
        calendar: { view: true, edit: true },
        pricingRules: { view: true, create: true, edit: true, delete: true },
        coupons: { view: true, create: true, edit: true, delete: true },
        reviews: { view: true, edit: true, delete: true },
        inquiries: { view: true, create: true, edit: true, delete: true },
        notifications: { view: true },
        marketing: { view: true, create: true },
        analytics: { view: true },
      },
    });

    // 2. Staff Role (Limited Access)
    await Role.create({
      name: 'Staff',
      description: 'Limited access for staff members',
      isSystem: true,
      permissions: {
        dashboard: { view: true },
        roles: { view: true },
        customers: { view: true },
        settings: { view: true },
        speedBoats: { view: true },
        partyBoats: { view: true },
        bookings: { view: true },
        partyBookings: { view: true },
        calendar: { view: true },
        pricingRules: { view: true },
        coupons: { view: true },
        reviews: { view: true },
        inquiries: { view: true },
        notifications: { view: true },
        marketing: { view: true },
        analytics: { view: true },
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

    // ==================== SETTINGS ====================
    console.log('Creating default settings...');

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
        socialLinks: { facebook: '', instagram: '', twitter: '' },
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR',
        currencySymbol: '₹',
      },
    });

    await Setting.create({
      group: 'notification',
      key: 'config',
      value: {
        emailEnabled: true,
        smsEnabled: false,
        adminAlertEmail: 'singhsachin09820@gmail.com',
      },
    });

    await Setting.create({
      group: 'billing',
      key: 'config',
      value: {
        gstPercent: 18,
        gstInclusive: false,
        gstNumber: '',
        invoicePrefix: 'SB',
        companyPAN: '',
      },
    });

    await Setting.create({
      group: 'booking',
      key: 'config',
      value: {
        maxAdvanceDays: 45,
        minNoticeHours: 2,
        bufferMinutes: 30,
        minDurationHours: 1,
        maxDurationHours: 8,
        operatingStartTime: '08:00',
        operatingEndTime: '18:00',
        cancellationPolicy: {
          fullRefundHours: 24,
          partialRefundHours: 12,
          partialRefundPercent: 50,
        },
        autoConfirm: false,
        requirePaymentForConfirmation: false,
        advancePaymentPercent: 25,
        advanceRefundPolicy: 'Non-refundable within 24 hours of booking date, full refund otherwise',
      },
    });

    await Setting.create({
      group: 'content',
      key: 'config',
      value: {
        heroTitle: 'Experience the Thrill of Speed Boating',
        heroSubtitle: 'Book your adventure on the water today',
        aboutText: '',
        termsAndConditions: '',
        cancellationPolicyText: '',
        contactInfo: {
          address: 'Mumbai, Maharashtra, India',
          phone: '+91 98765 43210',
          email: 'info@savitrishipping.in',
          mapUrl: '',
        },
      },
    });

    console.log('✅ Settings created (general, notification, billing, booking, content)');

    // ==================== SPEED BOATS ====================
    console.log('Creating speed boats...');

    await SpeedBoat.insertMany([
      {
        name: 'Sea Hawk',
        registrationNumber: 'MH-SB-1234',
        capacity: 8,
        description: 'A powerful and sleek speed boat perfect for small groups. Features comfortable seating, Bluetooth speakers, and a sun canopy for shade.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets', 'Bluetooth Speakers', 'Sun Canopy'],
        baseRate: 2500,
        status: 'ACTIVE',
        images: [],
      },
      {
        name: 'Ocean Rider',
        registrationNumber: 'MH-SB-1235',
        capacity: 6,
        description: 'Compact and agile speed boat ideal for couples and small families. Cushioned seats for a smooth, comfortable ride.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets', 'Cushioned Seats'],
        baseRate: 2000,
        status: 'ACTIVE',
        images: [],
      },
      {
        name: 'Wave Runner',
        registrationNumber: 'MH-SB-1236',
        capacity: 10,
        description: 'Our most popular speed boat with room for larger groups. Equipped with Bluetooth speakers, sun canopy, and a mini fridge.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets', 'Bluetooth Speakers', 'Sun Canopy', 'Mini Fridge'],
        baseRate: 3500,
        status: 'ACTIVE',
        images: [],
      },
      {
        name: 'Coastal Star',
        registrationNumber: 'MH-SB-1237',
        capacity: 6,
        description: 'Budget-friendly speed boat without compromising on safety or comfort. Perfect for a quick adventure on the water.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets'],
        baseRate: 1800,
        status: 'ACTIVE',
        images: [],
      },
      {
        name: 'Blue Marlin',
        registrationNumber: 'MH-SB-1238',
        capacity: 8,
        description: 'Feature-rich speed boat with GPS navigation, premium sound system, and sun canopy. Great for longer trips.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets', 'GPS Navigation', 'Premium Sound System', 'Sun Canopy'],
        baseRate: 2800,
        status: 'ACTIVE',
        images: [],
      },
      {
        name: 'Thunder Bolt',
        registrationNumber: 'MH-SB-1239',
        capacity: 12,
        description: 'Our largest and fastest speed boat. Premium sound system, spacious deck, mini fridge, and sun canopy for the ultimate group experience.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets', 'Premium Sound System', 'Sun Canopy', 'Mini Fridge', 'Spacious Deck'],
        baseRate: 4000,
        status: 'ACTIVE',
        images: [],
      },
    ]);

    console.log('✅ Created 6 speed boats');

    // ==================== PARTY BOATS ====================
    console.log('Creating party boats...');

    await PartyBoat.insertMany([
      {
        name: 'Royal Celebration',
        description: 'The ultimate party venue on water. Royal Celebration offers a grand deck with premium sound system, LED lighting, and a spacious dance floor. Perfect for weddings, corporate events, and milestone celebrations.',
        capacityMin: 50,
        capacityMax: 100,
        basePrice: 50000,
        locationOptions: ['HARBOR', 'CRUISE'],
        operatingStartTime: '06:00',
        operatingEndTime: '00:00',
        timeSlots: ['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'],
        eventTypes: ['WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FAREWELL', 'OTHER'],
        djIncluded: true,
        addOns: [
          { type: 'CATERING_VEG', label: 'Vegetarian Catering', price: 400, priceType: 'PER_PERSON' },
          { type: 'CATERING_NONVEG', label: 'Non-Vegetarian Catering', price: 600, priceType: 'PER_PERSON' },
          { type: 'LIVE_BAND', label: 'Live Band', price: 25000, priceType: 'FIXED' },
          { type: 'PHOTOGRAPHER', label: 'Professional Photographer', price: 20000, priceType: 'FIXED' },
          { type: 'DECORATION_STANDARD', label: 'Standard Decoration', price: 15000, priceType: 'FIXED' },
        ],
        status: 'ACTIVE',
        images: [],
      },
      {
        name: 'Paradise Cruiser',
        description: 'Experience the magic of sailing while you celebrate. Paradise Cruiser takes your event on a scenic cruise along the Mumbai coastline with breathtaking views of the skyline. Multiple decks and open-air seating for an unforgettable experience.',
        capacityMin: 80,
        capacityMax: 150,
        basePrice: 75000,
        locationOptions: ['CRUISE'],
        operatingStartTime: '06:00',
        operatingEndTime: '00:00',
        timeSlots: ['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'],
        eventTypes: ['WEDDING', 'BIRTHDAY', 'CORPORATE', 'OTHER'],
        djIncluded: true,
        addOns: [
          { type: 'CATERING_VEG', label: 'Vegetarian Catering', price: 400, priceType: 'PER_PERSON' },
          { type: 'CATERING_NONVEG', label: 'Non-Vegetarian Catering', price: 600, priceType: 'PER_PERSON' },
          { type: 'LIVE_BAND', label: 'Live Band', price: 30000, priceType: 'FIXED' },
          { type: 'PHOTOGRAPHER', label: 'Professional Photographer', price: 25000, priceType: 'FIXED' },
          { type: 'DECORATION_STANDARD', label: 'Standard Decoration', price: 20000, priceType: 'FIXED' },
        ],
        status: 'ACTIVE',
        images: [],
      },
      {
        name: 'Star Night',
        description: 'An intimate party venue perfect for smaller gatherings. Star Night offers a cozy yet vibrant atmosphere with great music and city views from the harbor. Ideal for birthdays, college farewells, and close-knit celebrations.',
        capacityMin: 30,
        capacityMax: 60,
        basePrice: 35000,
        locationOptions: ['HARBOR'],
        operatingStartTime: '06:00',
        operatingEndTime: '00:00',
        timeSlots: ['AFTERNOON', 'EVENING'],
        eventTypes: ['BIRTHDAY', 'COLLEGE_FAREWELL', 'CORPORATE', 'OTHER'],
        djIncluded: true,
        addOns: [
          { type: 'CATERING_VEG', label: 'Vegetarian Catering', price: 400, priceType: 'PER_PERSON' },
          { type: 'CATERING_NONVEG', label: 'Non-Vegetarian Catering', price: 600, priceType: 'PER_PERSON' },
          { type: 'LIVE_BAND', label: 'Live Band', price: 25000, priceType: 'FIXED' },
          { type: 'PHOTOGRAPHER', label: 'Professional Photographer', price: 15000, priceType: 'FIXED' },
          { type: 'DECORATION_STANDARD', label: 'Standard Decoration', price: 10000, priceType: 'FIXED' },
        ],
        status: 'ACTIVE',
        images: [],
      },
      {
        name: 'Grand Voyager',
        description: 'The largest and most luxurious party boat in our fleet. Grand Voyager features multiple decks, a grand ballroom, VIP lounge, and state-of-the-art facilities for the most spectacular events. Premium amenities for grand weddings and high-end corporate events.',
        capacityMin: 100,
        capacityMax: 200,
        basePrice: 100000,
        locationOptions: ['HARBOR', 'CRUISE'],
        operatingStartTime: '06:00',
        operatingEndTime: '00:00',
        timeSlots: ['MORNING', 'AFTERNOON', 'EVENING', 'FULL_DAY'],
        eventTypes: ['WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FAREWELL', 'OTHER'],
        djIncluded: true,
        addOns: [
          { type: 'CATERING_VEG', label: 'Premium Vegetarian Catering', price: 400, priceType: 'PER_PERSON' },
          { type: 'CATERING_NONVEG', label: 'Premium Non-Veg Catering', price: 600, priceType: 'PER_PERSON' },
          { type: 'LIVE_BAND', label: 'Live Band', price: 30000, priceType: 'FIXED' },
          { type: 'PHOTOGRAPHER', label: 'Professional Photographer + Videographer', price: 35000, priceType: 'FIXED' },
          { type: 'DECORATION_STANDARD', label: 'Grand Decoration', price: 20000, priceType: 'FIXED' },
        ],
        status: 'ACTIVE',
        images: [],
      },
    ]);

    console.log('✅ Created 4 party boats');

    // ==================== OPERATING CALENDAR ====================
    // Calendar is managed via admin panel. Seed only clears old data.
    console.log('✅ Operating calendar cleared (manage via admin panel)');

    // ==================== PRICING RULES ====================
    console.log('Creating pricing rules...');

    await PricingRule.insertMany([
      {
        name: 'Weekend Surcharge',
        type: 'WEEKEND',
        adjustmentPercent: 20,
        priority: 1,
        conditions: {
          daysOfWeek: [0, 6],
        },
        isActive: true,
      },
      {
        name: 'Peak Hours (2PM - 6PM)',
        type: 'PEAK_HOURS',
        adjustmentPercent: 15,
        priority: 2,
        conditions: {
          startTime: '14:00',
          endTime: '18:00',
        },
        isActive: true,
      },
      {
        name: 'Early Bird Discount (8AM - 10AM)',
        type: 'OFF_PEAK_HOURS',
        adjustmentPercent: -10,
        priority: 1,
        conditions: {
          startTime: '08:00',
          endTime: '10:00',
        },
        isActive: true,
      },
    ]);

    console.log('✅ Created 3 pricing rules');

    // ==================== COUPONS ====================
    console.log('Creating coupons...');

    await Coupon.insertMany([
      {
        code: 'WELCOME10',
        description: '10% off on your first booking',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscountAmount: 500,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2027-12-31'),
        usageLimit: 0,
        applicableTo: 'ALL',
        isActive: true,
      },
      {
        code: 'SPEED20',
        description: '₹200 off on speed boat bookings',
        discountType: 'FIXED',
        discountValue: 200,
        minOrderAmount: 1000,
        maxDiscountAmount: 0,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2027-12-31'),
        usageLimit: 100,
        applicableTo: 'SPEED_BOAT',
        isActive: true,
      },
      {
        code: 'PARTY500',
        description: '₹500 off on party boat bookings',
        discountType: 'FIXED',
        discountValue: 500,
        minOrderAmount: 10000,
        maxDiscountAmount: 0,
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2027-12-31'),
        usageLimit: 50,
        applicableTo: 'PARTY_BOAT',
        isActive: true,
      },
    ]);

    console.log('✅ Created 3 coupons');

    console.log('\n🎉 Database seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
