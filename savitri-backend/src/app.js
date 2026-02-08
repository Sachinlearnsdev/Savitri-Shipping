const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const path = require("path");
const config = require("./config/env");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Trust proxy - IMPORTANT for rate limiting and IP detection
// This is needed when running behind reverse proxies (nginx, GitHub Codespaces, etc.)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS Configuration - Auto-handles Codespaces
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Check against allowed origins
      const allowedOrigins = config.corsOrigins;
      for (const allowed of allowedOrigins) {
        if (allowed instanceof RegExp) {
          if (allowed.test(origin)) {
            return callback(null, true);
          }
        } else if (origin === allowed) {
          return callback(null, true);
        }
      }

      // In development, log blocked origins for debugging
      if (config.nodeEnv === "development" && config.enableLogs) {
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging middleware (controlled by ENABLE_LOGS env variable)
if (config.enableLogs) {
  if (config.nodeEnv === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }
}

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    isCodespaces: config.isCodespaces,
  });
});

// API info endpoint (useful for frontend to discover backend URL)
app.get("/api/info", (req, res) => {
  res.json({
    name: "Savitri Shipping API",
    version: "1.0.0",
    environment: config.nodeEnv,
    urls: {
      backend: config.backendUrl,
      frontend: config.frontendUrl,
      admin: config.adminUrl,
    },
  });
});

// ==================== API ROUTES ====================

// Authentication Routes
app.use("/api/auth/admin", require("./modules/adminAuth/adminAuth.routes"));
app.use("/api/auth", require("./modules/auth/auth.routes"));

// Admin Routes
app.use("/api/admin/users", require("./modules/adminUsers/adminUsers.routes"));
app.use("/api/admin/roles", require("./modules/roles/roles.routes"));
app.use("/api/admin/customers", require("./modules/customers/customers.routes"));
app.use("/api/admin/settings", require("./modules/settings/settings.routes"));
app.use("/api/admin/speed-boats", require("./modules/speedBoats/speedBoats.routes"));
app.use("/api/admin/party-boats", require("./modules/partyBoats/partyBoats.routes"));
app.use("/api/admin/calendar", require("./modules/calendar/calendar.routes"));
app.use("/api/admin/pricing-rules", require("./modules/pricingRules/pricingRules.routes"));
app.use("/api/admin/bookings", require("./modules/bookings/bookings.routes").adminRouter);
app.use("/api/admin/party-bookings", require("./modules/partyBookings/partyBookings.routes"));
app.use("/api/admin/coupons", require("./modules/coupons/coupons.routes"));
app.use("/api/admin/reviews", require("./modules/reviews/reviews.routes").adminRouter);
app.use("/api/admin/notifications", require("./modules/notifications/notifications.routes"));
app.use("/api/admin/marketing", require("./modules/marketing/marketing.routes"));
app.use("/api/admin/analytics", require("./modules/analytics/analytics.routes"));

// Customer Routes
app.use("/api/profile", require("./modules/profile/profile.routes"));

// Public Booking Routes
app.use("/api/bookings", require("./modules/bookings/bookings.routes").publicRouter);

// Public Review Routes
app.use("/api/reviews", require("./modules/reviews/reviews.routes").publicRouter);


// Root / welcome endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Savitri Shipping Backend is running ✅",
    environment: config.nodeEnv,
    urls: {
      backend: config.backendUrl,
      frontend: config.frontendUrl,
      admin: config.adminUrl,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;