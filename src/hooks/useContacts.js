import { useState, useEffect, useCallback, useRef } from 'react';
import pb from '../lib/pocketbase';

const PER_PAGE = 30;

export function useContacts({ search = '', stage = '', gymType = '', state = '', hasPhone = false, sort = '-created', page = 1 } = {}) {
  const [contacts, setContacts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef(null);

  const refresh = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
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
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        setContacts(result.items);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load contacts:', err);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [search, stage, gymType, state, hasPhone, sort, page]);

  useEffect(() => {
    refresh();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [refresh]);

  const create = useCallback(async (data) => {
    const record = await pb.collection('contacts').create(data);
    await refresh();
    return record;
  }, [refresh]);

  const update = useCallback(async (id, data) => {
    const record = await pb.collection('contacts').update(id, data);
    await refresh();
    return record;
  }, [refresh]);

  const remove = useCallback(async (id) => {
    await pb.collection('contacts').delete(id);
    await refresh();
  }, [refresh]);

  return { contacts, totalPages, totalItems, loading, refresh, create, update, remove };
}
