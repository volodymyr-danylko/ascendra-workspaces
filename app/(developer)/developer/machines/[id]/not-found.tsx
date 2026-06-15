import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function VMNotFound() {
  return (
    <div className="max-w-3xl">
      <div className="rounded-xl border border-border-subtle bg-surface p-12 text-center">
        <p className="text-sm font-medium text-foreground">Machine not found</p>
        <p className="text-xs text-muted-foreground mt-1">
          This VM may have been deleted or the ID is invalid.
        </p>
        <Link
          href="/developer/machines"
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-dev-accent hover:underline"
        >
          <ArrowLeft size={12} /> Back to My Machines
        </Link>
      </div>
    </div>
  );
}
