import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({ onMenuToggle, onAddLead }) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      navigate(`/contacts?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/contacts');
    }
  }, [search, navigate]);

  return (
    <header className="topbar">
      <button className="topbar-menu" onClick={onMenuToggle} aria-label="Toggle menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <form className="topbar-search" onSubmit={handleSubmit}>
        <svg className="topbar-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <button className="topbar-add" onClick={onAddLead}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Add Lead</span>
      </button>
    </header>
  );
}
