import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:5000/api/auth";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/current-user/`, { 
        withCredentials: true 
      });
      
      const currentUser = response.data.user;
      setUserId(currentUser._id);
      setUserData(currentUser);
      
      // Store in localStorage for persistence
      localStorage.setItem('currentUserId', currentUser._id);
      localStorage.setItem('currentUserData', JSON.stringify(currentUser));
      
    } catch (err) {
      console.error("Error fetching current user:", err);
      setError("Failed to load user data. Please try again.");
      
      // Try to get from localStorage as fallback
      const storedUserId = localStorage.getItem('currentUserId');
      const storedUserData = localStorage.getItem('currentUserData');
      
      if (storedUserId && storedUserData) {
        setUserId(storedUserId);
        setUserData(JSON.parse(storedUserData));
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    await fetchCurrentUser();
  };

  const clearUserData = () => {
    setUserId(null);
    setUserData(null);
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserData');
  };

  useEffect(() => {
    // Check if we have cached user data first
    const storedUserId = localStorage.getItem('currentUserId');
    const storedUserData = localStorage.getItem('currentUserData');
    
    if (storedUserId && storedUserData) {
      setUserId(storedUserId);
      setUserData(JSON.parse(storedUserData));
      setLoading(false);
    } else {
      // Fetch from API if no cached data
      fetchCurrentUser();
    }
  }, []);

  const value = {
    userId,
    userData,
    loading,
    error,
    refreshUserData,
    clearUserData,
    fetchCurrentUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 