'use client';
import { useVMs } from '@/hooks/useVMs';
import { useTemplates } from '@/hooks/useTemplates';
import { VMInventoryTable } from '@/components/admin/VMInventoryTable';
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_USERS } from '@/lib/mock-data';

export default function InventoryPage() {
  const { data: vms, isLoading: vmsLoading } = useVMs();
  const { data: templates, isLoading: tplLoading } = useTemplates();

  const isLoading = vmsLoading || tplLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">VM Inventory</h1>
        <p className="text-sm text-muted-foreground mt-1">All machines across the fleet</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : (
        <VMInventoryTable
          vms={vms ?? []}
          users={MOCK_USERS}
          templates={templates ?? []}
        />
      )}
    </div>
  );
}
