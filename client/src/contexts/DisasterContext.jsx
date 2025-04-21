import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { disasterService } from '../services/api';
import socketService from '../services/socketService';

// Create context
const DisasterContext = createContext();

export const DisasterProvider = ({ children }) => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    type: '',
    severity: '',
    status: '',
  });

  // Load initial disasters data
  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        setLoading(true);
        const response = await disasterService.getAllDisasters(activeFilters);
        if (response.success) {
          setDisasters(response.data);
        } else {
          setError('Failed to fetch disasters');
        }
      } catch (err) {
        console.error('Error fetching disasters:', err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchDisasters();
  }, [activeFilters]);

  // Handler functions defined with useCallback to prevent recreating them on every render
  const handleNewDisaster = useCallback((newDisaster) => {
    // Check if we should add this disaster based on active filters
    const shouldAdd = checkAgainstFilters(newDisaster);
    
    if (shouldAdd) {
      setDisasters(prevDisasters => [newDisaster, ...prevDisasters]);
    }
  }, []);

  const handleDisasterUpdate = useCallback((updatedDisaster) => {
    setDisasters(prevDisasters => 
      prevDisasters.map(disaster => 
        disaster._id === updatedDisaster._id ? updatedDisaster : disaster
      )
    );
  }, []);

  const handleDisasterDelete = useCallback((disasterId) => {
    setDisasters(prevDisasters => 
      prevDisasters.filter(disaster => disaster._id !== disasterId)
    );
  }, []);

  // Connect to socket for real-time updates
  useEffect(() => {
    // Initialize socket connection
    const initializeSocket = async () => {
      try {
        // Connect to socket
        await socketService.connect();
        setSocketConnected(true);
        
        // Join the ALL disasters feed
        socketService.joinDisasterFeed('ALL');
        
        // Set up event listeners
        socketService.on('new-disaster', handleNewDisaster);
        socketService.on('update-disaster', handleDisasterUpdate);
        socketService.on('delete-disaster', handleDisasterDelete);
        
        console.log('Disaster socket connection established');
      } catch (error) {
        console.error('Failed to connect to disaster socket:', error);
        setSocketConnected(false);
      }
    };
    
    initializeSocket();
    
    // Clean up on unmount
    return () => {
      socketService.off('new-disaster', handleNewDisaster);
      socketService.off('update-disaster', handleDisasterUpdate);
      socketService.off('delete-disaster', handleDisasterDelete);
    };
  }, [handleNewDisaster, handleDisasterUpdate, handleDisasterDelete]);

  // Check if a disaster matches the current filters
  const checkAgainstFilters = (disaster) => {
    if (activeFilters.type && disaster.type !== activeFilters.type) {
      return false;
    }
    
    if (activeFilters.severity && disaster.severity < parseInt(activeFilters.severity)) {
      return false;
    }
    
    if (activeFilters.status && disaster.status !== activeFilters.status) {
      return false;
    }
    
    return true;
  };

  // Filter disasters
  const filterDisasters = (filters) => {
    setActiveFilters(prevFilters => ({
      ...prevFilters,
      ...filters
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setActiveFilters({
      type: '',
      severity: '',
      status: '',
    });
  };

  // Get disasters by type
  const getDisastersByType = (type) => {
    return disasters.filter(disaster => disaster.type === type);
  };

  // Get total disaster count by type
  const getDisasterCountByType = () => {
    const counts = {
      EARTHQUAKE: 0,
      FLOOD: 0,
      FIRE: 0,
      STORM: 0,
      OTHER: 0,
      TOTAL: 0,
    };

    disasters.forEach(disaster => {
      counts[disaster.type]++;
      counts.TOTAL++;
    });

    return counts;
  };

  // Get nearby disasters
  const getNearbyDisasters = async (longitude, latitude, radius) => {
    try {
      setLoading(true);
      const response = await disasterService.getDisastersNearby(longitude, latitude, radius);
      return response.data;
    } catch (err) {
      console.error('Error fetching nearby disasters:', err);
      setError('Error fetching nearby disasters');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return (
    <DisasterContext.Provider 
      value={{
        disasters,
        loading,
        error,
        socketConnected,
        activeFilters,
        filterDisasters,
        resetFilters,
        getDisastersByType,
        getDisasterCountByType,
        getNearbyDisasters,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

// Custom hook to use the disaster context
export const useDisasters = () => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisasters must be used within a DisasterProvider');
  }
  return context;
};

export default DisasterContext; 