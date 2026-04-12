import { useNavigate } from 'react-router-dom';
import StageBadge from './StageBadge';
import { formatPhone, timeAgo } from '../../utils/formatters';
import { ContactsSkeleton } from '../Skeleton';
import { useLayout } from '../layout/layoutContext';

export default function ContactTable({ contacts, loading, onSelect, selectedId, sort, onSort, hasFilters }) {
  const navigate = useNavigate();
  const layout = useLayout();

  function handleSort(field) {
    if (!onSort) return;
    if (sort === field) onSort(`-${field}`);
    else if (sort === `-${field}`) onSort(field);
    else onSort(`-${field}`);
  }

  function sortIcon(field) {
    if (sort === field) return ' \u2191';
    if (sort === `-${field}`) return ' \u2193';
    return '';
  }

  if (loading && contacts.length === 0) {
    return <ContactsSkeleton />;
  }

  if (!loading && contacts.length === 0) {
    if (hasFilters) {
      return (
        <div className="contacts-empty">
          <p>No contacts match your filters</p>
          <span>Try adjusting your search or filters</span>
        </div>
      );
    }
    return (
      <div className="contacts-empty contacts-empty--cta">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="contacts-empty-icon">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
        <p>No leads yet</p>
        <span>Get started by adding your first lead or importing a CSV file</span>
        <div className="contacts-empty-actions">
          <button className="btn-primary" onClick={() => layout?.openAddLead?.()}>Add Lead</button>
          <button className="btn-secondary" onClick={() => navigate('/import')}>Import CSV</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="contacts-table-wrap">
        <table className="contacts-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('gym_name')}>
                Gym Name{sortIcon('gym_name')}
              </th>
              <th onClick={() => handleSort('contact_name')}>
                Contact{sortIcon('contact_name')}
              </th>
              <th>Phone</th>
              <th onClick={() => handleSort('city')}>
                City / State{sortIcon('city')}
              </th>
              <th onClick={() => handleSort('gym_type')}>
                Type{sortIcon('gym_type')}
              </th>
              <th onClick={() => handleSort('stage')}>
                Stage{sortIcon('stage')}
              </th>
              <th onClick={() => handleSort('updated')}>
                Last Activity{sortIcon('updated')}
              </th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr
                key={c.id}
                className={c.id === selectedId ? 'selected' : ''}
                onClick={() => onSelect(c)}
              >
                <td className="td-primary">{c.gym_name || '\u2014'}</td>
                <td>{c.contact_name || '\u2014'}</td>
                <td className="td-mono">{formatPhone(c.phone)}</td>
                <td>{[c.city, c.state].filter(Boolean).join(', ') || '\u2014'}</td>
                <td>{c.gym_type || '\u2014'}</td>
                <td><StageBadge stage={c.stage} /></td>
                <td className="td-muted">{timeAgo(c.updated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="contacts-cards">
        {contacts.map((c) => (
          <button
            key={c.id}
            className={`contact-card${c.id === selectedId ? ' selected' : ''}`}
            onClick={() => onSelect(c)}
          >
            <div className="contact-card-header">
              <span className="contact-card-name">{c.gym_name || 'Unnamed'}</span>
              <StageBadge stage={c.stage} />
            </div>
            <span className="contact-card-sub">{c.contact_name}</span>
            <div className="contact-card-meta">
              <span>{[c.city, c.state].filter(Boolean).join(', ')}</span>
              <span className="td-muted">{timeAgo(c.updated)}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
