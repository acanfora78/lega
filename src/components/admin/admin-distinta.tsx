"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ClipboardCheck, Loader2, Save, ShieldAlert, UserMinus, UserPlus } from "lucide-react";
import { TeamCrest } from "@/components/brand/team-crest";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { UnderQuarantaStar } from "@/components/player/under-quaranta-star";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { FormazioneVoce, Giocatore, Squadra } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Titolari di una gara a undici: oltre questa quota i nuovi convocati partono in panchina. */
const TITOLARI = 11;

// ============================================================================
// DISTINTA DI GARA
// ----------------------------------------------------------------------------
// La sera della partita si segna chi c'è, squadra per squadra. Non è un
// dettaglio estetico: da qui escono le presenze in classifica individuale, e
// il resto del tabellino (eventi, MVP, voti) smette di proporre l'intera rosa
// per proporre i soli presenti — con venti tesserati a squadra, cercare chi ha
// segnato in un elenco dove c'è anche chi non è sceso in campo è il modo più
// facile per sbagliare cartellino o marcatore.
//
// Chi ha una squalifica in corso proprio su questa giornata è segnalato: non
// viene bloccato — l'ultima parola è dell'organizzatore — ma non può finire in
// distinta per distrazione.
// ============================================================================

export function AdminDistinta({
  partitaId,
  casa,
  trasferta,
  rosterCasa,
  rosterTrasferta,
  distintaCasa,
  distintaTrasferta,
  onChange,
  indisponibili,
}: {
  partitaId: string;
  casa: Squadra;
  trasferta: Squadra;
  rosterCasa: Giocatore[];
  rosterTrasferta: Giocatore[];
  distintaCasa: FormazioneVoce[];
  distintaTrasferta: FormazioneVoce[];
  onChange: (squadraId: string, voci: FormazioneVoce[]) => void;
  /** giocatoreId → motivo dell'indisponibilità (squalifica attiva su questa giornata). */
  indisponibili: Record<string, string>;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5">
        <p className="flex items-center gap-2 font-display text-base font-bold">
          <ClipboardCheck className="size-4 text-primary-glow" /> Distinta di gara
        </p>
        <p className="-mt-3 text-xs text-muted-foreground">
          Segna chi è presente, squadra per squadra. I convocati diventano le presenze in classifica e sono gli unici
          proposti negli elenchi di cronaca, MVP e voti: finché la distinta è vuota resta disponibile tutta la rosa.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ColonnaDistinta
            partitaId={partitaId}
            squadra={casa}
            roster={rosterCasa}
            voci={distintaCasa}
            onChange={(voci) => onChange(casa.id, voci)}
            indisponibili={indisponibili}
          />
          <ColonnaDistinta
            partitaId={partitaId}
            squadra={trasferta}
            roster={rosterTrasferta}
            voci={distintaTrasferta}
            onChange={(voci) => onChange(trasferta.id, voci)}
            indisponibili={indisponibili}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ColonnaDistinta({
  partitaId,
  squadra,
  roster,
  voci,
  onChange,
  indisponibili,
}: {
  partitaId: string;
  squadra: Squadra;
  roster: Giocatore[];
  voci: FormazioneVoce[];
  onChange: (voci: FormazioneVoce[]) => void;
  indisponibili: Record<string, string>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [salvataggio, setSalvataggio] = useState(false);

  const perGiocatore = useMemo(() => new Map(voci.map((v) => [v.giocatoreId, v])), [voci]);
  const titolari = voci.filter((v) => v.titolare).length;
  const squalificatiInDistinta = voci.filter((v) => indisponibili[v.giocatoreId]).length;

  function convoca(giocatore: Giocatore) {
    const voce: FormazioneVoce = {
      giocatoreId: giocatore.id,
      // I primi undici entrano da titolari, gli altri in panchina: è sempre
      // correggibile con un tocco, ma evita di doverlo fare venti volte.
      titolare: titolari < TITOLARI,
      numero: giocatore.numeroMaglia,
      ruolo: giocatore.ruolo,
    };
    onChange([...voci, voce]);
  }

  function escludi(giocatoreId: string) {
    onChange(voci.filter((v) => v.giocatoreId !== giocatoreId));
  }

  function aggiorna(giocatoreId: string, patch: Partial<FormazioneVoce>) {
    onChange(voci.map((v) => (v.giocatoreId === giocatoreId ? { ...v, ...patch } : v)));
  }

  function convocaTutti() {
    onChange(
      roster.map((g, i) => ({
        giocatoreId: g.id,
        titolare: i < TITOLARI,
        numero: g.numeroMaglia,
        ruolo: g.ruolo,
      }))
    );
  }

  async function salva() {
    setSalvataggio(true);
    try {
      const res = await fetch(`/api/admin/partite/${partitaId}/distinta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ squadraId: squadra.id, voci }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success(
        voci.length > 0 ? `Distinta ${squadra.nomeBreve}: ${voci.length} convocati` : `Distinta ${squadra.nomeBreve} svuotata`
      );
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile salvare la distinta");
    } finally {
      setSalvataggio(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} logoUrl={squadra.logoUrl} size={22} />
          <span className="font-semibold">{squadra.nomeBreve}</span>
          {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        </div>
        <Badge variant={voci.length > 0 ? "default" : "muted"}>
          {voci.length} in distinta · {titolari} titolari
        </Badge>
      </div>

      {roster.length === 0 ? (
        <p className="py-4 text-xs text-muted-foreground">Nessun giocatore in rosa per questa squadra.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 py-1">
            <Button variant="outline" size="sm" onClick={convocaTutti} disabled={salvataggio}>
              <UserPlus className="size-3.5" /> Convoca tutti
            </Button>
            <Button variant="outline" size="sm" onClick={() => onChange([])} disabled={salvataggio || voci.length === 0}>
              <UserMinus className="size-3.5" /> Svuota
            </Button>
          </div>

          <div className="flex flex-col">
            {roster.map((g) => {
              const voce = perGiocatore.get(g.id);
              const motivo = indisponibili[g.id];
              return (
                <div
                  key={g.id}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-1 py-1.5",
                    voce ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => (voce ? escludi(g.id) : convoca(g))}
                    aria-pressed={Boolean(voce)}
                    aria-label={`${voce ? "Togli dalla" : "Metti in"} distinta ${g.nome} ${g.cognome}`}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                      voce
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-transparent hover:border-primary/60"
                    )}
                  >
                    <Check className="size-3.5" />
                  </button>

                  <PlayerAvatar nome={g.nome} cognome={g.cognome} fotoUrl={g.fotoUrl} size={30} />

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-sm font-semibold">
                      <span className="truncate">
                        {g.nome} {g.cognome}
                      </span>
                      <UnderQuarantaStar eta={g.eta} size={11} />
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span>{g.ruolo}</span>
                      {motivo && (
                        <span className="flex items-center gap-1 font-semibold text-danger">
                          <ShieldAlert className="size-3" /> {motivo}
                        </span>
                      )}
                    </p>
                  </div>

                  {voce && (
                    <>
                      <button
                        type="button"
                        onClick={() => aggiorna(g.id, { titolare: !voce.titolare })}
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors",
                          voce.titolare
                            ? "bg-primary/20 text-primary-glow hover:bg-primary/30"
                            : "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1]"
                        )}
                      >
                        {voce.titolare ? "Titolare" : "Panchina"}
                      </button>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={99}
                        aria-label={`Numero di maglia di ${g.nome} ${g.cognome}`}
                        value={voce.numero}
                        onChange={(e) => aggiorna(g.id, { numero: Number(e.target.value) })}
                        className="w-14 shrink-0 text-center font-score font-bold"
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {squalificatiInDistinta > 0 && (
            <p className="flex items-start gap-1.5 rounded-xl border border-danger/25 bg-danger/5 p-2.5 text-[11px] text-danger">
              <ShieldAlert className="mt-px size-3.5 shrink-0" />
              <span>
                {squalificatiInDistinta === 1
                  ? "Un giocatore in distinta è squalificato per questa giornata."
                  : `${squalificatiInDistinta} giocatori in distinta sono squalificati per questa giornata.`}{" "}
                Schierarli espone al reclamo dell&apos;avversaria.
              </span>
            </p>
          )}

          <Button onClick={salva} disabled={salvataggio} className="mt-1 w-fit">
            {salvataggio ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salva distinta {squadra.nomeBreve}
          </Button>
        </>
      )}
    </div>
  );
}
