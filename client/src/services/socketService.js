import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.connectionError = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = {};
    this.SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:9001';
  }

  /**
   * Initialize socket connection
   * @returns {Promise} Promise that resolves when connection is established
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket && this.isConnected) {
          console.log('Socket already connected');
          resolve(this.socket);
          return;
        }

        // Reset connection error
        this.connectionError = null;
        
        // Initialize socket
        this.socket = io(this.SOCKET_URL, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          timeout: 10000,
        });

        // Handle connection events
        this.socket.on('connect', () => {
          console.log('Socket connected:', this.socket.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.connectionError = error;
          this.isConnected = false;
          
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(error);
          }
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.isConnected = false;
        });

      } catch (error) {
        console.error('Failed to initialize socket:', error);
        this.connectionError = error;
        reject(error);
      }
    });
  }

  /**
   * Join a disaster feed
   * @param {string} disasterType - Type of disaster feed to join
   */
  joinDisasterFeed(disasterType) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected');
      this.connect().then(() => {
        this.socket.emit('join-disaster-feed', disasterType);
        console.log(`Joined disaster feed: ${disasterType}`);
      }).catch(err => {
        console.error('Failed to connect socket for disaster feed:', err);
      });
      return;
    }
    
    this.socket.emit('join-disaster-feed', disasterType);
    console.log(`Joined disaster feed: ${disasterType}`);
  }

  /**
   * Leave a disaster feed
   * @param {string} disasterType - Type of disaster feed to leave
   */
  leaveDisasterFeed(disasterType) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected');
      return;
    }
    
    this.socket.emit('leave-disaster-feed', disasterType);
    console.log(`Left disaster feed: ${disasterType}`);
  }

  /**
   * Subscribe to a socket event
   * @param {string} event - Event to subscribe to
   * @param {function} callback - Callback to execute when event is received
   */
  on(event, callback) {
    if (!this.socket) {
      // If socket doesn't exist yet, store listeners to attach later
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      
      // Try to connect and attach listeners
      this.connect().then(() => {
        this.attachStoredListeners();
      }).catch(err => {
        console.error('Failed to connect socket for event listener:', err);
      });
      
      return;
    }
    
    this.socket.on(event, callback);
  }

  /**
   * Attach stored listeners after connection
   */
  attachStoredListeners() {
    if (!this.socket) return;
    
    Object.keys(this.listeners).forEach(event => {
      this.listeners[event].forEach(callback => {
        this.socket.on(event, callback);
      });
    });
  }

  /**
   * Unsubscribe from a socket event
   * @param {string} event - Event to unsubscribe from
   * @param {function} callback - Callback to remove
   */
  off(event, callback) {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Emit an event to the server
   * @param {string} event - Event to emit
   * @param {any} data - Data to send
   */
  emit(event, data) {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot emit:', event);
      return;
    }
    
    this.socket.emit(event, data);
  }

  /**
   * Disconnect the socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if socket is connected
   * @returns {boolean} Connection status
   */
  isSocketConnected() {
    return this.isConnected;
  }

  /**
   * Get connection error if any
   * @returns {Error|null} Connection error
   */
  getConnectionError() {
    return this.connectionError;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService; 