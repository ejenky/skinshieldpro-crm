import { useState, useEffect, useCallback } from 'react';
import pb from '../lib/pocketbase';
import { useAuth } from './useAuth';

const PER_PAGE = 30;

export function useContacts({ search = '', stage = '', gymType = '', state = '', hasPhone = false, sort = '-created', page = 1 } = {}) {
  const [contacts, setContacts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isValid, initializing } = useAuth();

  useEffect(() => {
    if (initializing || !isValid) return;

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const filters = [];
        if (search) {
          const q = search.replace(/'/g, "\\'");
          filters.push(
            `(gym_name ~ '${q}' || contact_name ~ '${q}' || city ~ '${q}' || state ~ '${q}' || phone ~ '${q}' || email ~ '${q}')`
          );
        }
        if (stage) filters.push(`stage = '${stage}'`);
        if (gymType) filters.push(`gym_type = '${gymType}'`);
        if (state) filters.push(`state = '${state}'`);
        if (hasPhone) filters.push(`phone != ""`);

        const result = await pb.collection('contacts').getList(page, PER_PAGE, {
          sort,
          filter: filters.join(' && ') || undefined,
        });
        if (!mounted) return;
        setContacts(result.items);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
      } catch (err) {
        if (!mounted) return;
        if (!err?.isAbort) {
          console.error('Failed to load contacts:', err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [search, stage, gymType, state, hasPhone, sort, page, isValid, initializing, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const create = useCallback(async (data) => {
    const record = await pb.collection('contacts').create(data);
    refresh();
    return record;
  }, [refresh]);

  const update = useCallback(async (id, data) => {
    const record = await pb.collection('contacts').update(id, data);
    refresh();
    return record;
  }, [refresh]);

  const remove = useCallback(async (id) => {
    await pb.collection('contacts').delete(id);
    refresh();
  }, [refresh]);

  return { contacts, totalPages, totalItems, loading, refresh, create, update, remove };
}
