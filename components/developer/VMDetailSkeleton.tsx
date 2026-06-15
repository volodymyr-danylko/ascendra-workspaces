import { Skeleton } from '@/components/ui/skeleton';

export function VMDetailSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-[220px] w-full rounded-xl" />
    </div>
  );
}
