import { STAGES } from '../../utils/constants';

export default function StatCards({ total, stageCounts }) {
  const pipeline = STAGES
    .filter((s) => s.value !== 'customer')
    .reduce((sum, s) => sum + (stageCounts[s.value] || 0), 0);

  const customers = stageCounts['customer'] || 0;
  const rate = total > 0 ? Math.round((customers / total) * 100) : 0;

  const cards = [
    { label: 'Total Leads',      value: total,     color: '#3b82f6' },
    { label: 'Active Pipeline',  value: pipeline,  color: '#8b5cf6' },
    { label: 'Customers',        value: customers,  color: '#22c55e' },
    { label: 'Conversion Rate',  value: `${rate}%`, color: '#f59e0b' },
  ];

  return (
    <div className="stat-cards">
      {cards.map((c) => (
        <div className="stat-card" key={c.label}>
          <div className="stat-card-indicator" style={{ background: c.color }} />
          <span className="stat-card-label">{c.label}</span>
          <span className="stat-card-value">{c.value}</span>
        </div>
      ))}
    </div>
  );
}
