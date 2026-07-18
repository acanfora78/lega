import { TeamCrest } from "@/components/brand/team-crest";
import type { EventoPartita, Giocatore, Partita, Squadra } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  CircleDot,
  Flag,
  Goal as GoalIcon,
  PlayCircle,
  Square,
  StopCircle,
  Timer,
  Trophy,
} from "lucide-react";

const EVENTO_META: Record<
  EventoPartita["tipo"],
  { icon: typeof GoalIcon; label: string; color: string }
> = {
  goal: { icon: GoalIcon, label: "Gol", color: "text-primary-glow" },
  autogoal: { icon: GoalIcon, label: "Autogol", color: "text-danger" },
  rigore_segnato: { icon: GoalIcon, label: "Rigore segnato", color: "text-primary-glow" },
  rigore_sbagliato: { icon: CircleDot, label: "Rigore sbagliato", color: "text-muted-foreground" },
  assist: { icon: ArrowLeftRight, label: "Assist", color: "text-gold-bright" },
  ammonizione: { icon: Square, label: "Ammonizione", color: "text-amber-400" },
  secondo_giallo: { icon: Square, label: "Secondo giallo", color: "text-danger" },
  espulsione: { icon: Square, label: "Espulsione", color: "text-danger" },
  sostituzione: { icon: ArrowLeftRight, label: "Sostituzione", color: "text-muted-foreground" },
  inizio_partita: { icon: PlayCircle, label: "Calcio d'inizio", color: "text-muted-foreground" },
  fine_primo_tempo: { icon: Timer, label: "Fine primo tempo", color: "text-muted-foreground" },
  inizio_secondo_tempo: { icon: PlayCircle, label: "Inizio secondo tempo", color: "text-muted-foreground" },
  fine_partita: { icon: StopCircle, label: "Triplice fischio", color: "text-muted-foreground" },
  mvp: { icon: Trophy, label: "MVP", color: "text-gold-bright" },
};

export function MatchTimeline({
  partita,
  squadre,
  giocatori,
}: {
  partita: Partita;
  /** Squadre coinvolte (casa + trasferta), per stemma/nome nella cronaca. */
  squadre: Squadra[];
  /** Rose delle due squadre, per nome/numero dei protagonisti degli eventi. */
  giocatori: Giocatore[];
}) {
  const squadreMap = new Map(squadre.map((s) => [s.id, s]));
  const giocatoriMap = new Map(giocatori.map((g) => [g.id, g]));
  const eventiOrdinati = [...partita.eventi].sort((a, b) => b.minuto - a.minuto || (b.minutoRecupero ?? 0) - (a.minutoRecupero ?? 0));

  if (eventiOrdinati.length === 0) {
    return (
      <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">
        <Flag className="mx-auto mb-2 size-6 opacity-50" />
        La cronaca della partita sarà disponibile al calcio d&apos;inizio.
      </div>
    );
  }

  return (
    <ol className="relative flex flex-col gap-0 border-l border-border pl-6">
      {eventiOrdinati.map((e) => {
        const meta = EVENTO_META[e.tipo];
        const Icon = meta.icon;
        const squadraEvento = squadreMap.get(e.squadraId);
        const giocatore = e.giocatoreId ? giocatoriMap.get(e.giocatoreId) : undefined;
        const assist = e.assistGiocatoreId ? giocatoriMap.get(e.assistGiocatoreId) : undefined;
        const entrata = e.giocatoreEntrataId ? giocatoriMap.get(e.giocatoreEntrataId) : undefined;
        const isGoal = e.tipo === "goal" || e.tipo === "rigore_segnato" || e.tipo === "autogoal";

        return (
          <li key={e.id} className="relative py-3">
            <span
              className={cn(
                "absolute -left-[31px] flex size-6 items-center justify-center rounded-full bg-background-elevated ring-2 ring-border",
                isGoal && "ring-primary-glow/50"
              )}
            >
              <Icon className={cn("size-3.5", meta.color)} />
            </span>
            <div className="flex items-start gap-3">
              <span className="font-score shrink-0 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-xs font-bold tabular-nums">
                {e.minuto}
                {e.minutoRecupero ? `+${e.minutoRecupero}` : ""}&apos;
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className={cn("text-sm font-semibold", isGoal && "text-primary-glow")}>{meta.label}</p>
                  {squadraEvento && <TeamCrest nome={squadraEvento.nome} colors={squadraEvento.coloriSociali} logoUrl={squadraEvento.logoUrl} size={14} />}
                </div>
                {giocatore && (
                  <p className="text-sm text-foreground/90">
                    {giocatore.nome} {giocatore.cognome}
                    {giocatore.numeroMaglia ? ` (#${giocatore.numeroMaglia})` : ""}
                  </p>
                )}
                {assist && <p className="text-xs text-muted-foreground">Assist di {assist.nome} {assist.cognome}</p>}
                {entrata && <p className="text-xs text-muted-foreground">Entra {entrata.nome} {entrata.cognome}</p>}
                {e.dettaglio && <p className="text-xs text-muted-foreground">{e.dettaglio}</p>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
