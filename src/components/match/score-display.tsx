import type { Partita, Squadra } from "@/lib/types";
import { TeamCrest } from "@/components/brand/team-crest";

interface ScoreDisplayProps {
  partita: Partita;
  squadraCasa: Squadra;
  squadraTrasferta: Squadra;
  layout?: "horizontal" | "vertical";
}

export function ScoreDisplay({ partita, squadraCasa, squadraTrasferta, layout = "horizontal" }: ScoreDisplayProps) {
  if (layout === "vertical") {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div>
          <TeamCrest nome={squadraCasa.nome} colors={squadraCasa.coloriSociali} logoUrl={squadraCasa.logoUrl} size={60} />
          <p className="mt-2 font-display text-sm font-bold">{squadraCasa.nome}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-score text-5xl font-bold">{partita.golCasa}</div>
          <div className="text-xl text-muted-foreground">−</div>
          <div className="font-score text-5xl font-bold">{partita.golTrasferta}</div>
        </div>
        <div>
          <p className="mt-2 font-display text-sm font-bold">{squadraTrasferta.nome}</p>
          <TeamCrest nome={squadraTrasferta.nome} colors={squadraTrasferta.coloriSociali} logoUrl={squadraTrasferta.logoUrl} size={60} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 flex-col items-center gap-2">
        <TeamCrest nome={squadraCasa.nome} colors={squadraCasa.coloriSociali} logoUrl={squadraCasa.logoUrl} size={48} />
        <p className="line-clamp-2 text-center text-sm font-bold">{squadraCasa.nome}</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="font-score text-4xl font-bold">{partita.golCasa}</div>
        <div className="text-xs text-muted-foreground">−</div>
        <div className="font-score text-4xl font-bold">{partita.golTrasferta}</div>
      </div>
      <div className="flex flex-1 flex-col items-center gap-2">
        <TeamCrest nome={squadraTrasferta.nome} colors={squadraTrasferta.coloriSociali} logoUrl={squadraTrasferta.logoUrl} size={48} />
        <p className="line-clamp-2 text-center text-sm font-bold">{squadraTrasferta.nome}</p>
      </div>
    </div>
  );
}
