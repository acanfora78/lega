import { useMemo } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { TeamCrest } from "@/components/brand/team-crest";
import type { Giocatore, Squadra } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Leaderboard({
  items,
  unit,
  secondary,
  squadre,
}: {
  items: { giocatore: Giocatore; value: number | string }[];
  unit: string;
  secondary?: (g: Giocatore) => string;
  squadre: Squadra[];
}) {
  const squadreMap = useMemo(() => new Map(squadre.map((s) => [s.id, s])), [squadre]);

  if (!items.length) {
    return <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">Nessun dato disponibile per questa categoria.</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl glass">
      {items.map(({ giocatore, value }, idx) => {
        const squadra = squadreMap.get(giocatore.squadraId);
        return (
          <Link
            key={giocatore.id}
            href={`/giocatori/${giocatore.id}`}
            className="flex items-center gap-3 border-b border-border/60 p-3.5 last:border-0 hover:bg-white/[0.04]"
          >
            <span
              className={cn(
                "font-score w-7 shrink-0 text-center text-base font-bold",
                idx === 0 && "text-gold-bright",
                idx === 1 && "text-foreground/80",
                idx === 2 && "text-amber-700",
                idx > 2 && "text-muted-foreground"
              )}
            >
              {idx + 1}
            </span>
            <PlayerAvatar nome={giocatore.nome} cognome={giocatore.cognome} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {giocatore.nome} {giocatore.cognome}
              </p>
              {squadra && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} size={13} />
                  {squadra.nomeBreve}
                  {secondary && ` · ${secondary(giocatore)}`}
                </p>
              )}
            </div>
            <span className="font-score shrink-0 text-xl font-bold text-foreground">
              {value}
              <span className="ml-1 text-[10px] font-semibold uppercase text-muted-foreground">{unit}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
