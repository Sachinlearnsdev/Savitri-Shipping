// src/utils/socket.js

let io = null;

/**
 * Initialize Socket.io with the HTTP server
 * @param {object} server - HTTP server instance
 * @returns {object} Socket.io server instance
 */
const initSocket = (server) => {
  const { Server } = require('socket.io');
  const config = require('../config/env');

  io = new Server(server, {
    cors: {
      origin: config.corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Admin namespace
  const adminNsp = io.of('/admin');

  // Authentication middleware - verify admin JWT token
  adminNsp.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const { verifyAccessToken } = require('./jwt');
      const decoded = verifyAccessToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }
      socket.adminId = decoded.adminUserId || decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  adminNsp.on('connection', (socket) => {
    if (config.enableLogs) {
      console.log(`Socket: Admin connected: ${socket.adminId}`);
    }
    socket.join('admin-room');

    socket.on('disconnect', () => {
      if (config.enableLogs) {
        console.log(`Socket: Admin disconnected: ${socket.adminId}`);
      }
    });
  });

  return io;
};

/**
 * Get the Socket.io instance
 * @returns {object} Socket.io server instance
 * @throws {Error} If Socket.io is not initialized
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit an event to all connected admin users
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
const emitToAdmins = (event, data) => {
  try {
    const socketIO = getIO();
    socketIO.of('/admin').to('admin-room').emit(event, data);
  } catch (err) {
    // Socket not initialized yet, silently ignore
    // This can happen during seed scripts or early startup
  }
};

module.exports = { initSocket, getIO, emitToAdmins };
