import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (response.data.token) {
      // Store auth data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new Event('storage'));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Login user
export const loginUser = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    
    if (response.data.token) {
      // Store auth data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new Event('storage'));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Logout user
export const logoutUser = () => {
  // Clear auth data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  
  // Trigger storage event for other tabs
  window.dispatchEvent(new Event('storage'));
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    // If token is invalid, log out
    if (error.response?.status === 401) {
      logoutUser();
    }
    throw error.response?.data || error.message;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true' && 
         localStorage.getItem('token') !== null;
};

// Verify token is valid
export const verifyToken = async () => {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    logoutUser();
    return false;
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  verifyToken,
}; 