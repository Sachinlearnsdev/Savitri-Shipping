// scripts/seed.js

require('dotenv').config();
const connectDB = require('../src/config/database');
const { Role, AdminUser, Setting, SpeedBoat, PartyBoat, OperatingCalendar, PricingRule, Coupon, Inquiry, Customer, SpeedBoatBooking, PartyBoatBooking, Review } = require('../src/models');
const bcrypt = require('bcryptjs');

// ==================== HELPER FUNCTIONS ====================

const calcGST = (amount) => {
  const gstAmount = parseFloat(((amount * 18) / 100).toFixed(2));
  return {
    gstPercent: 18,
    gstAmount,
    cgst: parseFloat((gstAmount / 2).toFixed(2)),
    sgst: parseFloat((gstAmount / 2).toFixed(2)),
    totalAmount: parseFloat((amount + gstAmount).toFixed(2)),
  };
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const daysAgoDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysFromNowDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
};

const calcEndTime = (startTime, durationHours) => {
  const [h, m] = startTime.split(':').map(Number);
  const totalMins = h * 60 + m + durationHours * 60;
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

// ==================== IMAGE DATA ====================

const SPEED_BOAT_IMAGES = [
  // Sea Hawk
  [
    { url: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=600&fit=crop', publicId: 'seed-sb1-1' },
    { url: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop', publicId: 'seed-sb1-2' },
  ],
  // Ocean Rider
  [
    { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop', publicId: 'seed-sb2-1' },
    { url: 'https://images.unsplash.com/photo-1562281302-809108fd533c?w=800&h=600&fit=crop', publicId: 'seed-sb2-2' },
  ],
  // Wave Runner
  [
    { url: 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=800&h=600&fit=crop', publicId: 'seed-sb3-1' },
    { url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop', publicId: 'seed-sb3-2' },
  ],
  // Coastal Star
  [
    { url: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=600&fit=crop', publicId: 'seed-sb4-1' },
    { url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop', publicId: 'seed-sb4-2' },
  ],
  // Blue Marlin
  [
    { url: 'https://images.unsplash.com/photo-1559599189-fe84dea4eb79?w=800&h=600&fit=crop', publicId: 'seed-sb5-1' },
    { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop', publicId: 'seed-sb5-2' },
  ],
  // Thunder Bolt
  [
    { url: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=800&h=600&fit=crop', publicId: 'seed-sb6-1' },
    { url: 'https://images.unsplash.com/photo-1552353617-3bfd679b3bdd?w=800&h=600&fit=crop', publicId: 'seed-sb6-2' },
  ],
];

const PARTY_BOAT_IMAGES = [
  // Royal Celebration
  [
    { url: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop', publicId: 'seed-pb1-1' },
    { url: 'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=800&h=600&fit=crop', publicId: 'seed-pb1-2' },
    { url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800&h=600&fit=crop', publicId: 'seed-pb1-3' },
  ],
  // Paradise Cruiser
  [
    { url: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?w=800&h=600&fit=crop', publicId: 'seed-pb2-1' },
    { url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&h=600&fit=crop', publicId: 'seed-pb2-2' },
    { url: 'https://images.unsplash.com/photo-1593351415075-3bac9f45c877?w=800&h=600&fit=crop', publicId: 'seed-pb2-3' },
  ],
  // Star Night
  [
    { url: 'https://images.unsplash.com/photo-1559599076-9c61d8e1b77c?w=800&h=600&fit=crop', publicId: 'seed-pb3-1' },
    { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=600&fit=crop', publicId: 'seed-pb3-2' },
  ],
  // Grand Voyager
  [
    { url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&h=600&fit=crop', publicId: 'seed-pb4-1' },
    { url: 'https://images.unsplash.com/photo-1514649923863-ceaf75b7ec00?w=800&h=600&fit=crop', publicId: 'seed-pb4-2' },
    { url: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&h=600&fit=crop', publicId: 'seed-pb4-3' },
  ],
];

// ==================== REVIEW COMMENTS ====================

const REVIEW_COMMENTS = [
  'Amazing experience! The crew was very professional and friendly. Will definitely recommend to friends.',
  'Great ride, beautiful views of the coastline. Perfect way to spend a weekend.',
  'Fantastic boat, well maintained. Highly recommended for families with kids.',
  'Good value for money. The captain was knowledgeable and very entertaining.',
  'Perfect for our group outing. Everyone had a wonderful time on the water.',
  'Smooth booking process and excellent service. Everything was well organized.',
  'The sunset ride was absolutely breathtaking. A 10/10 experience!',
  'Clean boat, safety equipment provided, very professional and courteous crew.',
  'Had a blast! Kids loved it. Great family-friendly experience overall.',
  'Excellent service from start to finish. Very well organized and safe.',
  'The boat was in great condition and the ride was incredibly smooth.',
  'Very enjoyable experience. Staff was helpful and made us feel welcome.',
  'Beautiful experience on the water. Highly recommend to everyone visiting Mumbai.',
  'Wonderful celebration on the party boat! DJ was great, food was delicious.',
  'Our corporate event was a huge success thanks to the amazing boat and crew.',
  'Birthday party on the boat was unforgettable. Decoration was beautiful.',
  'College farewell was the best we could have imagined. Thank you Savitri Shipping!',
  'The harbor view at sunset was magical. Perfect venue for our anniversary.',
  'Booking was easy, communication was excellent, and the ride exceeded expectations.',
  'We booked for a wedding reception and it was absolutely stunning. Guests loved it.',
];

// ==================== MAIN SEED FUNCTION ====================

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to database
    await connectDB();

    // Clear ALL existing data
    console.log('Clearing existing data...');
    await Role.deleteMany({});
    await AdminUser.deleteMany({});
    await Setting.deleteMany({});
    await SpeedBoat.deleteMany({});
    await PartyBoat.deleteMany({});
    await OperatingCalendar.deleteMany({});
    await PricingRule.deleteMany({});
    await Coupon.deleteMany({});
    await Inquiry.deleteMany({});
    await Customer.deleteMany({});
    await SpeedBoatBooking.deleteMany({});
    await PartyBoatBooking.deleteMany({});
    await Review.deleteMany({});
    console.log('✅ All collections cleared\n');

    // ==================== ROLES ====================
    console.log('Creating roles...');

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

    const adminUser = await AdminUser.create({
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
      key: 'config',
      value: {
        companyName: 'Savitri Shipping',
        companyLogo: null,
        companyAddress: 'Gateway of India, Mumbai, Maharashtra 400001, India',
        contactEmail: 'info@savitrishipping.in',
        contactPhone: '+91 98765 43210',
        websiteUrl: 'https://savitrishipping.in',
        socialLinks: { facebook: 'https://facebook.com/savitrishipping', instagram: 'https://instagram.com/savitrishipping', twitter: '' },
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        currency: 'INR',
        currencySymbol: '₹',
        websiteStats: {
          boatsInFleet: 10,
          happyCustomers: 500,
          eventsHosted: 150,
          yearsExperience: 8,
        },
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
        gstNumber: '27AABCS1234F1ZG',
        invoicePrefix: 'SB',
        companyPAN: 'AABCS1234F',
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
        aboutText: 'Savitri Shipping has been providing premium boat rental services in Mumbai since 2018. We offer speed boat rides and party boat events along the beautiful Mumbai coastline.',
        termsAndConditions: '',
        cancellationPolicyText: '',
        contactInfo: {
          address: 'Gateway of India, Mumbai, Maharashtra 400001, India',
          phone: '+91 98765 43210',
          email: 'info@savitrishipping.in',
          mapUrl: '',
        },
        promoBanner: {
          enabled: true,
          text: '🎉 Valentine\'s Day Special! Get 10% off on all bookings!',
          couponCode: 'WELCOME10',
          backgroundColor: '#e74c3c',
        },
      },
    });

    console.log('✅ Settings created (general, notification, billing, booking, content)');

    // ==================== SPEED BOATS ====================
    console.log('Creating speed boats...');

    const speedBoats = await SpeedBoat.insertMany([
      {
        name: 'Sea Hawk',
        registrationNumber: 'MH-SB-1234',
        capacity: 8,
        description: 'A powerful and sleek speed boat perfect for small groups. Features comfortable seating, Bluetooth speakers, and a sun canopy for shade.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets', 'Bluetooth Speakers', 'Sun Canopy'],
        baseRate: 2500,
        status: 'ACTIVE',
        images: SPEED_BOAT_IMAGES[0],
      },
      {
        name: 'Ocean Rider',
        registrationNumber: 'MH-SB-1235',
        capacity: 6,
        description: 'Compact and agile speed boat ideal for couples and small families. Cushioned seats for a smooth, comfortable ride.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets', 'Cushioned Seats'],
        baseRate: 2000,
        status: 'ACTIVE',
        images: SPEED_BOAT_IMAGES[1],
      },
      {
        name: 'Wave Runner',
        registrationNumber: 'MH-SB-1236',
        capacity: 10,
        description: 'Our most popular speed boat with room for larger groups. Equipped with Bluetooth speakers, sun canopy, and a mini fridge.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets', 'Bluetooth Speakers', 'Sun Canopy', 'Mini Fridge'],
        baseRate: 3500,
        status: 'ACTIVE',
        images: SPEED_BOAT_IMAGES[2],
      },
      {
        name: 'Coastal Star',
        registrationNumber: 'MH-SB-1237',
        capacity: 6,
        description: 'Budget-friendly speed boat without compromising on safety or comfort. Perfect for a quick adventure on the water.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets'],
        baseRate: 1800,
        status: 'ACTIVE',
        images: SPEED_BOAT_IMAGES[3],
      },
      {
        name: 'Blue Marlin',
        registrationNumber: 'MH-SB-1238',
        capacity: 8,
        description: 'Feature-rich speed boat with GPS navigation, premium sound system, and sun canopy. Great for longer trips.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets', 'GPS Navigation', 'Premium Sound System', 'Sun Canopy'],
        baseRate: 2800,
        status: 'ACTIVE',
        images: SPEED_BOAT_IMAGES[4],
      },
      {
        name: 'Thunder Bolt',
        registrationNumber: 'MH-SB-1239',
        capacity: 12,
        description: 'Our largest and fastest speed boat. Premium sound system, spacious deck, mini fridge, and sun canopy for the ultimate group experience.',
        features: ['Captain Included', 'Safety Gear', 'Life Jackets', 'Premium Sound System', 'Sun Canopy', 'Mini Fridge', 'Spacious Deck'],
        baseRate: 4000,
        status: 'ACTIVE',
        images: SPEED_BOAT_IMAGES[5],
      },
    ]);

    console.log('✅ Created 6 speed boats (with images)');

    // ==================== PARTY BOATS ====================
    console.log('Creating party boats...');

    const partyBoats = await PartyBoat.insertMany([
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
        images: PARTY_BOAT_IMAGES[0],
      },
      {
        name: 'Paradise Cruiser',
        description: 'Experience the magic of sailing while you celebrate. Paradise Cruiser takes your event on a scenic cruise along the Mumbai coastline with breathtaking views of the skyline.',
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
        images: PARTY_BOAT_IMAGES[1],
      },
      {
        name: 'Star Night',
        description: 'An intimate party venue perfect for smaller gatherings. Star Night offers a cozy yet vibrant atmosphere with great music and city views from the harbor.',
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
        images: PARTY_BOAT_IMAGES[2],
      },
      {
        name: 'Grand Voyager',
        description: 'The largest and most luxurious party boat in our fleet. Grand Voyager features multiple decks, a grand ballroom, VIP lounge, and state-of-the-art facilities.',
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
        images: PARTY_BOAT_IMAGES[3],
      },
    ]);

    console.log('✅ Created 4 party boats (with images)');

    // ==================== OPERATING CALENDAR ====================
    console.log('Creating operating calendar...');

    const calendarEntries = [];
    for (let i = 0; i < 45; i++) {
      calendarEntries.push({
        date: daysFromNowDate(i),
        status: i % 15 === 14 ? 'CLOSED' : 'OPEN', // Close every 15th day for maintenance
        notes: i % 15 === 14 ? 'Maintenance day' : '',
      });
    }
    await OperatingCalendar.insertMany(calendarEntries);

    console.log('✅ Created 45 operating calendar entries');

    // ==================== PRICING RULES ====================
    console.log('Creating pricing rules...');

    await PricingRule.insertMany([
      {
        name: 'Weekend Surcharge',
        type: 'WEEKEND',
        adjustmentPercent: 20,
        priority: 1,
        conditions: { daysOfWeek: [0, 6] },
        isActive: true,
      },
      {
        name: 'Peak Hours (2PM - 6PM)',
        type: 'PEAK_HOURS',
        adjustmentPercent: 15,
        priority: 2,
        conditions: { startTime: '14:00', endTime: '18:00' },
        isActive: true,
      },
      {
        name: 'Early Bird Discount (8AM - 10AM)',
        type: 'OFF_PEAK_HOURS',
        adjustmentPercent: -10,
        priority: 1,
        conditions: { startTime: '08:00', endTime: '10:00' },
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
        usageCount: 23,
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
        usageCount: 12,
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
        usageCount: 5,
        applicableTo: 'PARTY_BOAT',
        isActive: true,
      },
    ]);

    console.log('✅ Created 3 coupons');

    // ==================== CUSTOMERS ====================
    console.log('Creating customers...');

    const customerPassword = await bcrypt.hash('Test@1234', 10);

    const customersData = [
      // User's actual email addresses
      { name: 'Sasi Kumar', email: 'onlysasi1603@gmail.com', phone: '9167951601', gender: 'MALE' },
      { name: 'Sachin Singh', email: 'singhsachin9167951601@gmail.com', phone: '9167951602', gender: 'MALE' },
      { name: 'Sachin Kumar', email: 'sachinsingh9167951601@gmail.com', phone: '9167951603', gender: 'MALE' },
      { name: 'Valid Bamne', email: 'validbamne@gmail.com', phone: '9167951604', gender: 'MALE' },
      // Realistic Indian dummy customers
      { name: 'Rahul Sharma', email: 'rahul.sharma.demo@gmail.com', phone: '9823456701', gender: 'MALE' },
      { name: 'Priya Patel', email: 'priya.patel.demo@gmail.com', phone: '9823456702', gender: 'FEMALE' },
      { name: 'Amit Kumar', email: 'amit.kumar.demo@gmail.com', phone: '9823456703', gender: 'MALE' },
      { name: 'Sneha Reddy', email: 'sneha.reddy.demo@gmail.com', phone: '9823456704', gender: 'FEMALE' },
      { name: 'Vikram Malhotra', email: 'vikram.malhotra.demo@gmail.com', phone: '9823456705', gender: 'MALE' },
      { name: 'Anita Desai', email: 'anita.desai.demo@gmail.com', phone: '9823456706', gender: 'FEMALE' },
      { name: 'Rajesh Gupta', email: 'rajesh.gupta.demo@gmail.com', phone: '9823456707', gender: 'MALE' },
      { name: 'Kavita Nair', email: 'kavita.nair.demo@gmail.com', phone: '9823456708', gender: 'FEMALE' },
      { name: 'Deepak Joshi', email: 'deepak.joshi.demo@gmail.com', phone: '9823456709', gender: 'MALE' },
      { name: 'Meera Iyer', email: 'meera.iyer.demo@gmail.com', phone: '9823456710', gender: 'FEMALE' },
      { name: 'Arjun Thakur', email: 'arjun.thakur.demo@gmail.com', phone: '9823456711', gender: 'MALE' },
    ];

    const customers = await Customer.insertMany(
      customersData.map((c) => ({
        ...c,
        password: customerPassword,
        emailVerified: true,
        phoneVerified: true,
        status: 'ACTIVE',
        completedRidesCount: 0,
        lastLogin: daysAgoDate(Math.floor(Math.random() * 30)),
      }))
    );

    console.log(`✅ Created ${customers.length} customers`);

    // ==================== SPEED BOAT BOOKINGS ====================
    console.log('Creating speed boat bookings...');

    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    const durations = [1, 1, 1.5, 2, 2, 3];
    const sbBookings = [];

    for (let i = 0; i < 80; i++) {
      const daysAgo = Math.floor(Math.random() * 90) + 1; // 1-90 days ago
      const bookingDate = daysAgoDate(daysAgo);
      const dateStr = formatDateStr(bookingDate);

      const customer = randomFrom(customers);
      const boat = randomFrom(speedBoats);
      const duration = randomFrom(durations);
      const startTime = randomFrom(timeSlots);
      const endTime = calcEndTime(startTime, duration);

      const baseRate = boat.baseRate;
      const subtotal = baseRate * 1 * duration; // 1 boat
      const gst = calcGST(subtotal);

      // Status distribution: 55 COMPLETED, 15 CONFIRMED, 5 PENDING, 3 CANCELLED, 2 NO_SHOW
      let status, paymentStatus, paymentMode;
      if (i < 55) {
        status = 'COMPLETED';
        paymentStatus = 'PAID';
        paymentMode = i % 3 === 0 ? 'AT_VENUE' : 'ONLINE';
      } else if (i < 70) {
        status = 'CONFIRMED';
        paymentStatus = i % 4 === 0 ? 'ADVANCE_PAID' : 'PAID';
        paymentMode = i % 4 === 0 ? 'AT_VENUE' : 'ONLINE';
      } else if (i < 75) {
        status = 'PENDING';
        paymentStatus = 'PENDING';
        paymentMode = 'ONLINE';
      } else if (i < 78) {
        status = 'CANCELLED';
        paymentStatus = 'REFUNDED';
        paymentMode = 'ONLINE';
      } else {
        status = 'NO_SHOW';
        paymentStatus = 'PAID';
        paymentMode = 'AT_VENUE';
      }

      // Apply coupon to some bookings
      let discountAmount = 0;
      let coupon = undefined;
      if (i % 8 === 0) {
        discountAmount = 200;
        coupon = { code: 'SPEED20', discountType: 'FIXED', discountValue: 200, discountAmount: 200 };
      }

      const finalAmount = gst.totalAmount - discountAmount;
      const advanceAmount = paymentStatus === 'ADVANCE_PAID' ? Math.round(finalAmount * 0.25) : 0;
      const remainingAmount = paymentStatus === 'ADVANCE_PAID' ? finalAmount - advanceAmount : 0;

      sbBookings.push({
        bookingNumber: `SB-${dateStr}-${String(i + 1).padStart(3, '0')}`,
        customerId: customer._id,
        date: bookingDate,
        startTime,
        endTime,
        duration,
        numberOfBoats: 1,
        boatIds: [boat._id],
        boats: [{
          boatId: boat._id,
          boatName: boat.name,
          registrationNumber: boat.registrationNumber,
          pricePerHour: baseRate,
        }],
        pricing: {
          baseRate,
          adjustedRate: baseRate,
          subtotal,
          gstPercent: 18,
          gstAmount: gst.gstAmount,
          cgst: gst.cgst,
          sgst: gst.sgst,
          totalAmount: gst.totalAmount,
          discountAmount,
          coupon,
          finalAmount,
        },
        status,
        paymentStatus,
        paymentMode,
        advanceAmount,
        remainingAmount,
        createdByType: i % 5 === 0 ? 'ADMIN' : 'CUSTOMER',
        createdById: i % 5 === 0 ? adminUser._id : customer._id,
        createdByModel: i % 5 === 0 ? 'AdminUser' : 'Customer',
        cancellation: status === 'CANCELLED' ? {
          cancelledAt: new Date(bookingDate.getTime() - 86400000),
          cancelledBy: 'CUSTOMER',
          reason: 'Change of plans',
          refundPercent: 100,
          refundAmount: finalAmount,
        } : undefined,
        createdAt: bookingDate,
        updatedAt: bookingDate,
      });
    }

    await SpeedBoatBooking.insertMany(sbBookings, { timestamps: false });
    console.log('✅ Created 80 speed boat bookings');

    // ==================== PARTY BOAT BOOKINGS ====================
    console.log('Creating party boat bookings...');

    const partyTimeSlots = ['MORNING', 'AFTERNOON', 'EVENING'];
    const eventTypes = ['WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FAREWELL', 'OTHER'];
    const pbBookings = [];

    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 90) + 1;
      const bookingDate = daysAgoDate(daysAgo);
      const dateStr = formatDateStr(bookingDate);

      const customer = randomFrom(customers);
      const boat = randomFrom(partyBoats);
      const timeSlot = randomFrom(partyTimeSlots);
      const eventType = randomFrom(eventTypes);
      const locationType = randomFrom(boat.locationOptions);
      const numberOfGuests = boat.capacityMin + Math.floor(Math.random() * (boat.capacityMax - boat.capacityMin));

      const basePrice = boat.basePrice;
      const cateringPrice = 400 * numberOfGuests;
      const addOnsTotal = cateringPrice;
      const subtotal = basePrice + addOnsTotal;
      const gst = calcGST(subtotal);

      let status, paymentStatus, paymentMode;
      if (i < 15) {
        status = 'COMPLETED';
        paymentStatus = 'PAID';
        paymentMode = 'ONLINE';
      } else if (i < 20) {
        status = 'CONFIRMED';
        paymentStatus = i % 3 === 0 ? 'ADVANCE_PAID' : 'PAID';
        paymentMode = i % 3 === 0 ? 'AT_VENUE' : 'ONLINE';
      } else if (i < 22) {
        status = 'PENDING';
        paymentStatus = 'PENDING';
        paymentMode = 'ONLINE';
      } else {
        status = 'CANCELLED';
        paymentStatus = 'REFUNDED';
        paymentMode = 'ONLINE';
      }

      let discountAmount = 0;
      let coupon = undefined;
      if (i % 5 === 0) {
        discountAmount = 500;
        coupon = { code: 'PARTY500', discountType: 'FIXED', discountValue: 500, discountAmount: 500 };
      }

      const finalAmount = gst.totalAmount - discountAmount;
      const advanceAmount = paymentStatus === 'ADVANCE_PAID' ? Math.round(finalAmount * 0.25) : 0;
      const remainingAmount = paymentStatus === 'ADVANCE_PAID' ? finalAmount - advanceAmount : 0;

      pbBookings.push({
        bookingNumber: `PB-${dateStr}-${String(i + 1).padStart(3, '0')}`,
        customerId: customer._id,
        boatId: boat._id,
        date: bookingDate,
        timeSlot,
        eventType,
        numberOfGuests,
        locationType,
        selectedAddOns: [{
          type: 'CATERING_VEG',
          label: 'Vegetarian Catering',
          price: 400,
          priceType: 'PER_PERSON',
          quantity: numberOfGuests,
          total: cateringPrice,
        }],
        pricing: {
          basePrice,
          addOnsTotal,
          subtotal,
          gstPercent: 18,
          gstAmount: gst.gstAmount,
          cgst: gst.cgst,
          sgst: gst.sgst,
          totalAmount: gst.totalAmount,
          discountAmount,
          coupon,
          finalAmount,
        },
        status,
        paymentStatus,
        paymentMode,
        advanceAmount,
        remainingAmount,
        createdByType: 'ADMIN',
        createdById: adminUser._id,
        createdByModel: 'AdminUser',
        cancellation: status === 'CANCELLED' ? {
          cancelledAt: new Date(bookingDate.getTime() - 172800000),
          cancelledBy: 'CUSTOMER',
          reason: 'Event postponed',
          refundPercent: 100,
          refundAmount: finalAmount,
        } : undefined,
        createdAt: bookingDate,
        updatedAt: bookingDate,
      });
    }

    await PartyBoatBooking.insertMany(pbBookings, { timestamps: false });
    console.log('✅ Created 25 party boat bookings');

    // ==================== UPDATE CUSTOMER RIDE COUNTS ====================
    console.log('Updating customer ride counts...');

    const completedByCustomer = {};
    sbBookings.filter((b) => b.status === 'COMPLETED').forEach((b) => {
      const cid = b.customerId.toString();
      completedByCustomer[cid] = (completedByCustomer[cid] || 0) + 1;
    });
    for (const [customerId, count] of Object.entries(completedByCustomer)) {
      await Customer.updateOne({ _id: customerId }, { completedRidesCount: count });
    }
    console.log('✅ Updated customer ride counts');

    // ==================== REVIEWS ====================
    console.log('Creating reviews...');

    const reviews = [];

    for (let i = 0; i < 40; i++) {
      const customer = randomFrom(customers);
      const rating = i < 20 ? 5 : (i < 32 ? 4 : 3);
      const comment = REVIEW_COMMENTS[i % REVIEW_COMMENTS.length];
      const reviewDate = daysAgoDate(Math.floor(Math.random() * 60) + 1);

      if (i < 10) {
        // Company reviews
        reviews.push({
          customerId: customer._id,
          reviewType: 'COMPANY',
          rating,
          comment,
          customerName: customer.name,
          isVerified: true,
          isApproved: i < 8, // 2 unapproved
          createdAt: reviewDate,
          updatedAt: reviewDate,
        });
      } else if (i < 30) {
        // Speed boat reviews
        const boat = randomFrom(speedBoats);
        reviews.push({
          customerId: customer._id,
          boatId: boat._id,
          boatModel: 'SpeedBoat',
          reviewType: 'SPEED_BOAT',
          rating,
          comment,
          customerName: customer.name,
          isVerified: true,
          isApproved: i < 28, // 2 unapproved
          createdAt: reviewDate,
          updatedAt: reviewDate,
        });
      } else {
        // Party boat reviews
        const boat = randomFrom(partyBoats);
        reviews.push({
          customerId: customer._id,
          boatId: boat._id,
          boatModel: 'PartyBoat',
          reviewType: 'PARTY_BOAT',
          rating,
          comment,
          customerName: customer.name,
          isVerified: true,
          isApproved: i < 38, // 2 unapproved
          createdAt: reviewDate,
          updatedAt: reviewDate,
        });
      }
    }

    await Review.insertMany(reviews, { timestamps: false });
    console.log('✅ Created 40 reviews (6 unapproved for notification testing)');

    // ==================== INQUIRIES ====================
    console.log('Creating inquiries...');

    const inquiryStatuses = ['PENDING', 'PENDING', 'PENDING', 'PENDING', 'QUOTED', 'QUOTED', 'QUOTED', 'ACCEPTED', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'EXPIRED'];
    const inquiries = [];

    for (let i = 0; i < 12; i++) {
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const inquiryDate = daysAgoDate(daysAgo);
      const dateStr = formatDateStr(inquiryDate);

      const customer = randomFrom(customers);
      const boat = randomFrom(partyBoats);
      const status = inquiryStatuses[i];
      const preferredDate = daysFromNowDate(Math.floor(Math.random() * 30) + 7);

      const inquiry = {
        inquiryNumber: `INQ-${dateStr}-${String(i + 1).padStart(3, '0')}`,
        customerId: customer._id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        boatId: boat._id,
        eventType: randomFrom(eventTypes),
        numberOfGuests: boat.capacityMin + Math.floor(Math.random() * 20),
        preferredDate,
        preferredTimeSlot: randomFrom(partyTimeSlots),
        locationType: boat.locationOptions[0],
        specialRequests: i % 3 === 0 ? 'Please arrange for special decoration and cake' : '',
        budget: boat.basePrice + Math.floor(Math.random() * 20000),
        status,
        createdAt: inquiryDate,
        updatedAt: inquiryDate,
      };

      if (['QUOTED', 'ACCEPTED', 'CONVERTED'].includes(status)) {
        inquiry.quotedAmount = boat.basePrice + 10000;
        inquiry.quotedDetails = 'Includes base rental, standard decoration, and DJ services. Catering can be arranged separately.';
        inquiry.quotedAt = new Date(inquiryDate.getTime() + 86400000);
      }

      if (['ACCEPTED', 'REJECTED'].includes(status)) {
        inquiry.respondedAt = new Date(inquiryDate.getTime() + 172800000);
      }

      inquiries.push(inquiry);
    }

    await Inquiry.insertMany(inquiries, { timestamps: false });
    console.log('✅ Created 12 inquiries');

    // ==================== REVENUE SUMMARY ====================
    const sbRevenue = sbBookings.filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED').reduce((sum, b) => sum + b.pricing.finalAmount, 0);
    const pbRevenue = pbBookings.filter((b) => b.status === 'COMPLETED' || b.status === 'CONFIRMED').reduce((sum, b) => sum + b.pricing.finalAmount, 0);
    const totalRevenue = sbRevenue + pbRevenue;

    // ==================== SUMMARY ====================
    console.log('\n🎉 Database seed completed successfully!');
    console.log('');
    console.log('   📊 Summary:');
    console.log('   ─────────────────────────────────');
    console.log('   2 Roles (Admin, Staff)');
    console.log('   1 Admin User');
    console.log('   5 Settings Groups');
    console.log('   6 Speed Boats (with images)');
    console.log('   4 Party Boats (with images)');
    console.log('   45 Operating Calendar Entries');
    console.log('   3 Pricing Rules');
    console.log('   3 Coupons');
    console.log(`   ${customers.length} Customers`);
    console.log('   80 Speed Boat Bookings');
    console.log('   25 Party Boat Bookings');
    console.log('   40 Reviews (6 unapproved)');
    console.log('   12 Inquiries');
    console.log('   ─────────────────────────────────');
    console.log(`   💰 Speed Boat Revenue: ₹${Math.round(sbRevenue).toLocaleString('en-IN')}`);
    console.log(`   💰 Party Boat Revenue: ₹${Math.round(pbRevenue).toLocaleString('en-IN')}`);
    console.log(`   💰 Total Revenue:      ₹${Math.round(totalRevenue).toLocaleString('en-IN')}`);
    console.log('   ─────────────────────────────────');
    console.log('   🔔 Notification Bell: 5 pending bookings + 2 pending party + 6 unapproved reviews = 13');
    console.log('');
    console.log('   Admin Login:');
    console.log('   Email: singhsachin09820@gmail.com');
    console.log('   Password: Test@1234');
    console.log('');
    console.log('   Customer Login (any):');
    console.log('   Email: onlysasi1603@gmail.com (or any seeded email)');
    console.log('   Password: Test@1234');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
