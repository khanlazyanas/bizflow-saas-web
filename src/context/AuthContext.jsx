import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// FIX: Cookie backend tak bhejne ke liye ye zaroori hai
axios.defaults.withCredentials = true;
axios.defaults.baseURL = '';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const { data } = await axios.get('/api/auth/me');
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkLoggedInUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.fullName}!`);
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Try again.';
      toast.error(errorMsg);
      throw error;
    }
  };

  const register = async (fullName, businessName, email, password) => {
    try {
      const { data } = await axios.post('/api/auth/register', { fullName, businessName, email, password });
      setUser(data.user);
      toast.success(`Workspace '${businessName}' created!`);
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Try again.';
      toast.error(errorMsg);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
      setUser(null);
      toast.success('Logged out successfully.');
    } catch (error) {
      toast.error('Error logging out.');
    }
  };

  // FIX: Yahan 'setUser' ko add kiya hai taaki Settings page use access kar sake!
  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};