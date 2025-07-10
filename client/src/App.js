import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import DocumentEditor from './components/Editor/DocumentEditor';
import Header from './components/Layout/Header';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Services
import { verifyToken } from './services/authService';

// Themes
const lightTheme = {
  colors: {
    primary: '#4A90E2',
    primaryHover: '#357ABD',
    secondary: '#F5F5F5',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3'
  },
  fonts: {
    primary: 'Inter, sans-serif'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: '8px',
  shadows: {
    light: '0 2px 4px rgba(0,0,0,0.1)',
    medium: '0 4px 8px rgba(0,0,0,0.15)',
    heavy: '0 8px 16px rgba(0,0,0,0.2)'
  }
};

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#1E1E1E',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#404040',
    secondary: '#404040'
  }
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${props => props.theme.fonts.primary};
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea {
    font-family: inherit;
    border: none;
    outline: none;
  }

  .ql-toolbar {
    border: 1px solid ${props => props.theme.colors.border} !important;
    border-bottom: none !important;
    background: ${props => props.theme.colors.surface} !important;
  }

  .ql-container {
    border: 1px solid ${props => props.theme.colors.border} !important;
    background: ${props => props.theme.colors.background} !important;
    color: ${props => props.theme.colors.text} !important;
  }

  .ql-editor {
    font-size: 16px;
    line-height: 1.6;
    color: ${props => props.theme.colors.text} !important;
  }

  .ql-editor.ql-blank::before {
    color: ${props => props.theme.colors.textSecondary} !important;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemeProvider theme={lightTheme}>
        <GlobalStyle />
        <LoadingSpinner fullscreen text="Checking authentication..." />
      </ThemeProvider>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemeProvider theme={lightTheme}>
        <GlobalStyle />
        <LoadingSpinner fullscreen text="Loading..." />
      </ThemeProvider>
    );
  }

  return !user ? children : <Navigate to="/dashboard" />;
}

function AppContent() {
  const { user, loading, checkAuth } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user?.preferences?.theme === 'dark') {
      setCurrentTheme(darkTheme);
    } else {
      setCurrentTheme(lightTheme);
    }
  }, [user?.preferences?.theme]);

  if (loading) {
    return (
      <ThemeProvider theme={lightTheme}>
        <GlobalStyle />
        <LoadingSpinner fullscreen text="Loading..." />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <SocketProvider>
        <AppContainer>
          {user && <Header />}
          <MainContent>
            <Routes>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/document/:id" 
                element={
                  <ProtectedRoute>
                    <DocumentEditor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/" 
                element={<Navigate to={user ? "/dashboard" : "/login"} />} 
              />
            </Routes>
          </MainContent>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={user?.preferences?.theme || 'light'}
          />
        </AppContainer>
      </SocketProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;