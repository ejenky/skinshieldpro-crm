import { useDashboardStats } from '../hooks/useDashboardStats';
import StatCards from '../components/dashboard/StatCards';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentActivity from '../components/dashboard/RecentActivity';
import { DashboardSkeleton } from '../components/Skeleton';
import './DashboardPage.css';

export default function DashboardPage() {
  const { total, withPhone, stageCounts, recentActivities, loading } = useDashboardStats();

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Dashboard</h2>
      <StatCards total={total} stageCounts={stageCounts} withPhone={withPhone} />
      <div className="dashboard-grid">
        <PipelineOverview total={total} stageCounts={stageCounts} />
        <RecentActivity activities={recentActivities} />
      </div>
    </div>
  );
}
