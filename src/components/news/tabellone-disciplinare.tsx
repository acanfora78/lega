import Link from "next/link";
import { Gavel, AlertTriangle, ShieldAlert } from "lucide-react";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { TeamCrest } from "@/components/brand/team-crest";
import { UnderQuarantaStar } from "@/components/player/under-quaranta-star";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type ConteggioRisolto, type SqualificaRisolta } from "@/lib/data/disciplina";
import type { MotivoSqualifica } from "@/lib/types";

const ETICHETTE_MOTIVO: Record<MotivoSqualifica, string> = {
  espulsione: "Espulsione",
  somma_ammonizioni: "Somma ammonizioni",
  condotta: "Condotta antisportiva",
  reclamo: "Reclamo accolto",
  altro: "Altro provvedimento",
};

/** Squalifiche in corso decise dal Giudice Sportivo. */
export function SqualificheAttive({ squalifiche }: { squalifiche: SqualificaRisolta[] }) {
  if (!squalifiche.length) {
    return (
      <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
        Nessuna squalifica in corso: tutti i tesserati sono a disposizione.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {squalifiche.map((s) => (
        <Card key={s.id} className="border-danger/20">
          <CardContent className="flex items-start gap-3 p-4">
            {s.giocatore ? (
              <PlayerAvatar nome={s.giocatore.nome} cognome={s.giocatore.cognome} fotoUrl={s.giocatore.fotoUrl} size={44} />
            ) : (
              <Gavel className="size-10 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-bold">
                {s.giocatore ? (
                  <Link href={`/giocatori/${s.giocatore.id}`} className="truncate hover:text-primary-glow">
                    {s.giocatore.nome} {s.giocatore.cognome}
                  </Link>
                ) : (
                  <span className="truncate text-muted-foreground">Giocatore rimosso</span>
                )}
                {s.giocatore && <UnderQuarantaStar eta={s.giocatore.eta} />}
              </p>
              {s.squadra && (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TeamCrest nome={s.squadra.nome} colors={s.squadra.coloriSociali} logoUrl={s.squadra.logoUrl} size={14} />
                  {s.squadra.nomeBreve}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="danger">
                  {s.giornate} {s.giornate === 1 ? "giornata" : "giornate"}
                </Badge>
                <Badge variant="muted">{ETICHETTE_MOTIVO[s.motivo]}</Badge>
                <span className="text-[11px] text-muted-foreground">
                  {s.giornataDa === s.giornataA ? `Giornata ${s.giornataDa}` : `Giornate ${s.giornataDa}–${s.giornataA}`}
                </span>
              </div>
              {s.dettaglio && <p className="mt-2 text-xs text-muted-foreground">{s.dettaglio}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Conteggio cartellini, ricavato dagli eventi delle partite concluse. */
export function ConteggiCartellini({ conteggi }: { conteggi: ConteggioRisolto[] }) {
  if (!conteggi.length) {
    return (
      <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
        Nessun cartellino registrato: i conteggi compariranno automaticamente dai tabellini delle partite concluse.
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl glass">
      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Giocatore</th>
              <th className="px-2 py-3">Squadra</th>
              <th className="px-2 py-3 text-center">Gialli</th>
              <th className="px-2 py-3 text-center">Rossi</th>
              <th className="px-4 py-3 text-center">Stato</th>
            </tr>
          </thead>
          <tbody>
            {conteggi.map((c) => (
              <tr key={c.giocatoreId} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/giocatori/${c.giocatore.id}`} className="flex items-center gap-1 font-semibold hover:text-primary-glow">
                    <span className="truncate">
                      {c.giocatore.nome} {c.giocatore.cognome}
                    </span>
                    <UnderQuarantaStar eta={c.giocatore.eta} />
                  </Link>
                </td>
                <td className="px-2 py-3">
                  {c.squadra && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <TeamCrest nome={c.squadra.nome} colors={c.squadra.coloriSociali} logoUrl={c.squadra.logoUrl} size={16} />
                      {c.squadra.nomeBreve}
                    </span>
                  )}
                </td>
                <td className="px-2 py-3 text-center font-score font-bold tabular-nums text-amber-400">{c.ammonizioni}</td>
                <td className="px-2 py-3 text-center font-score font-bold tabular-nums text-danger">{c.espulsioni}</td>
                <td className="px-4 py-3 text-center">
                  {c.diffidato ? (
                    <Badge variant="warning">
                      <AlertTriangle className="size-3" /> Diffidato
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">
                      {c.ammonizioniVersoSqualifica} al {c.prossimaSogliaSqualifica}° giallo
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Riquadro sintetico dei diffidati, da mostrare in cima alla pagina. */
export function AvvisoDiffidati({ diffidati }: { diffidati: ConteggioRisolto[] }) {
  if (!diffidati.length) return null;

  return (
    <Card className="border-warning/25 bg-warning/5">
      <CardContent className="flex items-start gap-2.5 p-4 text-xs text-warning">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          <span className="font-bold">In diffida:</span>{" "}
          {diffidati.map((d) => `${d.giocatore.nome} ${d.giocatore.cognome}`).join(", ")}. Alla prossima ammonizione
          scatta una giornata di squalifica.
        </p>
      </CardContent>
    </Card>
  );
}
