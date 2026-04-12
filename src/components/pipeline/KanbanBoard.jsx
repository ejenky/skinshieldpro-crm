import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import { STAGES, STAGE_MAP } from '../../utils/constants';
import { formatPhone } from '../../utils/formatters';

export default function KanbanBoard({ contacts, onStageChange, onCardClick }) {
  const [activeContact, setActiveContact] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const columns = useMemo(() => {
    const map = {};
    for (const s of STAGES) {
      map[s.value] = [];
    }
    for (const c of contacts) {
      if (map[c.stage]) map[c.stage].push(c);
    }
    return map;
  }, [contacts]);

  const findContainer = useCallback((id) => {
    // If the id is a stage value, return it directly
    if (columns[id]) return id;
    // Otherwise find which column contains this contact id
    for (const [stage, items] of Object.entries(columns)) {
      if (items.some((c) => c.id === id)) return stage;
    }
    return null;
  }, [columns]);

  const handleDragStart = useCallback((event) => {
    const contact = event.active.data.current?.contact;
    if (contact) setActiveContact(contact);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveContact(null);
    if (!over) return;

    const contact = active.data.current?.contact;
    if (!contact) return;

    // Determine the target stage
    let targetStage = over.id;
    // If dropped on a card, find its column
    if (!columns[targetStage]) {
      targetStage = findContainer(over.id);
    }

    if (targetStage && targetStage !== contact.stage) {
      onStageChange(contact, targetStage);
    }
  }, [columns, findContainer, onStageChange]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.value}
            stage={stage}
            contacts={columns[stage.value] || []}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeContact ? (
          <div className="kanban-card kanban-card--overlay">
            <span className="kanban-card-gym">{activeContact.gym_name || 'Unnamed'}</span>
            {activeContact.contact_name && (
              <span className="kanban-card-contact">{activeContact.contact_name}</span>
            )}
            <div className="kanban-card-meta">
              {(activeContact.city || activeContact.state) && (
                <span>{[activeContact.city, activeContact.state].filter(Boolean).join(', ')}</span>
              )}
              {activeContact.phone && (
                <span className="kanban-card-phone">{formatPhone(activeContact.phone)}</span>
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
