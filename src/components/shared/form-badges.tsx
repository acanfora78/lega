import { cn } from "@/lib/utils";

export function FormBadges({ risultati, size = "sm" }: { risultati: ("V" | "N" | "P")[]; size?: "sm" | "md" }) {
  if (!risultati.length) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-1">
      {risultati.map((r, i) => (
        <span
          key={i}
          className={cn(
            "flex items-center justify-center rounded-full font-bold text-white",
            size === "sm" ? "size-5 text-[10px]" : "size-6 text-xs",
            r === "V" && "bg-primary",
            r === "N" && "bg-amber-500",
            r === "P" && "bg-danger"
          )}
        >
          {r}
        </span>
      ))}
    </div>
  );
}
