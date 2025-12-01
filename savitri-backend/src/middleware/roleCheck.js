// src/middleware/roleCheck.js

const ApiError = require('../utils/ApiError');

/**
 * Check if admin has permission for a specific module and action
 * @param {string} module - The module name (e.g., 'adminUsers', 'bookings')
 * @param {string} action - The action name (e.g., 'view', 'create', 'edit', 'delete')
 */
const roleCheck = (module, action) => {
  return (req, res, next) => {
    try {
      // Check if admin user is attached to request
      if (!req.adminUser) {
        throw ApiError.unauthorized('Authentication required');
      }
      
      const permissions = req.adminUser.permissions;
      
      // Check if permissions exist for the module
      if (!permissions || !permissions[module]) {
        throw ApiError.forbidden('Access denied: No permissions for this module');
      }
      
      // Check if the specific action is allowed
      if (!permissions[module][action]) {
        throw ApiError.forbidden(`Access denied: Cannot ${action} ${module}`);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if admin has any of the specified roles
 * @param {string[]} allowedRoles - Array of role names
 */
const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.adminUser) {
        throw ApiError.unauthorized('Authentication required');
      }
      
      if (!allowedRoles.includes(req.adminUser.roleName)) {
        throw ApiError.forbidden('Access denied: Insufficient role privileges');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if admin is Super Admin
 */
const isSuperAdmin = (req, res, next) => {
  try {
    if (!req.adminUser) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    if (req.adminUser.roleName !== 'Super Admin') {
      throw ApiError.forbidden('Access denied: Super Admin only');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  roleCheck,
  hasRole,
  isSuperAdmin,
};