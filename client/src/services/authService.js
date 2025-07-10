import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/users`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login user
export const loginUser = async (email, password) => {
  const response = await authAPI.post('/login', {
    email,
    password
  });
  return response.data;
};

// Register new user
export const registerUser = async (name, email, password) => {
  const response = await authAPI.post('/register', {
    name,
    email,
    password
  });
  return response.data;
};

// Create guest user
export const createGuestUser = async (name) => {
  const response = await authAPI.post('/guest', {
    name
  });
  return response.data;
};

// Verify token
export const verifyToken = async (token) => {
  const response = await authAPI.get('/verify', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Get user profile
export const getUserProfile = async (userId) => {
  const response = await authAPI.get('/profile', {
    params: { userId }
  });
  return response.data;
};

// Update user profile
export const updateUserProfile = async (userData) => {
  const response = await authAPI.put('/profile', userData);
  return response.data;
};

// Search users
export const searchUsers = async (query, limit = 10) => {
  const response = await authAPI.get('/search', {
    params: { query, limit }
  });
  return response.data;
};

// Delete user account
export const deleteUserAccount = async (userId, password) => {
  const response = await authAPI.delete('/account', {
    data: { userId, password }
  });
  return response.data;
};