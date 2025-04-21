import React, { createContext, useContext, useState, useEffect } from 'react';
import { alertService } from '../services/api';
import socketService from '../services/socketService';

// Create context
const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertConfigs, setAlertConfigs] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial alert configs
  useEffect(() => {
    const fetchAlertConfigs = async () => {
      try {
        setLoading(true);
        const response = await alertService.getAllAlertConfigs();
        if (response.success) {
          setAlertConfigs(response.data);
        } else {
          setError('Failed to fetch alert configurations');
        }
      } catch (err) {
        console.error('Error fetching alert configurations:', err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchAlertConfigs();
  }, []);

  // Connect to socket for real-time alerts
  useEffect(() => {
    // Connect to socket if not already connected
    socketService.connect();

    // Listen for disaster alerts
    socketService.on('disaster-alert', handleNewAlert);

    // Clean up on unmount
    return () => {
      socketService.off('disaster-alert', handleNewAlert);
    };
  }, []);

  // Handle new alert from socket
  const handleNewAlert = (alertData) => {
    // Add to active alerts
    setActiveAlerts((prev) => {
      // Check if this alert already exists (by disaster ID)
      const exists = prev.some(
        (alert) => alert.disasterId === alertData.disasterId
      );

      if (exists) {
        // Update the existing alert
        return prev.map((alert) =>
          alert.disasterId === alertData.disasterId
            ? { ...alertData, received: new Date() }
            : alert
        );
      } else {
        // Add new alert to beginning of array
        return [{ ...alertData, received: new Date() }, ...prev];
      }
    });

    // Optionally trigger sound, browser notification, etc.
    playAlertSound();
    showBrowserNotification(alertData);
  };

  // Play a sound when alert received
  const playAlertSound = () => {
    try {
      const audio = new Audio('/alert-sound.mp3');
      audio.play();
    } catch (err) {
      console.error('Error playing alert sound:', err);
    }
  };

  // Show browser notification if supported
  const showBrowserNotification = (alertData) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('DisasterSense Alert', {
          body: `${alertData.disasterType} detected: ${alertData.description}`,
          icon: '/alert-icon.png',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('DisasterSense Alert', {
              body: `${alertData.disasterType} detected: ${alertData.description}`,
              icon: '/alert-icon.png',
            });
          }
        });
      }
    }
  };

  // Create a new alert configuration
  const createAlertConfig = async (configData) => {
    try {
      setLoading(true);
      const response = await alertService.createAlertConfig(configData);
      if (response.success) {
        setAlertConfigs((prev) => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        setError('Failed to create alert configuration');
        return { success: false, error: 'Failed to create alert configuration' };
      }
    } catch (err) {
      console.error('Error creating alert configuration:', err);
      setError('Error connecting to server');
      return { success: false, error: 'Error connecting to server' };
    } finally {
      setLoading(false);
    }
  };

  // Update an alert configuration
  const updateAlertConfig = async (id, configData) => {
    try {
      setLoading(true);
      const response = await alertService.updateAlertConfig(id, configData);
      if (response.success) {
        setAlertConfigs((prev) =>
          prev.map((config) =>
            config._id === id ? response.data : config
          )
        );
        return { success: true, data: response.data };
      } else {
        setError('Failed to update alert configuration');
        return { success: false, error: 'Failed to update alert configuration' };
      }
    } catch (err) {
      console.error('Error updating alert configuration:', err);
      setError('Error connecting to server');
      return { success: false, error: 'Error connecting to server' };
    } finally {
      setLoading(false);
    }
  };

  // Delete an alert configuration
  const deleteAlertConfig = async (id) => {
    try {
      setLoading(true);
      const response = await alertService.deleteAlertConfig(id);
      if (response.success) {
        setAlertConfigs((prev) => prev.filter((config) => config._id !== id));
        return { success: true };
      } else {
        setError('Failed to delete alert configuration');
        return { success: false, error: 'Failed to delete alert configuration' };
      }
    } catch (err) {
      console.error('Error deleting alert configuration:', err);
      setError('Error connecting to server');
      return { success: false, error: 'Error connecting to server' };
    } finally {
      setLoading(false);
    }
  };

  // Clear an active alert
  const clearAlert = (alertId) => {
    setActiveAlerts((prev) => prev.filter((alert) => alert.disasterId !== alertId));
  };

  // Clear all active alerts
  const clearAllAlerts = () => {
    setActiveAlerts([]);
  };

  return (
    <AlertContext.Provider
      value={{
        alertConfigs,
        activeAlerts,
        loading,
        error,
        createAlertConfig,
        updateAlertConfig,
        deleteAlertConfig,
        clearAlert,
        clearAllAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

// Custom hook to use the alert context
export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

export default AlertContext; 