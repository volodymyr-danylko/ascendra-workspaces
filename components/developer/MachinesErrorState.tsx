export function MachinesErrorState({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-status-error/30 bg-red-950/20 p-6 text-center">
      <p className="text-sm text-status-error">Failed to load machines</p>
      {message && <p className="text-xs text-muted-foreground mt-1">{message}</p>}
    </div>
  );
}
