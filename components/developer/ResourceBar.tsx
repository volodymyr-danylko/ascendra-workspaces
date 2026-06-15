import { cn } from '@/lib/utils';

interface Props {
  value: number;
  label: string;
  className?: string;
}

export function ResourceBar({ value, label, className }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const barColor =
    clamped > 90 ? 'bg-status-error' : clamped > 80 ? 'bg-amber-400' : 'bg-dev-accent';

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border">
        <div
          className={cn('h-1.5 rounded-full transition-all', barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
