'use client';
import { VMCard } from '@/components/developer/VMCard';
import { useVMs, useVMAction } from '@/hooks/useVMs';
import { Skeleton } from '@/components/ui/skeleton';
import type { VM } from '@/types';

export default function MachinesPage() {
  const { data: vms, isLoading, isError, error } = useVMs();

  if (isLoading) return <MachinesSkeleton />;
  if (isError) return <ErrorState message={(error as Error)?.message} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">My Machines</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {vms?.length ?? 0} machine{vms?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {vms?.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vms?.map((vm) => (
            <VMCardContainer key={vm.id} vm={vm} />
          ))}
        </div>
      )}
    </div>
  );
}

function VMCardContainer({ vm }: { vm: VM }) {
  const { mutate, isPending } = useVMAction(vm.id);
  return <VMCard vm={vm} onAction={(action) => mutate(action)} isActioning={isPending} />;
}

function MachinesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border-subtle bg-surface p-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border-subtle p-12 text-center">
      <p className="text-sm font-medium text-foreground">No machines yet</p>
      <p className="text-xs text-muted-foreground mt-1">Contact your admin to provision a dev machine.</p>
    </div>
  );
}

function ErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-status-error/30 bg-red-950/20 p-6 text-center">
      <p className="text-sm text-status-error">Failed to load machines</p>
      {message && <p className="text-xs text-muted-foreground mt-1">{message}</p>}
    </div>
  );
}
