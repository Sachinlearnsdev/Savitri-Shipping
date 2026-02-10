// src/middleware/roleCheck.js

const ApiError = require("../utils/ApiError");

/**
 * Check if user is any authenticated admin
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

/**
 * Permission-based role checking middleware.
 * Checks the admin user's role permissions matrix for the given resource + action.
 * Admin role always has full access (bypasses checks).
 *
 * @param {string} resource - e.g. 'bookings', 'speedBoats', 'reviews'
 * @param {string} action - e.g. 'view', 'create', 'edit', 'delete'
 * @returns {Function} Express middleware
 */
const roleCheck = (resource, action) => {
  return (req, res, next) => {
    try {
      if (!req.adminUser) {
        throw ApiError.unauthorized("Authentication required");
      }

      // Admin role has full access
      if (req.adminUser.roleName === "Admin") {
        return next();
      }

      // Check the permission matrix from the populated role
      const permissions = req.adminUser.permissions;

      if (
        !permissions ||
        !permissions[resource] ||
        !permissions[resource][action]
      ) {
        throw ApiError.forbidden(
          `You do not have permission to ${action} ${resource}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has one of the allowed roles
 * @param {string[]} allowedRoles - Array of role names
 * @returns {Function} Express middleware
 */
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.adminUser) {
        throw ApiError.unauthorized("Authentication required");
      }

      if (!allowedRoles.includes(req.adminUser.roleName)) {
        throw ApiError.forbidden(
          `One of these roles is required: ${allowedRoles.join(", ")}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireAdmin,
  requireAdminRole,
  roleCheck,
  hasRole,
  isSuperAdmin: requireAdminRole,
};
