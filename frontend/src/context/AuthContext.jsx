import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set auth token header globally in Axios
  const setAxiosHeader = (jwtToken) => {
    if (jwtToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Load user session on boot
  useEffect(() => {
    const savedUser = localStorage.getItem('oasis_user');
    const savedToken = localStorage.getItem('oasis_token');

    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setToken(savedToken);
      setAxiosHeader(savedToken);
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/login', { email, password });
      const { data } = response.data;

      setUser(data);
      setToken(data.token);
      setAxiosHeader(data.token);

      localStorage.setItem('oasis_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        year: data.year,
        profileImage: data.profileImage
      }));
      localStorage.setItem('oasis_token', data.token);

      return { success: true, user: data };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    }
  };

  // Admin Login handler
  const adminLogin = async (email, password) => {
    try {
      const response = await axios.post('/api/admin/login', { email, password });
      const { data } = response.data;

      setUser(data);
      setToken(data.token);
      setAxiosHeader(data.token);

      localStorage.setItem('oasis_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        profileImage: data.profileImage || ''
      }));
      localStorage.setItem('oasis_token', data.token);

      return { success: true, user: data };
    } catch (error) {
      const msg = error.response?.data?.message || 'Admin login failed. Please check credentials.';
      return { success: false, message: msg };
    }
  };

  // Registration handler
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/register', userData);
      const { data } = response.data;

      setUser(data);
      setToken(data.token);
      setAxiosHeader(data.token);

      localStorage.setItem('oasis_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        department: data.department,
        year: data.year,
        profileImage: data.profileImage
      }));
      localStorage.setItem('oasis_token', data.token);

      return { success: true, user: data };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = () => {
    console.log('AuthContext: Logging out user, resetting state and local storage');
    setUser(null);
    setToken(null);
    setAxiosHeader(null);
    localStorage.removeItem('oasis_user');
    localStorage.removeItem('oasis_token');
  };

  // Update profile handler
  const updateProfileState = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('oasis_user', JSON.stringify({
      _id: updatedData._id,
      name: updatedData.name,
      email: updatedData.email,
      role: updatedData.role,
      department: updatedData.department,
      year: updatedData.year,
      profileImage: updatedData.profileImage
    }));

    if (updatedData.token) {
      setToken(updatedData.token);
      setAxiosHeader(updatedData.token);
      localStorage.setItem('oasis_token', updatedData.token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        adminLogin,
        register,
        logout,
        updateProfileState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
