// src/middleware/roleCheck.js
// PHASE 1: Simplified role checking (no complex permission system)

const ApiError = require("../utils/ApiError");

/**
 * Check if user is any authenticated admin
 * Use this for most admin routes
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.adminUser) {
      throw ApiError.unauthorized("Authentication required");
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has Admin role specifically
 * Use this for admin management routes (creating/editing admin users, roles)
 */
const requireAdminRole = (req, res, next) => {
  try {
    if (!req.adminUser) {
      throw ApiError.unauthorized("Authentication required");
    }

    if (req.adminUser.roleName !== "Admin") {
      throw ApiError.forbidden("Admin role required for this action");
    }

    next();
  } catch (error) {
    next(error);
  }
};

// PHASE 2: Complex permission-based checking will be added here

module.exports = {
  requireAdmin,
  requireAdminRole,
  // Legacy exports for backward compatibility (can be removed if not used)
  roleCheck: requireAdmin, // Maps old roleCheck to requireAdmin
  hasRole: (allowedRoles) => requireAdmin, // Simplified - just check if admin
  isSuperAdmin: requireAdminRole, // Maps to requireAdminRole
};
