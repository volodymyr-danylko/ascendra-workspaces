'use client';
import { useFleet } from '@/hooks/useFleet';
import { FleetKPICard } from '@/components/admin/FleetKPICard';
import { OverviewSkeleton } from '@/components/admin/OverviewSkeleton';
import { formatCost } from '@/lib/utils';

export default function OverviewPage() {
  const { data: fleet, isLoading, isError } = useFleet(24);

  if (isLoading) return <OverviewSkeleton />;
  if (isError || !fleet) return <p className="text-sm text-status-error">Failed to load fleet data.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Fleet Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time infrastructure health</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FleetKPICard label="Running VMs" value={fleet.runningVms} sub={`of ${fleet.totalVms} total`} accent />
        <FleetKPICard label="Stopped VMs" value={fleet.stoppedVms} />
        <FleetKPICard label="Total Users" value={fleet.totalUsers} />
        <FleetKPICard label="Cost / hr" value={formatCost(fleet.totalHourlyCost)} sub={`${formatCost(fleet.monthToDateCost)} MTD`} />
        <FleetKPICard label="Avg CPU" value={`${fleet.avgCpuUtilizationPercent}%`} sub={`peak ${fleet.peakCpuUtilizationPercent}%`} />
        <FleetKPICard label="Avg Memory" value={`${fleet.avgMemoryUtilizationPercent}%`} sub={`peak ${fleet.peakMemoryUtilizationPercent}%`} />
        <FleetKPICard label="MTD Cost" value={formatCost(fleet.monthToDateCost)} sub="this month" />
        <FleetKPICard label="Projected" value={formatCost(fleet.projectedMonthlyCost)} sub="end of month" />
      </div>
    </div>
  );
}
