import { useNavigate } from 'react-router-dom';
import { STAGES } from '../../utils/constants';

export default function PipelineOverview({ total, stageCounts }) {
  const navigate = useNavigate();
  const maxCount = Math.max(1, ...Object.values(stageCounts));

  return (
    <div className="pipeline-overview">
      <h3 className="dashboard-section-title">Pipeline Overview</h3>
      <div className="pipeline-stages">
        {STAGES.map((stage) => {
          const count = stageCounts[stage.value] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const barWidth = Math.round((count / maxCount) * 100);

          return (
            <button
              key={stage.value}
              className="pipeline-stage-card"
              onClick={() => navigate(`/contacts?stage=${stage.value}`)}
            >
              <div className="pipeline-stage-header">
                <span
                  className="pipeline-stage-dot"
                  style={{ background: stage.color }}
                />
                <span className="pipeline-stage-label">{stage.label}</span>
                <span className="pipeline-stage-count">{count}</span>
              </div>
              <div className="pipeline-stage-bar-track">
                <div
                  className="pipeline-stage-bar-fill"
                  style={{ width: `${barWidth}%`, background: stage.color }}
                />
              </div>
              <span className="pipeline-stage-pct">{pct}% of total</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
