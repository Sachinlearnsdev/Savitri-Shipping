import { io } from 'socket.io-client';

let socket = null;

/**
 * Get the backend base URL (without /api suffix)
 * Used for Socket.io connection
 */
const getBackendUrl = () => {
  // Check if explicitly set in env
  if (import.meta.env.VITE_API_URL) {
    // Remove /api suffix if present
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }

  // Auto-detect Codespaces
  const currentHost = window.location.hostname;
  if (currentHost.includes('.app.github.dev')) {
    const backendHost = currentHost.replace(
      /-(\d+)(\.app\.github\.dev)$/,
      '-5000$2'
    );
    return `https://${backendHost}`;
  }

  // Default to localhost
  return 'http://localhost:5000';
};

/**
 * Connect to the admin Socket.io namespace
 * @param {string} token - JWT access token
 * @returns {object} Socket instance
 */
export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  // Disconnect any existing stale socket
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const backendUrl = getBackendUrl();

  socket = io(`${backendUrl}/admin`, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    if (import.meta.env.DEV) {
      console.log('Socket connected to admin namespace');
    }
  });

  socket.on('disconnect', (reason) => {
    if (import.meta.env.DEV) {
      console.log('Socket disconnected:', reason);
    }
  });

  socket.on('connect_error', (err) => {
    if (import.meta.env.DEV) {
      console.log('Socket connection error:', err.message);
    }
  });

  return socket;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Get the current socket instance
 * @returns {object|null} Socket instance or null
 */
export const getSocket = () => socket;
