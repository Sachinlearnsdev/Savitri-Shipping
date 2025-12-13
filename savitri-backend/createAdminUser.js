/**
 * createAdminUser.js
 * Run with: node createAdminUser.js
 */

require('dotenv').config();

const connectDB = require('./src/config/database');
const { AdminUser, Role } = require('./src/models');

async function run() {
  try {
    // 1. Connect DB
    await connectDB();
    console.log('✅ Database connected');

    // ==== CONFIG (CHANGE ONLY THIS PART IF NEEDED) ====
    const ADMIN = {
      email: 'singhsachin09820@gmail.com',
      passwordHash: '$2a$12$kgMH.K1nxO2P7Z.MU3XgYea.DCccLp.ifZu1rCq2ny2Q.1TiUfMQq',
      name: 'Super Administrator',
      phone: '9876543210',
      roleName: 'Super Admin',
    };
    // ==================================================

    // 2. Ensure role exists
    let role = await Role.findOne({ name: ADMIN.roleName });

    if (!role) {
      role = await Role.create({
        name: ADMIN.roleName,
        slug: 'super-admin',
        permissions: {
          adminUsers: ['create', 'read', 'update', 'delete'],
          roles: ['create', 'read', 'update', 'delete'],
          customers: ['read', 'update'],
          settings: ['read', 'update'],
        },
      });
      console.log('✅ Role created:', role._id.toString());
    } else {
      console.log('ℹ️ Role exists:', role._id.toString());
    }

    // 3. Create or update admin user
    const existingUser = await AdminUser.findOne({ email: ADMIN.email });

    if (existingUser) {
      await AdminUser.findByIdAndUpdate(existingUser._id, {
        password: ADMIN.passwordHash,
        name: ADMIN.name,
        phone: ADMIN.phone,
        roleId: role._id,
        status: 'ACTIVE',
        failedAttempts: 0,
        lockedUntil: null,
      });

      console.log('✅ Admin user UPDATED:', existingUser._id.toString());
    } else {
      const adminUser = await AdminUser.create({
        email: ADMIN.email,
        password: ADMIN.passwordHash,
        name: ADMIN.name,
        phone: ADMIN.phone,
        avatar: null,
        roleId: role._id,
        status: 'ACTIVE',
        failedAttempts: 0,
        lockedUntil: null,
        lastLogin: null,
      });

      console.log('✅ Admin user CREATED:', adminUser._id.toString());
    }

    console.log('🎉 Done');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
}

run();
