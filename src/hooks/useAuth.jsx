import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import pb from '../lib/pocketbase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // PocketBase's LocalAuthStore reads localStorage synchronously in its
  // constructor, so we can seed state from it without waiting on the network.
  const [user, setUser] = useState(() => pb.authStore.record);
  const [token, setToken] = useState(() => pb.authStore.token);
  const [initializing, setInitializing] = useState(() => !pb.authStore.isValid && !!pb.authStore.token);
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    // Keep state in sync with authStore changes (login, logout, refresh).
    const unsubscribe = pb.authStore.onChange((newToken, newRecord) => {
      setToken(newToken);
      setUser(newRecord);
    });
    // authStore is restored synchronously — flip initializing off immediately.
    setInitializing(false);
    return () => unsubscribe();
  }, []);

  const signup = useCallback(async (name, email, password, passwordConfirm) => {
    setLoggingIn(true);
    try {
      await pb.collection('crm_users').create({
        name,
        email,
        password,
        passwordConfirm,
      });
      return await pb.collection('crm_users').authWithPassword(email, password);
    } finally {
      setLoggingIn(false);
    }
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
    signup,
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
