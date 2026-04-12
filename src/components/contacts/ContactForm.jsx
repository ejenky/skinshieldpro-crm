import { useState, useCallback } from 'react';
import { STAGES, GYM_TYPES, US_STATES } from '../../utils/constants';

const EMPTY = {
  gym_name: '',
  contact_name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  gym_type: '',
  stage: 'new',
  notes: '',
};

export default function ContactForm({ onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.gym_name.trim() && !form.contact_name.trim()) {
      setError('Gym name or contact name is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create contact');
    } finally {
      setSaving(false);
    }
  }, [form, onSubmit, onClose]);

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal">
        <div className="modal-header">
          <h3>Add New Lead</h3>
          <button className="detail-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Gym Name</label>
            <input autoFocus value={form.gym_name} onChange={(e) => set('gym_name', e.target.value)} />
          </div>

          <div className="form-field">
            <label>Contact Name</label>
            <input value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="5551234567" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>City</label>
              <input value={form.city} onChange={(e) => set('city', e.target.value)} />
            </div>
            <div className="form-field">
              <label>State</label>
              <select value={form.state} onChange={(e) => set('state', e.target.value)}>
                <option value="">Select</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Gym Type</label>
              <select value={form.gym_type} onChange={(e) => set('gym_type', e.target.value)}>
                <option value="">Select type</option>
                {GYM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Stage</label>
              <select value={form.stage} onChange={(e) => set('stage', e.target.value)}>
                {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
