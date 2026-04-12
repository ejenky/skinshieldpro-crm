import { useState, useCallback, useEffect } from 'react';
import pb from '../lib/pocketbase';
import KanbanBoard from '../components/pipeline/KanbanBoard';
import ContactDetail from '../components/contacts/ContactDetail';
import { STAGE_MAP } from '../utils/constants';
import { PipelineSkeleton } from '../components/Skeleton';
import { useToast } from '../components/layout/layoutContext';
import './PipelinePage.css';

export default function PipelinePage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const addToast = useToast();

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const items = await pb.collection('contacts').getFullList({
        sort: '-updated',
      });
      setContacts(items);
    } catch (err) {
      console.error('Failed to load pipeline contacts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleStageChange = useCallback(async (contact, newStage) => {
    const oldLabel = STAGE_MAP[contact.stage]?.label || contact.stage;
    const newLabel = STAGE_MAP[newStage]?.label || newStage;

    // Optimistic update
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, stage: newStage } : c))
    );

    try {
      await pb.collection('contacts').update(contact.id, { stage: newStage });
      await pb.collection('activities').create({
        contact: contact.id,
        type: 'stage_change',
        note: `Stage changed from ${oldLabel} to ${newLabel}`,
      });
      addToast(`Moved to ${newLabel}`);
    } catch (err) {
      console.error('Failed to update stage:', err);
      addToast('Failed to update stage', 'error');
      // Revert on failure
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? { ...c, stage: contact.stage } : c))
      );
    }
  }, [addToast]);

  const handleCardClick = useCallback((contact) => {
    setSelected(contact);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelected(null);
  }, []);

  const handleUpdate = useCallback(async (id, data) => {
    const record = await pb.collection('contacts').update(id, data);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, ...record } : c))
    );
    if (selected && selected.id === id) {
      setSelected((prev) => ({ ...prev, ...data, ...record }));
    }
    addToast('Contact updated');
    return record;
  }, [selected, addToast]);

  if (loading) {
    return (
      <div className="pipeline-page">
        <h2 className="pipeline-title">Pipeline</h2>
        <PipelineSkeleton />
      </div>
    );
  }

  return (
    <div className="pipeline-page">
      <h2 className="pipeline-title">Pipeline</h2>
      <KanbanBoard
        contacts={contacts}
        onStageChange={handleStageChange}
        onCardClick={handleCardClick}
      />

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
