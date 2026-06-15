import { cn, getStatusBgColor } from '@/lib/utils';
import type { VMStatus } from '@/types';

interface Props {
  status: VMStatus;
  className?: string;
}

export function VMStatusBadge({ status, className }: Props) {
  const isTransient = status === 'starting' || status === 'stopping';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium',
        getStatusBgColor(status),
        isTransient && 'animate-pulse',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
