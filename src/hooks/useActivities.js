import { useState, useEffect, useCallback } from 'react';
import pb from '../lib/pocketbase';
import { useAuth } from './useAuth';

export function useActivities(contactId) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isValid, initializing } = useAuth();

  const refresh = useCallback(async () => {
    if (!contactId || initializing || !isValid) return;
    setLoading(true);
    try {
      const result = await pb.collection('activities').getFullList({
        filter: `contact = '${contactId}'`,
        sort: '-created',
      });
      setActivities(result);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  }, [contactId, isValid, initializing]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async (data) => {
    const record = await pb.collection('activities').create({
      ...data,
      contact: contactId,
    });
    await refresh();
    return record;
  }, [contactId, refresh]);

  return { activities, loading, refresh, create };
}
