import { useState, useEffect, useCallback } from 'react';
import pb from '../lib/pocketbase';

export function useAuth() {
  const [user, setUser] = useState(pb.authStore.record);
  const [token, setToken] = useState(pb.authStore.token);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((newToken, newRecord) => {
      setToken(newToken);
      setUser(newRecord);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const authData = await pb.collection('crm_users').authWithPassword(email, password);
      return authData;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
  }, []);

  const isValid = pb.authStore.isValid;

  return { user, token, isValid, loading, login, logout };
}
