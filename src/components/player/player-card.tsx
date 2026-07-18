import Link from "next/link";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { getSquadraById } from "@/lib/data";
import type { Giocatore } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PlayerCard({
  giocatore,
  statLabel,
  statValue,
  showTeam = true,
  className,
}: {
  giocatore: Giocatore;
  statLabel?: string;
  statValue?: string | number;
  showTeam?: boolean;
  className?: string;
}) {
  const squadra = getSquadraById(giocatore.squadraId);

  return (
    <Link
      href={`/giocatori/${giocatore.id}`}
      className={cn(
        "group flex items-center gap-3 rounded-2xl glass card-luxury p-3.5 transition-all duration-300 hover:border-primary-glow/30 hover:bg-white/[0.05]",
        className
      )}
    >
      <PlayerAvatar nome={giocatore.nome} cognome={giocatore.cognome} numero={giocatore.numeroMaglia} size={48} ring />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold leading-tight">
          {giocatore.nome} {giocatore.cognome}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {giocatore.ruolo}
          {showTeam && squadra && ` · ${squadra.nomeBreve}`}
        </p>
      </div>
      {statValue !== undefined && (
        <div className="shrink-0 text-right">
          <p className="font-score text-lg font-bold leading-none text-primary-glow">{statValue}</p>
          {statLabel && <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{statLabel}</p>}
        </div>
      )}
    </Link>
  );
}
