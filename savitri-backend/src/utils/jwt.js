// src/utils/jwt.js

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { SESSION } = require('../config/constants');

/**
 * Generate access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret);
  } catch (error) {
    return null;
  }
};

/**
 * Set token cookie
 */
const setTokenCookie = (res, token, isAdmin = false) => {
  const cookieName = isAdmin ? SESSION.ADMIN_COOKIE_NAME : SESSION.COOKIE_NAME;
  
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production' || config.isCodespaces,
    sameSite: config.isCodespaces ? 'none' : 'lax',
    maxAge: SESSION.COOKIE_MAX_AGE,
  });
};

/**
 * Clear token cookie
 */
const clearTokenCookie = (res, isAdmin = false) => {
  const cookieName = isAdmin ? SESSION.ADMIN_COOKIE_NAME : SESSION.COOKIE_NAME;
  
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: config.nodeEnv === 'production' || config.isCodespaces,
    sameSite: config.isCodespaces ? 'none' : 'lax',
  });
};

/**
 * Get token from cookie or header
 */
const getTokenFromRequest = (req, isAdmin = false) => {
  const cookieName = isAdmin ? SESSION.ADMIN_COOKIE_NAME : SESSION.COOKIE_NAME;
  
  // Try to get from cookie first
  if (req.cookies && req.cookies[cookieName]) {
    return req.cookies[cookieName];
  }
  
  // Try to get from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setTokenCookie,
  clearTokenCookie,
  getTokenFromRequest,
};