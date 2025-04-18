import React, { createContext, useContext, useState, useEffect } from 'react';
import { disasterService } from '../services/api';
import socketService from '../sockets/socketService';

// Create context
const DisasterContext = createContext();

export const DisasterProvider = ({ children }) => {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Connect to socket for real-time updates
  useEffect(() => {
    // Connect to socket
    socketService.connect();

    // Join the ALL disasters feed
    socketService.joinDisasterFeed('ALL');

    // Listen for new disasters
    socketService.on('new-disaster', handleNewDisaster);

    // Listen for disaster updates
    socketService.on('update-disaster', handleDisasterUpdate);

    // Listen for disaster deletions
    socketService.on('delete-disaster', handleDisasterDelete);

    // Clean up on unmount
    return () => {
      socketService.off('new-disaster', handleNewDisaster);
      socketService.off('update-disaster', handleDisasterUpdate);
      socketService.off('delete-disaster', handleDisasterDelete);
    };
  }, [disasters]);

  // Handle new disaster from socket
  const handleNewDisaster = (newDisaster) => {
    // Check if we should add this disaster based on active filters
    const shouldAdd = checkAgainstFilters(newDisaster);
    
    if (shouldAdd) {
      setDisasters(prevDisasters => [newDisaster, ...prevDisasters]);
    }
  };

  // Handle disaster update from socket
  const handleDisasterUpdate = (updatedDisaster) => {
    setDisasters(prevDisasters => 
      prevDisasters.map(disaster => 
        disaster._id === updatedDisaster._id ? updatedDisaster : disaster
      )
    );
  };

  // Handle disaster deletion from socket
  const handleDisasterDelete = (disasterId) => {
    setDisasters(prevDisasters => 
      prevDisasters.filter(disaster => disaster._id !== disasterId)
    );
  };

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