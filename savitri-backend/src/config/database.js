const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.databaseUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    if (config.enableLogs) {
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    }

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      if (config.enableLogs) {
        console.log('⚠️  MongoDB disconnected');
      }
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      if (config.enableLogs) {
        console.log('MongoDB connection closed through app termination');
      }
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
