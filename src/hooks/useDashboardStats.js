import { useState, useEffect, useCallback } from 'react';
import pb from '../lib/pocketbase';
import { STAGES } from '../utils/constants';

export function useDashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    stageCounts: {},
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all contacts (just id + stage) to compute counts client-side.
      // PocketBase doesn't support GROUP BY, so we pull the minimal field set.
      const contacts = await pb.collection('contacts').getFullList({
        fields: 'id,stage',
      });

      const total = contacts.length;
      const stageCounts = {};
      for (const s of STAGES) {
        stageCounts[s.value] = 0;
      }
      for (const c of contacts) {
        if (stageCounts[c.stage] !== undefined) {
          stageCounts[c.stage]++;
        }
      }

      // Recent activities with expanded contact relation
      const activitiesResult = await pb.collection('activities').getList(1, 20, {
        sort: '-created',
        expand: 'contact',
      });

      setStats({
        total,
        stageCounts,
        recentActivities: activitiesResult.items,
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...stats, loading, refresh };
}
