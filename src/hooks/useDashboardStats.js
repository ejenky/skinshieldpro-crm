import { useState, useEffect, useCallback } from 'react';
import pb from '../lib/pocketbase';
import { STAGES } from '../utils/constants';
import { useAuth } from './useAuth';

export function useDashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    withPhone: 0,
    stageCounts: {},
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isValid, initializing } = useAuth();

  useEffect(() => {
    if (initializing || !isValid) return;

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const contacts = await pb.collection('contacts').getFullList({
          fields: 'id,stage,phone',
        });

        const total = contacts.length;
        let withPhone = 0;
        const stageCounts = {};
        for (const s of STAGES) stageCounts[s.value] = 0;
        for (const c of contacts) {
          if (stageCounts[c.stage] !== undefined) stageCounts[c.stage]++;
          if (c.phone && String(c.phone).trim()) withPhone++;
        }

        const activitiesResult = await pb.collection('activities').getList(1, 20, {
          sort: '-created',
          expand: 'contact',
        });

        if (!mounted) return;
        setStats({
          total,
          withPhone,
          stageCounts,
          recentActivities: activitiesResult.items,
        });
      } catch (err) {
        if (!mounted) return;
        if (!err?.isAbort) {
          console.error('Failed to load dashboard stats:', err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [isValid, initializing, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return { ...stats, loading, refresh };
}
