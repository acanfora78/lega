import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDateIt, cn } from "@/lib/utils";
import type { Articolo } from "@/lib/types";
import { Megaphone, Newspaper, Gavel, CalendarClock } from "lucide-react";

const CATEGORIA_META: Record<Articolo["categoria"], { label: string; icon: typeof Newspaper; variant: "default" | "gold" | "danger" | "outline" }> = {
  articolo: { label: "Articolo", icon: Newspaper, variant: "default" },
  comunicato: { label: "Comunicato", icon: Megaphone, variant: "gold" },
  disciplinare: { label: "Disciplinare", icon: Gavel, variant: "danger" },
  evento: { label: "Evento", icon: CalendarClock, variant: "outline" },
};

export function NewsCard({ articolo, featured = false }: { articolo: Articolo; featured?: boolean }) {
  const meta = CATEGORIA_META[articolo.categoria];
  const Icon = meta.icon;

  return (
    <Link
      href={`/news/${articolo.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl glass card-luxury transition-all duration-300 hover:border-primary-glow/30",
        featured ? "min-h-[280px]" : "min-h-[160px]"
      )}
    >
      <div
        className={cn("relative flex items-end bg-pitch-gradient p-5", featured ? "h-40 sm:h-56" : "h-24")}
      >
        <Badge variant={meta.variant} className="absolute left-4 top-4">
          <Icon className="size-3" />
          {meta.label}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold text-muted-foreground">{formatDateIt(articolo.pubblicatoIl)} · {articolo.autore}</p>
        <h3 className={cn("font-display font-bold leading-snug group-hover:text-primary-glow", featured ? "text-lg sm:text-xl" : "text-sm")}>
          {articolo.titolo}
        </h3>
        {featured && <p className="line-clamp-2 text-sm text-muted-foreground">{articolo.sommario}</p>}
      </div>
    </Link>
  );
}
