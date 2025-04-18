import axios from 'axios';

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Disaster API endpoints
export const disasterService = {
  // Get all disasters with optional filtering
  getAllDisasters: async (filters = {}) => {
    const response = await api.get('/disasters', { params: filters });
    return response.data;
  },
  
  // Get a single disaster by ID
  getDisasterById: async (id) => {
    const response = await api.get(`/disasters/${id}`);
    return response.data;
  },
  
  // Create a new disaster
  createDisaster: async (disasterData) => {
    const response = await api.post('/disasters', disasterData);
    return response.data;
  },
  
  // Update a disaster
  updateDisaster: async (id, disasterData) => {
    const response = await api.put(`/disasters/${id}`, disasterData);
    return response.data;
  },
  
  // Delete a disaster
  deleteDisaster: async (id) => {
    const response = await api.delete(`/disasters/${id}`);
    return response.data;
  },
  
  // Get disasters near a location
  getDisastersNearby: async (longitude, latitude, radius = 50, unit = 'km') => {
    const response = await api.get('/disasters/nearby', {
      params: { longitude, latitude, radius, unit }
    });
    return response.data;
  },
  
  // Add a sensor reading to a disaster
  addSensorReading: async (disasterId, readingData) => {
    const response = await api.post(`/disasters/${disasterId}/readings`, readingData);
    return response.data;
  }
};

// Alert Config API endpoints
export const alertService = {
  // Get all alert configurations
  getAllAlertConfigs: async (filters = {}) => {
    const response = await api.get('/alerts', { params: filters });
    return response.data;
  },
  
  // Get a single alert config by ID
  getAlertConfigById: async (id) => {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },
  
  // Create a new alert config
  createAlertConfig: async (alertData) => {
    const response = await api.post('/alerts', alertData);
    return response.data;
  },
  
  // Update an alert config
  updateAlertConfig: async (id, alertData) => {
    const response = await api.put(`/alerts/${id}`, alertData);
    return response.data;
  },
  
  // Delete an alert config
  deleteAlertConfig: async (id) => {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  },
  
  // Trigger alerts for a disaster
  triggerAlert: async (disasterId) => {
    const response = await api.post(`/alerts/trigger/${disasterId}`);
    return response.data;
  }
};

// Simulation API endpoints for testing
export const simulationService = {
  // Simulate earthquake data
  simulateEarthquake: async (earthquakeData) => {
    const response = await api.post('/simulate/earthquake', earthquakeData);
    return response.data;
  },
  
  // Simulate flood data
  simulateFlood: async (floodData) => {
    const response = await api.post('/simulate/flood', floodData);
    return response.data;
  },
  
  // Simulate fire data
  simulateFire: async (fireData) => {
    const response = await api.post('/simulate/fire', fireData);
    return response.data;
  }
};

export default api; 