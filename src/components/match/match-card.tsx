import Link from "next/link";
import { TeamCrest } from "@/components/brand/team-crest";
import { LiveBadge } from "@/components/shared/live-badge";
import { Badge } from "@/components/ui/badge";
import { getSquadraById } from "@/lib/data";
import { formatDateIt, formatTimeIt, cn } from "@/lib/utils";
import type { Partita } from "@/lib/types";
import { Star } from "lucide-react";

export function MatchCard({ partita, className }: { partita: Partita; className?: string }) {
  const casa = getSquadraById(partita.squadraCasaId)!;
  const trasferta = getSquadraById(partita.squadraTrasfertaId)!;
  const isLive = partita.stato === "live" || partita.stato === "intervallo";
  const isConclusa = partita.stato === "conclusa";
  const isProgrammata = partita.stato === "programmata";

  return (
    <Link
      href={`/partite/${partita.id}`}
      className={cn(
        "group block rounded-2xl glass p-4 transition-all duration-300 hover:border-primary-glow/30 hover:bg-white/[0.05] active:scale-[0.99]",
        isLive && "border-live/30 shadow-[0_0_0_1px_rgba(239,68,68,0.15),0_8px_30px_-10px_rgba(239,68,68,0.35)]",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          Giornata {partita.giornata} · {formatDateIt(partita.dataOra)}
        </span>
        {isLive ? (
          <LiveBadge minuto={partita.minutoCorrente} />
        ) : isConclusa ? (
          <Badge variant="muted">Conclusa</Badge>
        ) : (
          <Badge variant="outline">{formatTimeIt(partita.dataOra)}</Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2.5">
          <TeamCrest nome={casa.nome} colors={casa.coloriSociali} size={32} />
          <span className="truncate text-sm font-semibold">{casa.nomeBreve}</span>
        </div>

        {isProgrammata ? (
          <span className="font-score shrink-0 text-lg font-bold text-muted-foreground">vs</span>
        ) : (
          <span className="font-score shrink-0 tabular-nums text-2xl font-bold">
            {partita.golCasa}
            <span className="mx-1 text-muted-foreground">–</span>
            {partita.golTrasferta}
          </span>
        )}

        <div className="flex flex-1 items-center justify-end gap-2.5">
          <span className="truncate text-right text-sm font-semibold">{trasferta.nomeBreve}</span>
          <TeamCrest nome={trasferta.nome} colors={trasferta.coloriSociali} size={32} />
        </div>
      </div>

      {partita.partitaDellaSettimana && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2.5 text-xs font-semibold text-gold-bright">
          <Star className="size-3.5 fill-current" />
          Partita della settimana
        </div>
      )}
    </Link>
  );
}
