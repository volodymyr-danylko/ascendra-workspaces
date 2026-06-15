'use client';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useVM, useVMMetrics, useVMAction } from '@/hooks/useVMs';
import { useTemplates } from '@/hooks/useTemplates';
import { VMStatusBadge } from '@/components/developer/VMStatusBadge';
import { ResourceBar } from '@/components/developer/ResourceBar';
import { VMMetricsChart } from '@/components/developer/VMMetricsChart';
import { Skeleton } from '@/components/ui/skeleton';
import { formatUptime, formatCost } from '@/lib/utils';

export default function VMDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: vm, isLoading: vmLoading } = useVM(id);
  const { data: metrics, isLoading: metricsLoading } = useVMMetrics(id, 24);
  const { data: templates } = useTemplates();
  const { mutate, isPending } = useVMAction(id);

  const template = templates?.find((t) => t.id === vm?.templateId);

  if (vmLoading) return <DetailSkeleton />;
  if (!vm) return <p className="text-sm text-muted-foreground">VM not found.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/developer/machines" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">{vm.name}</h1>
        <VMStatusBadge status={vm.status} />
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        {[
          { label: 'Template', value: template?.name ?? vm.templateId },
          { label: 'Region', value: vm.region },
          { label: 'Uptime', value: formatUptime(vm.startedAt) },
          { label: 'Cost/hr', value: formatCost(vm.hourlyCost) },
          { label: 'vCPU', value: template ? `${template.vCpu} cores` : '—' },
          { label: 'Memory', value: template ? `${template.memoryGb} GB` : '—' },
          { label: 'Disk', value: template ? `${template.diskSizeGb} GB` : '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium text-foreground mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {vm.status === 'running' && (
        <div className="rounded-xl border border-border-subtle bg-surface p-4 space-y-3">
          <h2 className="text-sm font-medium text-foreground">Current Usage</h2>
          <ResourceBar value={vm.cpuUsagePercent} label="CPU" />
          <ResourceBar value={vm.memoryUsagePercent} label="Memory" />
          <ResourceBar value={vm.diskUsagePercent} label="Disk" />
        </div>
      )}

      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <h2 className="text-sm font-medium text-foreground mb-4">CPU & Memory — last 24h</h2>
        {metricsLoading ? (
          <Skeleton className="h-[220px] w-full" />
        ) : metrics ? (
          <VMMetricsChart data={metrics} />
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {vm.status === 'running' && (
          <a
            href={`https://vscode-server.${vm.id}.ascendra.dev`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-dev-accent bg-dev-accent/10 px-4 py-2 text-sm text-dev-accent hover:bg-dev-accent/20 transition-colors"
          >
            <ExternalLink size={13} /> Open in IDE
          </a>
        )}
        {vm.status === 'stopped' && (
          <button
            onClick={() => mutate('start')}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-4 py-2 text-sm text-foreground hover:border-dev-accent transition-colors disabled:opacity-40"
          >
            Start
          </button>
        )}
        {vm.status === 'running' && (
          <>
            <button onClick={() => mutate('stop')} disabled={isPending} className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">Stop</button>
            <button onClick={() => mutate('restart')} disabled={isPending} className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">Restart</button>
          </>
        )}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-[220px] w-full rounded-xl" />
    </div>
  );
}
