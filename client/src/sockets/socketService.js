import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:9001';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = {};
  }

  // Connect to the socket server
  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected!');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected!');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });

    // Add default event listeners
    this.setupDefaultListeners();
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join a disaster feed channel
  joinDisasterFeed(disasterType = 'ALL') {
    if (!this.socket || !this.connected) {
      console.error('Socket not connected');
      return false;
    }

    this.socket.emit('join-disaster-feed', disasterType);
    console.log(`Joined disaster feed: ${disasterType}`);
    return true;
  }

  // Setup default listeners for disaster events
  setupDefaultListeners() {
    // When a new disaster is detected
    this.socket.on('new-disaster', (disaster) => {
      if (this.listeners['new-disaster']) {
        this.listeners['new-disaster'].forEach((callback) => callback(disaster));
      }
    });

    // When a disaster is updated
    this.socket.on('update-disaster', (disaster) => {
      if (this.listeners['update-disaster']) {
        this.listeners['update-disaster'].forEach((callback) => callback(disaster));
      }
    });

    // When a disaster is deleted
    this.socket.on('delete-disaster', (disasterId) => {
      if (this.listeners['delete-disaster']) {
        this.listeners['delete-disaster'].forEach((callback) => callback(disasterId));
      }
    });

    // When a new sensor reading is added
    this.socket.on('new-reading', (readingData) => {
      if (this.listeners['new-reading']) {
        this.listeners['new-reading'].forEach((callback) => callback(readingData));
      }
    });

    // When an alert is triggered
    this.socket.on('disaster-alert', (alertData) => {
      if (this.listeners['disaster-alert']) {
        this.listeners['disaster-alert'].forEach((callback) => callback(alertData));
      }
    });
  }

  // Add a listener for a specific event
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Remove a listener
  off(event, callback) {
    if (!this.listeners[event]) return;

    const index = this.listeners[event].indexOf(callback);
    if (index !== -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.connected;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 