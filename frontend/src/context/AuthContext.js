// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, handleApiError } from '../services/api';

// Create context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        // User is not authenticated, that's okay
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (username, password) => {
    setError(null);
    try {
      const data = await authAPI.login(username, password);
      setUser({ id: data.user_id, username: data.username });
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    }
  };

  // Register function
  const register = async (username, password) => {
    setError(null);
    try {
      const data = await authAPI.register(username, password);
      setUser({ id: data.user_id, username: data.username });
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      const errorData = handleApiError(err);
      setError(errorData.message);
      return { success: false, error: errorData.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Clear any auth errors
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};