// src/middleware/adminAuth.js

const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken, getTokenFromRequest } = require('../utils/jwt');
const { USER_STATUS } = require('../config/constants');

/**
 * Admin authentication middleware
 */
const adminAuth = async (req, res, next) => {
  try {
    // Get token from request
    const token = getTokenFromRequest(req, true);
    
    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded || !decoded.adminUserId) {
      throw ApiError.unauthorized('Invalid token');
    }
    
    // Get admin user from database with role
    const adminUser = await prisma.adminUser.findUnique({
      where: { id: decoded.adminUserId },
      include: {
        role: true,
      },
    });
    
    if (!adminUser) {
      throw ApiError.unauthorized('Admin user not found');
    }
    
    // Check if admin is active
    if (adminUser.status !== USER_STATUS.ACTIVE) {
      throw ApiError.forbidden('Account is not active');
    }
    
    // Check if account is locked
    if (adminUser.lockedUntil && new Date() < adminUser.lockedUntil) {
      throw ApiError.forbidden('Account is temporarily locked');
    }
    
    // Attach admin user to request
    req.adminUser = {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      phone: adminUser.phone,
      avatar: adminUser.avatar,
      roleId: adminUser.roleId,
      roleName: adminUser.role.name,
      permissions: adminUser.role.permissions,
    };
    req.adminUserId = adminUser.id;
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = adminAuth;