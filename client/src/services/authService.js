import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/users`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error handling
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Auth API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Register a new user
export const register = async (userData) => {
  try {
    const response = await authAPI.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

// Login user
export const login = async (credentials) => {
  try {
    const response = await authAPI.post('/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// Guest login
export const guestLogin = async () => {
  try {
    const response = await authAPI.post('/guest');
    return response.data;
  } catch (error) {
    console.error('Error during guest login:', error);
    throw error;
  }
};

// Verify token
export const verifyToken = async (token) => {
  try {
    const response = await authAPI.get('/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (userId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await authAPI.put(`/${userId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Update user preferences
export const updatePreferences = async (userId, preferences) => {
  try {
    const token = localStorage.getItem('token');
    const response = await authAPI.put(`/${userId}/preferences`, { preferences }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
};