import { useState, useCallback } from 'react';
import pb from '../lib/pocketbase';
import { useAuth } from '../hooks/useAuth';
import { CONTACT_FIELDS } from '../utils/csvParser';
import { useToast } from '../components/layout/layoutContext';
import './SettingsPage.css';

export default function SettingsPage() {
  const { user } = useAuth();

  // Password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  // Export
  const [exporting, setExporting] = useState(false);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState({ type: '', text: '' });

  const addToast = useToast();

  const handleChangePassword = useCallback(async (e) => {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });

    if (newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPwSaving(true);
    try {
      await pb.collection('crm_users').update(user.id, {
        oldPassword,
        password: newPassword,
        passwordConfirm: confirmPassword,
      });
      // Re-auth with new password
      await pb.collection('crm_users').authWithPassword(user.email, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwMsg({ type: 'success', text: 'Password updated successfully' });
      addToast('Password updated');
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Failed to update password' });
      addToast('Failed to update password', 'error');
    } finally {
      setPwSaving(false);
    }
  }, [oldPassword, newPassword, confirmPassword, user, addToast]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const contacts = await pb.collection('contacts').getFullList({ sort: '-created' });

      const fields = [...CONTACT_FIELDS, 'stage', 'source', 'notes', 'created', 'updated'];
      const header = fields.join(',');
      const rows = contacts.map((c) =>
        fields.map((f) => {
          const val = c[f] ?? '';
          const str = String(val);
          // Escape fields containing commas, quotes, or newlines
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      );

      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Contacts exported successfully');
    } catch (err) {
      console.error('Export failed:', err);
      addToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  }, [addToast]);

  const handleDeleteAll = useCallback(async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    setDeleteMsg({ type: '', text: '' });
    try {
      const contacts = await pb.collection('contacts').getFullList({ fields: 'id' });
      // Also delete associated activities
      const activities = await pb.collection('activities').getFullList({ fields: 'id' });

      for (const a of activities) {
        await pb.collection('activities').delete(a.id);
      }
      for (const c of contacts) {
        await pb.collection('contacts').delete(c.id);
      }

      setDeleteConfirm('');
      setDeleteMsg({ type: 'success', text: `Deleted ${contacts.length} contacts and ${activities.length} activities` });
      addToast(`Deleted ${contacts.length} contacts`);
    } catch (err) {
      setDeleteMsg({ type: 'error', text: err.message || 'Failed to delete contacts' });
      addToast('Failed to delete contacts', 'error');
    } finally {
      setDeleting(false);
    }
  }, [deleteConfirm, addToast]);

  return (
    <div className="settings-page">
      <h2 className="settings-title">Settings</h2>

      {/* Profile */}
      <section className="settings-section">
        <h3 className="settings-section-title">Profile</h3>
        <div className="settings-profile">
          <div className="settings-avatar">
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="settings-profile-info">
            <span className="settings-profile-name">{user?.name || 'No name set'}</span>
            <span className="settings-profile-email">{user?.email}</span>
          </div>
        </div>
      </section>

      {/* Change password */}
      <section className="settings-section">
        <h3 className="settings-section-title">Change Password</h3>
        {pwMsg.text && (
          <div className={`settings-msg settings-msg--${pwMsg.type}`}>{pwMsg.text}</div>
        )}
        <form className="settings-pw-form" onSubmit={handleChangePassword}>
          <div className="settings-field">
            <label>Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="settings-field">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="settings-field">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={pwSaving}>
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>

      {/* Export */}
      <section className="settings-section">
        <h3 className="settings-section-title">Export Data</h3>
        <p className="settings-desc">Download all contacts as a CSV file.</p>
        <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {exporting ? 'Exporting...' : 'Export All Contacts'}
        </button>
      </section>

      {/* Danger zone */}
      <section className="settings-section settings-danger">
        <h3 className="settings-section-title settings-danger-title">Danger Zone</h3>
        <p className="settings-desc">
          Permanently delete all contacts and their activities. This action cannot be undone.
        </p>
        {deleteMsg.text && (
          <div className={`settings-msg settings-msg--${deleteMsg.type}`}>{deleteMsg.text}</div>
        )}
        <div className="settings-danger-row">
          <div className="settings-field settings-danger-input">
            <label>Type <strong>DELETE</strong> to confirm</label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <button
            className="btn-danger"
            onClick={handleDeleteAll}
            disabled={deleteConfirm !== 'DELETE' || deleting}
          >
            {deleting ? 'Deleting...' : 'Delete All Contacts'}
          </button>
        </div>
      </section>
    </div>
  );
}
