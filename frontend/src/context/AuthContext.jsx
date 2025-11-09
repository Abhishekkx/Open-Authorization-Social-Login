import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      setUser(null);
      // Don't set error for unauthenticated state
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      window.location.href = '/login';
    } catch (err) {
      setError('Logout failed');
    }
  };

  const loginWithGoogle = (returnTo) => {
    authAPI.initiateGoogleLogin(returnTo);
  };

  const loginWithFacebook = (returnTo) => {
    authAPI.initiateFacebookLogin(returnTo);
  };

  const value = {
    user,
    loading,
    error,
    logout,
    loginWithGoogle,
    loginWithFacebook,
    refreshUser: checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
