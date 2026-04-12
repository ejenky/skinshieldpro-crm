import { STAGE_MAP } from '../../utils/constants';

export default function StageBadge({ stage }) {
  const s = STAGE_MAP[stage];
  if (!s) return <span className="stage-badge">{stage}</span>;

  return (
    <span
      className="stage-badge"
      style={{ color: s.color, background: `${s.color}18` }}
    >
      {s.label}
    </span>
  );
}
