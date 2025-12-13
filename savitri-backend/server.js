// Load environment variables
require("dotenv").config();
const app = require("./src/app");
const config = require("./src/config/env");
const connectDB = require("./src/config/database");

const PORT = config.port;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    const server = app.listen(PORT, () => {
      console.log("=".repeat(60));
      console.log("🚢 Savitri Shipping Backend API");
      console.log("=".repeat(60));
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🚀 Server running on: ${config.backendUrl}`);
      console.log(`📱 Admin Panel URL: ${config.adminUrl}`);
      console.log(`🌐 Public Website URL: ${config.frontendUrl}`);
      if (config.isCodespaces) {
        console.log(`☁️  Running in GitHub Codespaces`);
      }
      console.log("=".repeat(60));
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("⚠️  SIGTERM received, shutting down gracefully...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("\n⚠️  SIGINT received, shutting down gracefully...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled Promise Rejection:", err);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();