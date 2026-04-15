import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatPhone } from '../../utils/formatters';

export default function KanbanCard({ contact, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contact.id, data: { contact } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card${isDragging ? ' kanban-card--dragging' : ''}`}
      {...attributes}
      {...listeners}
      onClick={() => {
        // Only open detail on click, not on drag end
        if (!isDragging) onClick(contact);
      }}
    >
      <span className="kanban-card-gym">{contact.gym_name || 'Unnamed'}</span>
      {contact.contact_name && (
        <span className="kanban-card-contact">{contact.contact_name}</span>
      )}
      <div className="kanban-card-meta">
        {contact.city || contact.state ? (
          <span>{[contact.city, contact.state].filter(Boolean).join(', ')}</span>
        ) : null}
        {contact.phone && (
          <a
            className="kanban-card-phone link-tel"
            href={`tel:${contact.phone}`}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {formatPhone(contact.phone)}
          </a>
        )}
        {contact.email && (
          <a
            className="kanban-card-email link-email"
            href={`mailto:${contact.email}`}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {contact.email}
          </a>
        )}
      </div>
    </div>
  );
}
