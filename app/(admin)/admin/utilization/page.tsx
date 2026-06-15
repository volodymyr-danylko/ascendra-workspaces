'use client';
import { useState } from 'react';
import { useFleet } from '@/hooks/useFleet';
import { UtilizationChart } from '@/components/admin/UtilizationChart';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const RANGES = [
  { label: '1h', hours: 1 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
  { label: '30d', hours: 720 },
];

export default function UtilizationPage() {
  const [hours, setHours] = useState(24);
  const { data: fleet, isLoading } = useFleet(hours);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Fleet Utilization</h1>
          <p className="text-sm text-muted-foreground mt-1">Aggregate CPU and memory over time</p>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.hours}
              onClick={() => setHours(r.hours)}
              aria-pressed={hours === r.hours}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors border',
                hours === r.hours
                  ? 'bg-admin-accent/20 text-admin-accent border-admin-accent/30'
                  : 'border-border-subtle text-muted-foreground hover:text-foreground'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="text-sm font-medium text-foreground mb-4">CPU & Memory Utilization</h2>
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : fleet ? (
          <UtilizationChart data={fleet.utilizationTrend} hours={hours} />
        ) : null}
      </div>

      {fleet && (
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <h2 className="text-sm font-medium text-foreground mb-4">VM Distribution (CPU%)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {fleet.vmMetrics.map((m) => (
              <div
                key={m.vmId}
                className={cn(
                  'rounded-lg border p-2.5 text-center',
                  m.cpuPercent > 80
                    ? 'border-status-error/30 bg-red-950/20'
                    : m.cpuPercent < 5
                    ? 'border-status-stopped/30 bg-slate-900/50'
                    : 'border-border-subtle bg-background'
                )}
              >
                <p className="text-xs font-mono font-bold text-foreground">{m.cpuPercent.toFixed(0)}%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{m.vmId}</p>
                <p className={cn('text-[10px] mt-1', m.cpuPercent > 80 ? 'text-status-error' : m.cpuPercent < 5 ? 'text-muted-foreground' : 'text-admin-accent')}>
                  {m.cpuPercent > 80 ? 'hot' : m.cpuPercent < 5 ? 'idle' : 'normal'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
