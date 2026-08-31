import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService.js';
import { onUnauthorized } from '../utils/api.js';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    return onUnauthorized(() => {
      setUser(null);
      setIsAuthenticated(false);
    });
  }, []);

  const checkAuth = async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    const data = await authService.login(userData);
    if (data && data.user) {
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data && data.user) {
      setUser(data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('[auth] logout request failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
