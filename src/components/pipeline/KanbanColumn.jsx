import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ stage, contacts, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });
  const ids = contacts.map((c) => c.id);

  return (
    <div className={`kanban-column${isOver ? ' kanban-column--over' : ''}`}>
      <div className="kanban-column-header">
        <span className="kanban-column-dot" style={{ background: stage.color }} />
        <span className="kanban-column-label">{stage.label}</span>
        <span className="kanban-column-count">{contacts.length}</span>
      </div>
      <div className="kanban-column-body" ref={setNodeRef}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {contacts.map((c) => (
            <KanbanCard key={c.id} contact={c} onClick={onCardClick} />
          ))}
        </SortableContext>
        {contacts.length === 0 && (
          <div className="kanban-column-empty">
            No leads in this stage
            <span className="kanban-column-empty-hint">Drag a card here to move it</span>
          </div>
        )}
      </div>
    </div>
  );
}
