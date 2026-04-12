import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useContacts } from '../hooks/useContacts';
import ContactTable from '../components/contacts/ContactTable';
import ContactDetail from '../components/contacts/ContactDetail';
import { STAGES, GYM_TYPES, US_STATES } from '../utils/constants';
import './ContactsPage.css';

export default function ContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [stateFilter, setStateFilter] = useState(searchParams.get('state') || '');
  const [sort, setSort] = useState('-created');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { contacts, totalPages, totalItems, loading, update } = useContacts({
    search: debouncedSearch,
    stage: stageFilter,
    gymType: typeFilter,
    state: stateFilter,
    sort,
    page,
  });

  const handleSelect = useCallback((contact) => {
    setSelected(contact);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelected(null);
  }, []);

  const handleUpdate = useCallback(async (id, data) => {
    const updated = await update(id, data);
    // Refresh the selected contact with latest data
    if (selected && selected.id === id) {
      setSelected((prev) => ({ ...prev, ...data, ...updated }));
    }
    return updated;
  }, [update, selected]);

  const handleFilterChange = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });

    if (key === 'stage') setStageFilter(value);
    else if (key === 'type') setTypeFilter(value);
    else if (key === 'state') setStateFilter(value);
    setPage(1);
  }, [searchParams, setSearchParams]);

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <h2 className="contacts-title">
          Contacts
          {!loading && <span className="contacts-count">{totalItems}</span>}
        </h2>
      </div>

      {/* Filters bar */}
      <div className="contacts-filters">
        <div className="contacts-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search gym, contact, city, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <select value={stageFilter} onChange={(e) => handleFilterChange('stage', e.target.value)}>
          <option value="">All Stages</option>
          {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <select value={typeFilter} onChange={(e) => handleFilterChange('type', e.target.value)}>
          <option value="">All Types</option>
          {GYM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select value={stateFilter} onChange={(e) => handleFilterChange('state', e.target.value)}>
          <option value="">All States</option>
          {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <ContactTable
        contacts={contacts}
        loading={loading}
        onSelect={handleSelect}
        selectedId={selected?.id}
        sort={sort}
        onSort={setSort}
        hasFilters={!!(debouncedSearch || stageFilter || typeFilter || stateFilter)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="contacts-pagination">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="pagination-info">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      {/* Slide-over detail */}
      {selected && (
        <ContactDetail
          contact={selected}
          onClose={handleCloseDetail}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
