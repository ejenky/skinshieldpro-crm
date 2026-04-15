import { useState, useEffect, useCallback, useRef } from 'react';
import { useActivities } from '../../hooks/useActivities';
import { STAGES, STAGE_MAP, ACTIVITY_TYPES, GYM_TYPES } from '../../utils/constants';
import { formatPhone, timeAgo } from '../../utils/formatters';
import StageBadge from './StageBadge';
import { useToast } from '../layout/layoutContext';

function normalizeUrl(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function ActivityIcon({ type }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (type) {
    case 'call':
      return <svg {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.33 1.6.59 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.26 1.55.46 2.36.59A2 2 0 0 1 22 16.92z" /></svg>;
    case 'email':
      return <svg {...props}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>;
    case 'meeting':
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'stage_change':
      return <svg {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
    default:
      return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
  }
}

const TYPE_COLORS = {
  call: '#3b82f6', email: '#8b5cf6', meeting: '#f59e0b', stage_change: '#22c55e', note: '#6b7280',
};

export default function ContactDetail({ contact, onClose, onUpdate }) {
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { activities, loading: activitiesLoading, create: createActivity } = useActivities(contact?.id);
  const addToast = useToast();

  // Activity log form
  const [actType, setActType] = useState('note');
  const [actNote, setActNote] = useState('');
  const [actSaving, setActSaving] = useState(false);

  // Auto-save notes
  const [notes, setNotes] = useState('');
  const [notesStatus, setNotesStatus] = useState('idle'); // idle | saving | saved
  const notesTimer = useRef(null);
  const notesInitial = useRef('');

  useEffect(() => {
    if (contact) {
      setForm({
        gym_name: contact.gym_name || '',
        contact_name: contact.contact_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        website: contact.website || '',
        city: contact.city || '',
        state: contact.state || '',
        gym_type: contact.gym_type || '',
        notes: contact.notes || '',
      });
      setNotes(contact.notes || '');
      notesInitial.current = contact.notes || '';
      setNotesStatus('idle');
      setEditing(false);
    }
  }, [contact]);

  const handleNotesChange = useCallback((value) => {
    setNotes(value);
    setNotesStatus('saving');
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      if (!contact) return;
      if (value === notesInitial.current) {
        setNotesStatus('idle');
        return;
      }
      try {
        await onUpdate(contact.id, { notes: value });
        notesInitial.current = value;
        setNotesStatus('saved');
        setTimeout(() => setNotesStatus((s) => (s === 'saved' ? 'idle' : s)), 1500);
      } catch (err) {
        console.error('Failed to save notes:', err);
        addToast('Failed to save notes', 'error');
        setNotesStatus('idle');
      }
    }, 700);
  }, [contact, onUpdate, addToast]);

  useEffect(() => () => {
    if (notesTimer.current) clearTimeout(notesTimer.current);
  }, []);

  const handleFieldChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!contact) return;
    setSaving(true);
    try {
      await onUpdate(contact.id, form);
      setEditing(false);
      addToast('Contact saved');
    } catch (err) {
      console.error('Failed to save contact:', err);
      addToast('Failed to save contact', 'error');
    } finally {
      setSaving(false);
    }
  }, [contact, form, onUpdate, addToast]);

  const handleStageChange = useCallback(async (newStage) => {
    if (!contact || newStage === contact.stage) return;
    const oldLabel = STAGE_MAP[contact.stage]?.label || contact.stage;
    const newLabel = STAGE_MAP[newStage]?.label || newStage;
    try {
      await onUpdate(contact.id, { stage: newStage });
      await createActivity({
        type: 'stage_change',
        note: `Stage changed from ${oldLabel} to ${newLabel}`,
      });
      addToast(`Moved to ${newLabel}`);
    } catch (err) {
      console.error('Failed to change stage:', err);
      addToast('Failed to change stage', 'error');
    }
  }, [contact, onUpdate, createActivity, addToast]);

  const handleLogActivity = useCallback(async (e) => {
    e.preventDefault();
    if (!actNote.trim()) return;
    setActSaving(true);
    try {
      await createActivity({ type: actType, note: actNote.trim() });
      setActNote('');
      setActType('note');
      addToast('Activity logged');
    } catch (err) {
      console.error('Failed to log activity:', err);
      addToast('Failed to log activity', 'error');
    } finally {
      setActSaving(false);
    }
  }, [actType, actNote, createActivity, addToast]);

  if (!contact) return null;

  const websiteUrl = normalizeUrl(contact.website);
  const rating = Number(contact.rating) || 0;
  const reviewCount = Number(contact.review_count) || 0;

  return (
    <>
      <div className="detail-overlay" onClick={onClose} />
      <aside className="detail-panel">
        <div className="detail-header">
          <h3>{contact.gym_name || 'Unnamed Contact'}</h3>
          <button className="detail-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Quick actions */}
        <div className="detail-actions">
          <a
            className={`detail-action${contact.phone ? '' : ' detail-action--disabled'}`}
            href={contact.phone ? `tel:${contact.phone}` : undefined}
            aria-disabled={!contact.phone}
            onClick={(e) => { if (!contact.phone) e.preventDefault(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.33 1.6.59 2.36a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.76.26 1.55.46 2.36.59A2 2 0 0 1 22 16.92z" />
            </svg>
            Call
          </a>
          <a
            className={`detail-action${websiteUrl ? '' : ' detail-action--disabled'}`}
            href={websiteUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!websiteUrl}
            onClick={(e) => { if (!websiteUrl) e.preventDefault(); }}
          >
            <ExternalLinkIcon />
            Visit Website
          </a>
          {contact.email && (
            <a className="detail-action" href={`mailto:${contact.email}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Email
            </a>
          )}
        </div>

        <div className="detail-body">

          {/* Rating */}
          {(rating > 0 || reviewCount > 0) && (
            <div className="detail-section detail-rating-section">
              <StarIcon />
              <span className="detail-rating-value">{rating ? rating.toFixed(1) : '—'}</span>
              {reviewCount > 0 && (
                <span className="detail-rating-count">({reviewCount.toLocaleString()} reviews)</span>
              )}
            </div>
          )}
          {/* Stage selector */}
          <div className="detail-section">
            <label className="detail-label">Stage</label>
            <div className="stage-selector">
              {STAGES.map((s) => (
                <button
                  key={s.value}
                  className={`stage-btn${contact.stage === s.value ? ' stage-btn--active' : ''}`}
                  style={contact.stage === s.value ? { background: `${s.color}20`, color: s.color, borderColor: `${s.color}40` } : {}}
                  onClick={() => handleStageChange(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div className="detail-section">
            <div className="detail-section-head">
              <label className="detail-label">Contact Info</label>
              {!editing ? (
                <button className="detail-edit-btn" onClick={() => setEditing(true)}>Edit</button>
              ) : (
                <div className="detail-edit-actions">
                  <button className="detail-edit-btn" onClick={() => { setEditing(false); setForm({ gym_name: contact.gym_name || '', contact_name: contact.contact_name || '', email: contact.email || '', phone: contact.phone || '', website: contact.website || '', city: contact.city || '', state: contact.state || '', gym_type: contact.gym_type || '', notes: contact.notes || '' }); }}>Cancel</button>
                  <button className="detail-save-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="detail-fields">
                <div className="detail-field">
                  <span className="detail-field-label">Gym Name</span>
                  <input value={form.gym_name} onChange={(e) => handleFieldChange('gym_name', e.target.value)} />
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Contact Name</span>
                  <input value={form.contact_name} onChange={(e) => handleFieldChange('contact_name', e.target.value)} />
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Email</span>
                  <input type="email" value={form.email} onChange={(e) => handleFieldChange('email', e.target.value)} />
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Phone</span>
                  <input value={form.phone} onChange={(e) => handleFieldChange('phone', e.target.value)} />
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Website</span>
                  <input value={form.website} onChange={(e) => handleFieldChange('website', e.target.value)} placeholder="example.com" />
                </div>
                <div className="detail-field-row">
                  <div className="detail-field">
                    <span className="detail-field-label">City</span>
                    <input value={form.city} onChange={(e) => handleFieldChange('city', e.target.value)} />
                  </div>
                  <div className="detail-field">
                    <span className="detail-field-label">State</span>
                    <input value={form.state} onChange={(e) => handleFieldChange('state', e.target.value)} />
                  </div>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Gym Type</span>
                  <select value={form.gym_type} onChange={(e) => handleFieldChange('gym_type', e.target.value)}>
                    <option value="">Select type</option>
                    {GYM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="detail-field">
                  <span className="detail-field-label">Notes</span>
                  <textarea rows={3} value={form.notes} onChange={(e) => handleFieldChange('notes', e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="detail-fields-read">
                <div className="detail-read-row">
                  <span className="detail-field-label">Gym Name</span>
                  <span>{contact.gym_name || '\u2014'}</span>
                </div>
                <div className="detail-read-row">
                  <span className="detail-field-label">Contact</span>
                  <span>{contact.contact_name || '\u2014'}</span>
                </div>
                <div className="detail-read-row">
                  <span className="detail-field-label">Email</span>
                  <span>{contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : '\u2014'}</span>
                </div>
                <div className="detail-read-row">
                  <span className="detail-field-label">Phone</span>
                  <span className="td-mono">{contact.phone ? <a className="link-tel" href={`tel:${contact.phone}`}>{formatPhone(contact.phone)}</a> : '\u2014'}</span>
                </div>
                <div className="detail-read-row">
                  <span className="detail-field-label">Website</span>
                  <span>
                    {websiteUrl ? (
                      <a className="link-website" href={websiteUrl} target="_blank" rel="noopener noreferrer">
                        {contact.website}
                        <ExternalLinkIcon />
                      </a>
                    ) : '\u2014'}
                  </span>
                </div>
                <div className="detail-read-row">
                  <span className="detail-field-label">Location</span>
                  <span>{[contact.city, contact.state].filter(Boolean).join(', ') || '\u2014'}</span>
                </div>
                <div className="detail-read-row">
                  <span className="detail-field-label">Type</span>
                  <span>{GYM_TYPES.find((t) => t.value === contact.gym_type)?.label || contact.gym_type || '\u2014'}</span>
                </div>
                <div className="detail-read-row">
                  <span className="detail-field-label">Source</span>
                  <span>{contact.source ? <span className="detail-source-badge">{contact.source}</span> : '\u2014'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes (auto-save) */}
          <div className="detail-section">
            <div className="detail-section-head">
              <label className="detail-label">Notes</label>
              <span className="detail-autosave-status">
                {notesStatus === 'saving' && 'Saving…'}
                {notesStatus === 'saved' && 'Saved'}
              </span>
            </div>
            <textarea
              className="detail-notes-textarea"
              rows={4}
              placeholder="Add notes about this lead..."
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
            />
          </div>

          {/* Log activity */}
          <div className="detail-section">
            <label className="detail-label">Log Activity</label>
            <form className="log-activity-form" onSubmit={handleLogActivity}>
              <select value={actType} onChange={(e) => setActType(e.target.value)}>
                {ACTIVITY_TYPES.filter((t) => t.value !== 'stage_change').map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <textarea
                placeholder="Add a note..."
                rows={2}
                value={actNote}
                onChange={(e) => setActNote(e.target.value)}
              />
              <button type="submit" disabled={actSaving || !actNote.trim()}>
                {actSaving ? 'Logging...' : 'Log Activity'}
              </button>
            </form>
          </div>

          {/* Activity history */}
          <div className="detail-section">
            <label className="detail-label">Activity History</label>
            {activitiesLoading ? (
              <p className="detail-muted">Loading...</p>
            ) : activities.length === 0 ? (
              <p className="detail-muted">No activities yet</p>
            ) : (
              <div className="detail-activity-list">
                {activities.map((a) => {
                  const color = TYPE_COLORS[a.type] || TYPE_COLORS.note;
                  return (
                    <div key={a.id} className="detail-activity-row">
                      <span className="detail-activity-icon" style={{ color, background: `${color}20` }}>
                        <ActivityIcon type={a.type} />
                      </span>
                      <div className="detail-activity-body">
                        <span className="detail-activity-type">{ACTIVITY_TYPES.find((t) => t.value === a.type)?.label || a.type}</span>
                        {a.note && <span className="detail-activity-note">{a.note}</span>}
                      </div>
                      <span className="detail-activity-time">{timeAgo(a.created)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
