import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('coffeehouse_token'));
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.verifyAuth();
        setUser(data.user);
      } catch (err) {
        console.warn('Session expired or invalid, logging out');
        logout();
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('coffeehouse_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setShowLoginModal(false);
    setIsAdminOpen(true);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('coffeehouse_token');
    setToken(null);
    setUser(null);
    setIsAdminOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        showLoginModal,
        setShowLoginModal,
        isAdminOpen,
        setIsAdminOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
