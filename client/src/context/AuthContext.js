import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { loginUser, registerUser, createGuestUser, verifyToken } from '../services/authService';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER'
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return;
    }

    try {
      const response = await verifyToken(token);
      if (response.valid) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            token: token
          }
        });
      } else {
        localStorage.removeItem('token');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    clearError();

    try {
      const data = await loginUser(email, password);
      
      localStorage.setItem('token', data.token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.user,
          token: data.token
        }
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [clearError]);

  // Register
  const register = useCallback(async (name, email, password) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    clearError();

    try {
      const data = await registerUser(name, email, password);
      
      localStorage.setItem('token', data.token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.user,
          token: data.token
        }
      });

      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [clearError]);

  // Create guest user
  const loginAsGuest = useCallback(async (name) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    clearError();

    try {
      const data = await createGuestUser(name);
      
      localStorage.setItem('token', data.token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: data.user,
          token: data.token
        }
      });

      toast.success('Welcome, guest user!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create guest user';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [clearError]);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.info('Logged out successfully');
  }, []);

  // Update user
  const updateUser = useCallback((userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  }, []);

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    loginAsGuest,
    logout,
    updateUser,
    clearError,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}