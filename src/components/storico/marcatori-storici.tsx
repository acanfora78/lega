import { cn } from "@/lib/utils";
import type { MarcatoreStorico } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

function iniziali(nome: string) {
  return nome.replace(/\*/g, "").trim().slice(0, 2).toUpperCase();
}

export function MarcatoriStorici({ marcatori }: { marcatori: MarcatoreStorico[] }) {
  if (!marcatori.length) {
    return <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">Dati marcatori non ancora disponibili per questa stagione.</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl glass">
      {marcatori.map((m) => (
        <div key={m.posizione} className="flex items-center gap-3 border-b border-border/60 p-3.5 last:border-0">
          <span
            className={cn(
              "font-score w-7 shrink-0 text-center text-base font-bold",
              m.posizione === 1 && "text-gold-bright",
              m.posizione > 1 && m.posizione <= 3 && "text-foreground/80",
              m.posizione > 3 && "text-muted-foreground"
            )}
          >
            {m.posizione}
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pitch-700 to-pitch-900 text-xs font-bold text-primary-glow">
            {iniziali(m.giocatore)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
              {m.giocatore.replace(/^\*+/, "")}
              {m.nomeParziale && (
                <span title="Cognome parzialmente censurato nella fonte originale">
                  <AlertTriangle className="size-3 shrink-0 text-warning" />
                </span>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">{m.squadra}</p>
          </div>
          <span className="font-score shrink-0 text-lg font-bold text-foreground">
            {m.gol}
            <span className="ml-1 text-[10px] font-semibold uppercase text-muted-foreground">gol</span>
          </span>
        </div>
      ))}
    </div>
  );
}
