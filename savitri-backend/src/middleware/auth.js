// src/middleware/auth.js
const Customer = require('../models/Customer');
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
    const customer = await Customer.findById(decoded.customerId)
      .select('-password');
    
    if (!customer) {
      throw ApiError.unauthorized('Customer not found');
    }
    
    // Check if customer is active
    if (customer.status !== USER_STATUS.ACTIVE) {
      throw ApiError.forbidden('Account is not active');
    }
    
    // Attach customer to request
    req.customer = {
      id: customer._id.toString(),
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      avatar: customer.avatar,
      emailVerified: customer.emailVerified,
      phoneVerified: customer.phoneVerified,
      status: customer.status,
    };
    req.customerId = customer._id.toString();
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;