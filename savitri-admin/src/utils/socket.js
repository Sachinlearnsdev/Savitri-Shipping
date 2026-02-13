import { io } from 'socket.io-client';

let socket = null;
let currentToken = null;

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
  if (socket?.connected) {
    // If token changed, reconnect with new token
    if (token !== currentToken) {
      socket.disconnect();
      socket = null;
    } else {
      return socket;
    }
  }

  // Disconnect any existing stale socket
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  const backendUrl = getBackendUrl();

  socket = io(`${backendUrl}/admin`, {
    auth: { token },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 30000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to admin namespace');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
    // If server disconnected us, try to reconnect
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
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
    currentToken = null;
  }
};

/**
 * Get the current socket instance
 * @returns {object|null} Socket instance or null
 */
export const getSocket = () => socket;

/**
 * Check if socket is connected
 * @returns {boolean}
 */
export const isSocketConnected = () => socket?.connected || false;
