import { cn } from "@/lib/utils";

export function LiveBadge({ minuto, className }: { minuto?: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-live/15 px-2.5 py-1 text-xs font-bold text-live",
        className
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-live" />
        <span className="relative inline-flex size-2 rounded-full bg-live" />
      </span>
      LIVE {minuto !== undefined && `${minuto}'`}
    </span>
  );
}
