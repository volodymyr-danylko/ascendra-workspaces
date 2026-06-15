import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  className?: string;
}

export function FleetKPICard({ label, value, sub, accent, className }: Props) {
  return (
    <div className={cn('rounded-xl border border-border-subtle bg-surface p-4', className)}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-3xl font-bold tabular-nums', accent ? 'text-admin-accent' : 'text-foreground')}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
