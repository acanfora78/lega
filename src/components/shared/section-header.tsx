import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  href,
  hrefLabel = "Vedi tutto",
  className,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-3", className)}>
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">{eyebrow}</p>
        )}
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="ring-focus flex shrink-0 items-center gap-0.5 rounded-full py-1 text-sm font-semibold text-primary-glow hover:text-gold-bright"
        >
          {hrefLabel}
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
