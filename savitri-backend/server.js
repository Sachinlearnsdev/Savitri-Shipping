// Load environment variables
require('dotenv').config();

const app = require('./src/app');
const config = require('./src/config/env');
const prisma = require('./src/config/database');

const PORT = config.port;

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚢 Savitri Shipping Backend API');
  console.log('='.repeat(60));
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🚀 Server running on: ${config.backendUrl}`);
  console.log(`📱 Admin Panel URL: ${config.adminUrl}`);
  console.log(`🌐 Public Website URL: ${config.frontendUrl}`);
  console.log(`📊 Database: ${config.databaseUrl ? '✅ Connected' : '❌ Not configured'}`);
  if (config.isCodespaces) {
    console.log(`☁️  Running in GitHub Codespaces`);
  }
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(1);
  });
});