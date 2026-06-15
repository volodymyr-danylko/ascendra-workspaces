export function MachinesEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border-subtle p-12 text-center">
      <p className="text-sm font-medium text-foreground">No machines yet</p>
      <p className="text-xs text-muted-foreground mt-1">Contact your admin to provision a dev machine.</p>
    </div>
  );
}
