import { useStore } from '@/store/useStore';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable';
import { Users, PiggyBank, CreditCard, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { getTotalStats } = useStore();
  const stats = getTotalStats();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your savings and loan management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          variant="primary"
          description="Registered members"
        />
        <StatsCard
          title="Total Savings"
          value={stats.totalSavings}
          icon={PiggyBank}
          variant="secondary"
          prefix="$"
          description="Combined balance"
        />
        <StatsCard
          title="Active Loans"
          value={stats.activeLoans}
          icon={CreditCard}
          variant="primary"
          description="Currently active"
        />
        <StatsCard
          title="Overdue Loans"
          value={stats.overdueLoans}
          icon={AlertTriangle}
          variant="accent"
          description="Requires attention"
        />
      </div>

      {/* Recent Activity */}
      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <RecentActivityTable />
      </div>
    </div>
  );
}
