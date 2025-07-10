import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login, register, guestLogin, verifyToken } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await verifyToken(token);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const loginUser = async (email, password) => {
    try {
      setLoading(true);
      const data = await login({ email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const registerUser = async (name, email, password) => {
    try {
      setLoading(true);
      const data = await register({ name, email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Guest login function
  const loginAsGuest = async (name = 'Guest User') => {
    try {
      setLoading(true);
      const data = await guestLogin({ name });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Guest login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Guest login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update user preferences
  const updateUserPreferences = (preferences) => {
    setUser(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...preferences
      }
    }));
  };

  const value = {
    user,
    loading,
    loginUser,
    registerUser,
    loginAsGuest,
    logout,
    checkAuth,
    updateUserPreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}