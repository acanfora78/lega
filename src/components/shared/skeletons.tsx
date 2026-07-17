import { Skeleton } from "@/components/ui/skeleton";

export function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl glass p-4">
      <Skeleton className="mb-3 h-4 w-32" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-6 w-10" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ n = 6 }: { n?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}
