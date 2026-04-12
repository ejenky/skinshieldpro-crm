import { useNavigate } from 'react-router-dom';
import { timeAgo } from '../../utils/formatters';

function ActivityIcon({ type }) {
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

  switch (type) {
    case 'call':
      return (
        <svg {...props}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'email':
      return (
        <svg {...props}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case 'meeting':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'stage_change':
      return (
        <svg {...props}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      );
    default: // note
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
  }
}

const TYPE_COLORS = {
  call: '#3b82f6',
  email: '#8b5cf6',
  meeting: '#f59e0b',
  stage_change: '#22c55e',
  note: '#6b7280',
};

export default function RecentActivity({ activities }) {
  const navigate = useNavigate();

  if (!activities.length) {
    return (
      <div className="recent-activity">
        <h3 className="dashboard-section-title">Recent Activity</h3>
        <p className="recent-activity-empty">No activities yet</p>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      <h3 className="dashboard-section-title">Recent Activity</h3>
      <div className="activity-list">
        {activities.map((a) => {
          const contact = a.expand?.contact;
          const contactName = contact?.name || 'Unknown';
          const color = TYPE_COLORS[a.type] || TYPE_COLORS.note;

          return (
            <button
              key={a.id}
              className="activity-row"
              onClick={() => contact && navigate(`/contacts/${contact.id}`)}
            >
              <span className="activity-icon" style={{ color, background: `${color}20` }}>
                <ActivityIcon type={a.type} />
              </span>
              <div className="activity-body">
                <span className="activity-contact">{contactName}</span>
                {a.note && <span className="activity-note">{a.note}</span>}
              </div>
              <span className="activity-time">{timeAgo(a.created)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
