import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:5000';
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token validity
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Try new API service first
      const response = await authApi.getProfile();
      setUser(response.data.user || response.data);
    } catch (apiError) {
      console.warn('Primary API failed, falling back to direct URL', apiError);
      try {
        // Fallback to direct axios call
        const fallbackResponse = await axios.get('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUser(fallbackResponse.data.user || fallbackResponse.data);
      } catch (error) {
        console.error('Error checking auth status:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      let response;
      try {
        // Try new API service first
        response = await authApi.login(email, password);
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        // Fallback to direct axios call
        response = await axios.post('/api/auth/login', { email, password });
      }
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      let response;
      try {
        // Try new API service first
        response = await authApi.signup(name, email, password);
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        // Fallback to direct axios call
        response = await axios.post('/api/auth/signup', { name, email, password });
      }
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
