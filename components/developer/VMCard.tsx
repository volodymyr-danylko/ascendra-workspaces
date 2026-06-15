import Link from 'next/link';
import { Play, Square, RotateCcw, ExternalLink } from 'lucide-react';
import { VMStatusBadge } from './VMStatusBadge';
import { ResourceBar } from './ResourceBar';
import { formatUptime, cn } from '@/lib/utils';
import type { VM } from '@/types';

interface Props {
  vm: VM;
  onAction: (action: 'start' | 'stop' | 'restart') => void;
  isActioning: boolean;
}

export function VMCard({ vm, onAction, isActioning }: Props) {
  const isRunning = vm.status === 'running';
  const isStopped = vm.status === 'stopped';
  const isTransient = vm.status === 'starting' || vm.status === 'stopping';

  return (
    <div className={cn(
      'relative rounded-xl border bg-surface p-4 transition-colors group/card cursor-pointer',
      'hover:border-dev-accent/50 hover:bg-surface-raised',
      isTransient && 'border-amber-800/50',
    )}>
      {/* Overlay link at z-1 — above non-interactive content (z-0), below buttons (z-2) */}
      <Link
        href={`/developer/machines/${vm.id}`}
        className="absolute inset-0 rounded-xl z-[1]"
        aria-label={`View details for ${vm.name}`}
      />

      {/* Non-interactive header at z-0 — clicks fall through to the link overlay */}
      <div className="relative z-0 flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground group-hover/card:text-dev-accent transition-colors truncate">
            {vm.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {vm.region} · Uptime {formatUptime(vm.startedAt)}
          </p>
        </div>
        <VMStatusBadge status={vm.status} />
      </div>

      {isRunning && (
        <div className="relative z-0 space-y-2 mb-4">
          <ResourceBar value={vm.cpuUsagePercent} label="CPU" />
          <ResourceBar value={vm.memoryUsagePercent} label="MEM" />
          <ResourceBar value={vm.diskUsagePercent} label="DISK" />
        </div>
      )}

      {/* Interactive buttons at z-2 — above the link overlay */}
      <div className="relative z-[2] flex items-center gap-2">
        {isRunning && (
          <a
            href={`https://vscode-server.${vm.id}.ascendra.dev`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${vm.name} in IDE (opens in new tab)`}
            className="inline-flex items-center gap-1.5 rounded-md border border-dev-accent bg-dev-accent/10 px-3 py-1.5 text-xs font-medium text-dev-accent hover:bg-dev-accent/20 transition-colors"
          >
            <ExternalLink size={11} /> Open in IDE
          </a>
        )}
        {isStopped && (
          <ActionBtn onClick={() => onAction('start')} disabled={isActioning} aria-label="Start">
            <Play size={11} /> Start
          </ActionBtn>
        )}
        {isRunning && (
          <>
            <ActionBtn onClick={() => onAction('stop')} disabled={isActioning} aria-label="Stop">
              <Square size={11} /> Stop
            </ActionBtn>
            <ActionBtn onClick={() => onAction('restart')} disabled={isActioning} aria-label="Restart">
              <RotateCcw size={11} /> Restart
            </ActionBtn>
          </>
        )}
        {isActioning && (
          <div className="ml-auto h-3.5 w-3.5 animate-spin rounded-full border-2 border-dev-accent border-t-transparent" />
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  children, onClick, disabled, 'aria-label': label,
}: {
  children: React.ReactNode; onClick: () => void; disabled: boolean; 'aria-label': string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-raised px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
    >
      {children}
    </button>
  );
}
