import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('accounts/user/');
      setUser(response.data);
      setIsAuthenticated(true);
      setIsAdmin(response.data.profile?.role === 'admin');
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('auth/token/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Load user profile
      const userResponse = await api.get('accounts/user/');
      setUser(userResponse.data);
      setIsAuthenticated(true);
      setIsAdmin(userResponse.data.profile?.role === 'admin');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Invalid username or password.',
      };
    }
  };

  const register = async (username, email, password, firstName = '', lastName = '') => {
    try {
      await api.post('accounts/register/', {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data
        ? Object.values(error.response.data).flat().join(' ')
        : 'Registration failed.';
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('accounts/profile/', profileData);
      setUser((prev) => ({
        ...prev,
        profile: response.data,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to update profile.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, login, register, logout, updateProfile, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
