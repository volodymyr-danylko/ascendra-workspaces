'use client';
import { VMCard } from '@/components/developer/VMCard';
import { MachinesSkeleton } from '@/components/developer/MachinesSkeleton';
import { MachinesEmptyState } from '@/components/developer/MachinesEmptyState';
import { MachinesErrorState } from '@/components/developer/MachinesErrorState';
import { useVMs, useVMAction } from '@/hooks/useVMs';
import type { VM } from '@/types';

export default function MachinesPage() {
  const { data: vms, isLoading, isError, error } = useVMs();

  if (isLoading) return <MachinesSkeleton />;
  if (isError) return <MachinesErrorState message={(error as Error)?.message} />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">My Machines</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {vms?.length ?? 0} machine{vms?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {vms?.length === 0 ? (
        <MachinesEmptyState />
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
