import { PlayerAvatar } from "@/components/brand/player-avatar";
import { getGiocatoreById } from "@/lib/data";
import type { FormazioneVoce, Squadra } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Square, LogOut } from "lucide-react";

async function VoceRiga({ voce }: { voce: FormazioneVoce }) {
  const giocatore = await getGiocatoreById(voce.giocatoreId);
  if (!giocatore) return null;
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="font-score w-5 shrink-0 text-center text-xs font-bold text-muted-foreground">{voce.numero}</span>
      <PlayerAvatar nome={giocatore.nome} cognome={giocatore.cognome} size={30} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {giocatore.nome} {giocatore.cognome}
      </span>
      {voce.votoLive && (
        <span
          className={cn(
            "font-score rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums",
            voce.votoLive >= 7 ? "bg-primary/20 text-primary-glow" : voce.votoLive < 6 ? "bg-danger/15 text-danger" : "bg-white/[0.06] text-foreground"
          )}
        >
          {voce.votoLive.toFixed(1)}
        </span>
      )}
      {voce.ammonito && <Square className="size-3 fill-amber-400 text-amber-400" />}
      {voce.espulso && <Square className="size-3 fill-danger text-danger" />}
      {voce.sostituito && <LogOut className="size-3.5 text-muted-foreground" />}
    </div>
  );
}

export function TeamLineup({ squadra, formazione }: { squadra: Squadra; formazione?: FormazioneVoce[] }) {
  if (!formazione) {
    return <p className="text-sm text-muted-foreground">Formazione non ancora disponibile.</p>;
  }
  const titolari = formazione.filter((f) => f.titolare);
  const panchina = formazione.filter((f) => !f.titolare);

  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{squadra.nomeBreve} · Titolari</p>
      <div className="divide-y divide-border/60">
        {titolari.map((v) => (
          <VoceRiga key={v.giocatoreId} voce={v} />
        ))}
      </div>
      <p className="mb-1 mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Panchina</p>
      <div className="divide-y divide-border/60">
        {panchina.map((v) => (
          <VoceRiga key={v.giocatoreId} voce={v} />
        ))}
      </div>
    </div>
  );
}
