import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('coffeehouse_token'));
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const inactivityTimerRef = useRef(null);

  const logout = useCallback(async (reason = '') => {
    try {
      if (token) {
        await api.logout();
      }
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('coffeehouse_token');
    setToken(null);
    setUser(null);
    setIsAdminOpen(false);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, [token]);

  // Reset inactivity timer on user interaction
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (token) {
      inactivityTimerRef.current = setTimeout(() => {
        console.warn('Session timed out due to 30 minutes of inactivity');
        logout('inactivity');
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [token, logout]);

  // Listen for user activity
  useEffect(() => {
    if (!token) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetInactivityTimer();

    events.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));
    resetInactivityTimer();

    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleActivity));
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [token, resetInactivityTimer]);

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
        logout('expired');
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token, logout]);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    localStorage.setItem('coffeehouse_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setShowLoginModal(false);
    setIsAdminOpen(true);
    resetInactivityTimer();
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
        isAdmin: user?.role === 'admin',
        isManager: user?.role === 'manager' || user?.role === 'admin',
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
