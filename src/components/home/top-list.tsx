import Link from "next/link";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { TeamCrest } from "@/components/brand/team-crest";
import { getSquadraById } from "@/lib/data";
import type { Giocatore } from "@/lib/types";
import { cn } from "@/lib/utils";

export async function TopList({
  items,
  unit,
}: {
  items: { giocatore: Giocatore; value: number }[];
  unit: string;
}) {
  const squadre = await Promise.all(items.map(({ giocatore }) => getSquadraById(giocatore.squadraId)));
  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map(({ giocatore, value }, idx) => {
        const squadra = squadre[idx];
        return (
          <Link
            key={giocatore.id}
            href={`/giocatori/${giocatore.id}`}
            className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 group"
          >
            <span
              className={cn(
                "font-score w-5 shrink-0 text-center text-sm font-bold",
                idx === 0 ? "text-gold-bright" : "text-muted-foreground"
              )}
            >
              {idx + 1}
            </span>
            <PlayerAvatar nome={giocatore.nome} cognome={giocatore.cognome} fotoUrl={giocatore.fotoUrl} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold group-hover:text-primary-glow">
                {giocatore.nome} {giocatore.cognome}
              </p>
              {squadra && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} logoUrl={squadra.logoUrl} size={12} />
                  {squadra.nomeBreve}
                </p>
              )}
            </div>
            <span className="font-score shrink-0 text-lg font-bold text-foreground">
              {value}
              <span className="ml-1 text-[10px] font-semibold uppercase text-muted-foreground">{unit}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
