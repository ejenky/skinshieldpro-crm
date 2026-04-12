export function Skeleton({ width, height, radius, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius || 'var(--radius-sm)' }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="dashboard">
      <Skeleton width="140px" height="28px" />
      <div className="stat-cards">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="stat-card">
            <Skeleton width="90px" height="14px" />
            <Skeleton width="60px" height="32px" />
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="pipeline-overview">
          <Skeleton width="160px" height="18px" className="sk-mb" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height="56px" radius="var(--radius)" className="sk-mb-sm" />
          ))}
        </div>
        <div className="recent-activity">
          <Skeleton width="140px" height="18px" className="sk-mb" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="sk-activity-row">
              <Skeleton width="32px" height="32px" radius="var(--radius)" />
              <div className="sk-activity-body">
                <Skeleton width="120px" height="14px" />
                <Skeleton width="200px" height="12px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ContactsSkeleton() {
  return (
    <div className="contacts-table-wrap">
      <table className="contacts-table">
        <thead>
          <tr>
            {['Gym Name', 'Contact', 'Phone', 'City / State', 'Type', 'Stage', 'Last Activity'].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }, (_, i) => (
            <tr key={i}>
              <td><Skeleton width="140px" height="14px" /></td>
              <td><Skeleton width="110px" height="14px" /></td>
              <td><Skeleton width="100px" height="14px" /></td>
              <td><Skeleton width="100px" height="14px" /></td>
              <td><Skeleton width="70px" height="14px" /></td>
              <td><Skeleton width="80px" height="22px" radius="12px" /></td>
              <td><Skeleton width="60px" height="14px" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PipelineSkeleton() {
  return (
    <div className="kanban-board">
      {[0, 1, 2, 3, 4].map((col) => (
        <div key={col} className="kanban-column">
          <div className="kanban-column-header">
            <Skeleton width="8px" height="8px" radius="50%" />
            <Skeleton width="80px" height="14px" />
            <Skeleton width="24px" height="18px" radius="10px" className="sk-ml-auto" />
          </div>
          <div className="kanban-column-body">
            {Array.from({ length: col < 2 ? 3 : 2 }, (_, i) => (
              <div key={i} className="kanban-card">
                <Skeleton width="120px" height="14px" />
                <Skeleton width="90px" height="12px" />
                <Skeleton width="80px" height="11px" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
