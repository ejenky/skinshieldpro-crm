import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import pb from '../lib/pocketbase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(pb.authStore.record);
  const [token, setToken] = useState(pb.authStore.token);
  const [initializing, setInitializing] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);

  // Subscribe to authStore changes so all consumers stay in sync.
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((newToken, newRecord) => {
      setToken(newToken);
      setUser(newRecord);
    });
    return () => unsubscribe();
  }, []);

  // On mount, verify any token restored from localStorage is still valid.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('crm_users').authRefresh();
        } catch (err) {
          // Token expired or server rejected it — clear so the user is sent to login.
          console.warn('Auth refresh failed, clearing session:', err?.message || err);
          pb.authStore.clear();
        }
      }
      if (!cancelled) setInitializing(false);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    setLoggingIn(true);
    try {
      return await pb.collection('crm_users').authWithPassword(email, password);
    } finally {
      setLoggingIn(false);
    }
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
  }, []);

  const value = {
    user,
    token,
    isValid: !!token && pb.authStore.isValid,
    initializing,
    loading: loggingIn,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
