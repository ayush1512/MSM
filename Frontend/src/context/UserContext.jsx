import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create context - export as named export
export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Check if user is logged in
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/check-login`, { 
        withCredentials: true,
        timeout: 4000
      });
      
      if (response.data.email) {
        setUser(response.data.email);
        await fetchUserInfo(response.data.email);
      } else {
        setUser(null);
        setUserInfo({});
      }
    } catch (error) {
      console.log("Login check failed:", error.message);
      setError('Authentication failed');
      setUser(null);
      setUserInfo({});
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (email) => {
    if (!email) return;
    
    try {
      const response = await axios.get(`${API_URL}/${email}/user_info`, {
        withCredentials: true
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch user information:', error);
      setError('Failed to fetch user information');
    }
  };

  const updateUserInfo = async (data) => {
    if (!user) return { success: false, error: 'Not logged in' };
    
    try {
      const response = await axios.put(
        `${API_URL}/${user}/update_profile`, 
        data,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        await fetchUserInfo(user);
        return { success: true };
      } else {
        return { success: false, error: response.data.error || 'Update failed' };
      }
    } catch (error) {
      console.error('User update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update user information' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${API_URL}/logout`, { withCredentials: true });
      setUser(null);
      setUserInfo({});
      return { success: true };
    } catch (error) {
      console.error("Logout failed:", error);
      return { success: false, error: 'Logout failed' };
    }
  };

  // Value object that will be provided to consumers
  const value = {
    user,
    setUser, // Export setUser so login components can update context
    userInfo,
    loading,
    error,
    checkLoginStatus,
    fetchUserInfo,
    updateUserInfo,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// No default export needed since we're using named exports
