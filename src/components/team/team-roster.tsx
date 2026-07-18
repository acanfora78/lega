import Link from "next/link";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { Badge } from "@/components/ui/badge";
import type { Giocatore, Ruolo } from "@/lib/types";
import { legaData } from "@/lib/mock";

const ORDINE_RUOLI: Ruolo[] = ["Portiere", "Difensore", "Centrocampista", "Attaccante"];

export async function TeamRoster({ giocatori, capitanoId, viceCapitanoId }: { giocatori: Giocatore[]; capitanoId?: string; viceCapitanoId?: string }) {
  const stagioneId = (await legaData()).stagioneAttualeId;

  return (
    <div className="flex flex-col gap-6">
      {ORDINE_RUOLI.map((ruolo) => {
        const lista = giocatori.filter((g) => g.ruolo === ruolo);
        if (!lista.length) return null;
        return (
          <div key={ruolo}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{ruolo}i</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {lista.map((g) => {
                const stat = g.statistiche.find((s) => s.stagioneId === stagioneId);
                return (
                  <Link
                    key={g.id}
                    href={`/giocatori/${g.id}`}
                    className="flex items-center gap-3 rounded-xl glass p-3 hover:border-primary-glow/30"
                  >
                    <span className="font-score w-5 shrink-0 text-center text-sm font-bold text-muted-foreground">{g.numeroMaglia}</span>
                    <PlayerAvatar nome={g.nome} cognome={g.cognome} fotoUrl={g.fotoUrl} size={38} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {g.nome} {g.cognome}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {g.id === capitanoId && <Badge variant="gold">C</Badge>}
                        {g.id === viceCapitanoId && <Badge variant="outline">VC</Badge>}
                        <span className="text-xs text-muted-foreground">{g.eta} anni</span>
                      </div>
                    </div>
                    {stat && (
                      <div className="shrink-0 text-right text-xs text-muted-foreground">
                        <p className="font-score text-sm font-bold text-foreground">{stat.goal}g / {stat.assist}a</p>
                        <p>{stat.presenze} presenze</p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
