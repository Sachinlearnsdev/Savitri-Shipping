// src/middleware/auth.js

const prisma = require('../config/database');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken, getTokenFromRequest } = require('../utils/jwt');
const { USER_STATUS } = require('../config/constants');

/**
 * Customer authentication middleware
 */
const auth = async (req, res, next) => {
  try {
    // Get token from request
    const token = getTokenFromRequest(req, false);
    
    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded || !decoded.customerId) {
      throw ApiError.unauthorized('Invalid token');
    }
    
    // Get customer from database
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        emailVerified: true,
        phoneVerified: true,
        status: true,
      },
    });
    
    if (!customer) {
      throw ApiError.unauthorized('Customer not found');
    }
    
    // Check if customer is active
    if (customer.status !== USER_STATUS.ACTIVE) {
      throw ApiError.forbidden('Account is not active');
    }
    
    // Attach customer to request
    req.customer = customer;
    req.customerId = customer.id;
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;