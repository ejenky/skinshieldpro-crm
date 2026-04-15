import { STAGES } from '../../utils/constants';

export default function StatCards({ total, stageCounts, withPhone = 0 }) {
  const pipeline = STAGES
    .filter((s) => s.value !== 'customer' && s.value !== 'not_interested')
    .reduce((sum, s) => sum + (stageCounts[s.value] || 0), 0);

  const customers = stageCounts['customer'] || 0;
  const rate = total > 0 ? Math.round((customers / total) * 100) : 0;
  const phonePct = total > 0 ? Math.round((withPhone / total) * 100) : 0;

  const cards = [
    { label: 'Total Leads',      value: total,     color: '#6366f1' },
    { label: 'Leads with Phone', value: withPhone, hint: `${phonePct}% of total`, color: '#00d4aa' },
    { label: 'Active Pipeline',  value: pipeline,  color: '#f59e0b' },
    { label: 'Customers',        value: customers, color: '#06b6d4' },
    { label: 'Conversion Rate',  value: `${rate}%`, color: '#10b981' },
  ];

  return (
    <div className="stat-cards">
      {cards.map((c) => (
        <div className="stat-card" key={c.label}>
          <div className="stat-card-accent" style={{ background: c.color }} />
          <span className="stat-card-label">{c.label}</span>
          <span className="stat-card-value">{c.value}</span>
          {c.hint && <span className="stat-card-hint">{c.hint}</span>}
        </div>
      ))}
    </div>
  );
}
