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
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  
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

  const login = async (email, password, token = null) => {
    try {
      let userData;
      
      if (token) {
        // If token is provided, use it directly
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user data using the token
        const response = await axios.get('/api/auth/me');
        userData = response.data.user || response.data;
        setUser(userData);
        return { success: true };
      } else {
        // Regular email/password login
        let response;
        try {
          // Try new API service first
          response = await authApi.login(email, password);
        } catch (apiError) {
          console.warn('Primary API failed, falling back to direct URL', apiError);
          // Fallback to direct axios call
          response = await axios.post('/api/auth/login', { email, password });
        }
        
        const { token: authToken, user } = response.data;
        
        // Check if user is verified
        if (user && !user.is_verified) {
          return { 
            success: false, 
            redirectTo: '/verify-otp?email=' + encodeURIComponent(email),
            message: 'Please verify your email with the OTP sent to your email.'
          };
        }
        
        localStorage.setItem('token', authToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        setUser(user);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clear invalid token if present
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
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
        response = await authApi.register({ name, email, password });
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        // Fallback to direct axios call
        response = await axios.post('/api/auth/signup', { name, email, password });
      }
      
      // For email verification, we don't log the user in automatically
      // Just return success with the message from the server
      return { 
        success: true, 
        message: response.data.message || 'Registration successful! Please check your email to verify your account.'
      };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const resendVerificationEmail = async (email) => {
    try {
      await axios.post('/api/auth/resend-verification', { email });
      return { success: true, message: 'Verification email resent. Please check your inbox.' };
    } catch (error) {
      console.error('Error resending verification email:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to resend verification email. Please try again.' 
      };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      console.log('Verifying OTP for:', email);
      const response = await axios.post('/api/auth/verify-otp', {
        email,
        otp
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('OTP verification response:', response.data);

      if (response.data.token) {
        // Save token and update auth state
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        
        return { 
          success: true, 
          message: 'Email verified successfully',
          user
        };
      }
      
      return { 
        success: false, 
        message: response.data?.message || 'OTP verification failed. Please try again.' 
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during OTP verification. Please try again.' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    resendVerificationEmail,
    verifyOtp
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
