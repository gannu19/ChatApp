import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, fetchMe, updateProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.token) {
      // Validate current session
      fetchMe()
        .then((res) => {
          setUser((prev) => ({ ...prev, ...res.data }));
        })
        .catch(() => {
          logout();
        });
    }
  }, []);

  const login = async (loginId, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser({ loginId, password });
      setUser(res.data);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(userData);
      setUser(res.data);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const res = await updateProfile(profileData);
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem('userInfo', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Profile update failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setError,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
