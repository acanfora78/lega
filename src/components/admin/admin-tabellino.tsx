"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  ClipboardList,
  Loader2,
  Minus,
  Plus,
  Save,
  ShieldAlert,
  Square,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { TeamCrest } from "@/components/brand/team-crest";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { UnderQuarantaStar } from "@/components/player/under-quaranta-star";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { RigaTabellino } from "@/lib/tabellino";
import type { Giocatore, Partita, Squadra } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Titolari di una gara a undici: oltre questa quota i nuovi convocati partono in panchina. */
const TITOLARI = 11;
const VOTO_MINIMO = 1;
const VOTO_MASSIMO = 10;

// ============================================================================
// TABELLINO DI GARA
// ----------------------------------------------------------------------------
// Il referto compilato come lo si compila davvero: si sceglie la squadra, si
// segna chi c'era e per ognuno quanti gol, quanti assist, che cartellini. Non
// serve ricordare il minuto di ogni episodio — a fine partita si sa che Rossi
// ne ha fatti due, non che li ha fatti al 23' e al 61'.
//
// Il pannello scrive comunque eventi (vedi src/lib/tabellino.ts): presenze,
// classifica marcatori, disciplinare e comunicato continuano a leggere l'unica
// sorgente che leggevano prima. La cronaca minuto per minuto resta disponibile
// più sotto per chi la vuole, e i due strumenti non si pestano i piedi: un gol
// già inserito col suo minuto qui compare come "1" e resta col suo minuto.
// ============================================================================

export function AdminTabellino({
  partitaId,
  casa,
  trasferta,
  rosterCasa,
  rosterTrasferta,
  righeCasa,
  righeTrasferta,
  onChange,
  onSalvato,
  indisponibili,
}: {
  partitaId: string;
  casa: Squadra;
  trasferta: Squadra;
  rosterCasa: Giocatore[];
  rosterTrasferta: Giocatore[];
  righeCasa: RigaTabellino[];
  righeTrasferta: RigaTabellino[];
  onChange: (squadraId: string, righe: RigaTabellino[]) => void;
  /**
   * La squadra salvata da referto server (già riconciliato): il genitore lo
   * usa per riallineare punteggio e cronaca senza aspettare il refresh della
   * pagina, che da solo non farebbe ripartire lo stato locale già montato.
   */
  onSalvato: (squadraId: string, partita: Partita) => void;
  /** giocatoreId → squalifica in corso su questa giornata. */
  indisponibili: Record<string, string>;
}) {
  const [squadraAttiva, setSquadraAttiva] = useState(casa.id);
  const inCasa = squadraAttiva === casa.id;
  const squadra = inCasa ? casa : trasferta;
  const roster = inCasa ? rosterCasa : rosterTrasferta;
  const righe = inCasa ? righeCasa : righeTrasferta;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <p className="flex items-center gap-2 font-display text-base font-bold">
          <ClipboardList className="size-4 text-primary-glow" /> Tabellino di gara
        </p>
        <p className="-mt-2 text-xs text-muted-foreground">
          Segna chi era presente e cosa ha fatto: gol, assist, cartellini e voto. Da qui escono presenze, classifica
          marcatori, ammonizioni e squalifiche, senza inserire nient&apos;altro da nessun&apos;altra parte.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {[casa, trasferta].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSquadraAttiva(s.id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors",
                squadraAttiva === s.id
                  ? "border-primary bg-primary/15 text-primary-glow"
                  : "border-border text-muted-foreground hover:bg-white/[0.04]"
              )}
            >
              <TeamCrest nome={s.nome} colors={s.coloriSociali} logoUrl={s.logoUrl} size={20} />
              <span className="truncate">{s.nomeBreve}</span>
            </button>
          ))}
        </div>

        <RefertoSquadra
          key={squadra.id}
          partitaId={partitaId}
          squadra={squadra}
          roster={roster}
          righe={righe}
          onChange={(nuove) => onChange(squadra.id, nuove)}
          onSalvato={(partita) => onSalvato(squadra.id, partita)}
          indisponibili={indisponibili}
        />
      </CardContent>
    </Card>
  );
}

function RefertoSquadra({
  partitaId,
  squadra,
  roster,
  righe,
  onChange,
  onSalvato,
  indisponibili,
}: {
  partitaId: string;
  squadra: Squadra;
  roster: Giocatore[];
  righe: RigaTabellino[];
  onChange: (righe: RigaTabellino[]) => void;
  onSalvato: (partita: Partita) => void;
  indisponibili: Record<string, string>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [salvataggio, setSalvataggio] = useState(false);
  const [aperto, setAperto] = useState<string | null>(null);

  const perGiocatore = useMemo(() => new Map(righe.map((r) => [r.giocatoreId, r])), [righe]);
  const presenti = righe.filter((r) => r.presente);
  const titolari = presenti.filter((r) => r.titolare).length;
  const reti = presenti.reduce((tot, r) => tot + r.gol + r.rigori, 0);
  const squalificatiInCampo = presenti.filter((r) => indisponibili[r.giocatoreId]).length;

  function aggiorna(giocatoreId: string, patch: Partial<RigaTabellino>) {
    onChange(righe.map((r) => (r.giocatoreId === giocatoreId ? { ...r, ...patch } : r)));
  }

  function commutaPresenza(riga: RigaTabellino) {
    if (riga.presente) {
      // Togliere dalla distinta azzera anche il referto: chi non è sceso in
      // campo non può avere gol o cartellini, e lasciarli lì significherebbe
      // vederli riapparire alla prossima spunta.
      aggiorna(riga.giocatoreId, {
        presente: false,
        gol: 0,
        rigori: 0,
        autoreti: 0,
        assist: 0,
        ammonizione: false,
        doppiaAmmonizione: false,
        espulsione: false,
        voto: null,
      });
      if (aperto === riga.giocatoreId) setAperto(null);
      return;
    }
    aggiorna(riga.giocatoreId, { presente: true, titolare: titolari < TITOLARI });
  }

  function convocaTutti() {
    let quanti = 0;
    onChange(
      righe.map((r) => {
        if (r.presente) {
          quanti += 1;
          return r;
        }
        quanti += 1;
        return { ...r, presente: true, titolare: quanti <= TITOLARI };
      })
    );
  }

  function svuota() {
    setAperto(null);
    onChange(
      righe.map((r) => ({
        ...r,
        presente: false,
        gol: 0,
        rigori: 0,
        autoreti: 0,
        assist: 0,
        ammonizione: false,
        doppiaAmmonizione: false,
        espulsione: false,
        voto: null,
      }))
    );
  }

  async function salva() {
    setSalvataggio(true);
    try {
      const res = await fetch(`/api/admin/partite/${partitaId}/tabellino`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ squadraId: squadra.id, righe }),
      });
      const corpo = await res.json();
      if (!res.ok) throw new Error(corpo.error ?? "Errore");
      // La partita tornata dal server è già riconciliata (risultato spostato
      // della differenza, minuti preservati): il genitore la usa per
      // riallineare punteggio e cronaca subito, senza aspettare che
      // router.refresh() ridia le props a un componente che le ha già
      // copiate una volta sola nel proprio stato.
      onSalvato(corpo);
      toast.success(`Tabellino ${squadra.nomeBreve} salvato: ${presenti.length} presenti, ${reti} reti`);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile salvare il tabellino");
    } finally {
      setSalvataggio(false);
    }
  }

  if (roster.length === 0) {
    return <p className="py-4 text-xs text-muted-foreground">Nessun giocatore in rosa per {squadra.nomeBreve}.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={presenti.length > 0 ? "default" : "muted"}>
            {presenti.length} presenti · {titolari} titolari
          </Badge>
          <Badge variant="muted">{reti} reti a referto</Badge>
          {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={convocaTutti} disabled={salvataggio}>
            <UserPlus className="size-3.5" /> Tutti
          </Button>
          <Button variant="outline" size="sm" onClick={svuota} disabled={salvataggio || presenti.length === 0}>
            <UserMinus className="size-3.5" /> Svuota
          </Button>
        </div>
      </div>

      <div className="flex flex-col">
        {roster.map((g) => {
          const riga = perGiocatore.get(g.id);
          if (!riga) return null;
          const motivo = indisponibili[g.id];
          const espanso = aperto === g.id;

          return (
            <div
              key={g.id}
              className={cn(
                "rounded-xl border border-transparent",
                riga.presente && "border-border/60 bg-white/[0.03]",
                espanso && "border-primary/30"
              )}
            >
              <div className="flex items-center gap-2 px-1 py-1.5">
                <button
                  type="button"
                  onClick={() => commutaPresenza(riga)}
                  aria-pressed={riga.presente}
                  aria-label={`${riga.presente ? "Togli dalla" : "Metti in"} distinta ${g.nome} ${g.cognome}`}
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
                    riga.presente
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
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span>{g.ruolo}</span>
                    <RiepilogoRiga riga={riga} />
                    {motivo && (
                      <span className="flex items-center gap-1 font-semibold text-danger">
                        <ShieldAlert className="size-3" /> {motivo}
                      </span>
                    )}
                  </p>
                </div>

                {riga.presente && (
                  <>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={VOTO_MINIMO}
                      max={VOTO_MASSIMO}
                      step={0.5}
                      placeholder="voto"
                      aria-label={`Voto di ${g.nome} ${g.cognome}`}
                      value={riga.voto ?? ""}
                      onChange={(e) =>
                        aggiorna(g.id, { voto: e.target.value === "" ? null : Number(e.target.value.replace(",", ".")) })
                      }
                      className="w-16 shrink-0 px-1 text-center font-score font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setAperto(espanso ? null : g.id)}
                      aria-expanded={espanso}
                      aria-label={`Statistiche di ${g.nome} ${g.cognome}`}
                      className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                    >
                      <ChevronDown className={cn("size-4 transition-transform", espanso && "rotate-180")} />
                    </button>
                  </>
                )}
              </div>

              {riga.presente && espanso && (
                <DettaglioGiocatore riga={riga} onChange={(patch) => aggiorna(g.id, patch)} />
              )}
            </div>
          );
        })}
      </div>

      {squalificatiInCampo > 0 && (
        <p className="flex items-start gap-1.5 rounded-xl border border-danger/25 bg-danger/5 p-2.5 text-[11px] text-danger">
          <ShieldAlert className="mt-px size-3.5 shrink-0" />
          <span>
            {squalificatiInCampo === 1
              ? "Un giocatore in distinta è squalificato per questa giornata."
              : `${squalificatiInCampo} giocatori in distinta sono squalificati per questa giornata.`}{" "}
            Schierarli espone al reclamo dell&apos;avversaria.
          </span>
        </p>
      )}

      <Button onClick={salva} disabled={salvataggio} className="mt-1 w-fit">
        {salvataggio ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        Salva tabellino {squadra.nomeBreve}
      </Button>
    </div>
  );
}

/** Riepilogo di ciò che il giocatore ha fatto, sotto al nome: ⚽ ×2, 🟨, 🟥. */
function RiepilogoRiga({ riga }: { riga: RigaTabellino }) {
  if (!riga.presente) return null;
  const reti = riga.gol + riga.rigori;
  const voci: string[] = [];
  if (reti > 0) voci.push(`⚽ ${reti > 1 ? `×${reti}` : ""}`.trim());
  if (riga.assist > 0) voci.push(`👟 ${riga.assist > 1 ? `×${riga.assist}` : ""}`.trim());
  if (riga.autoreti > 0) voci.push(`aut. ×${riga.autoreti}`);
  if (voci.length === 0 && !riga.ammonizione && !riga.doppiaAmmonizione && !riga.espulsione) return null;

  return (
    <span className="flex items-center gap-1.5 font-semibold text-foreground/80">
      {voci.join(" · ")}
      {riga.ammonizione && <Square className="size-3 fill-amber-400 text-amber-400" />}
      {(riga.doppiaAmmonizione || riga.espulsione) && <Square className="size-3 fill-danger text-danger" />}
    </span>
  );
}

function DettaglioGiocatore({
  riga,
  onChange,
}: {
  riga: RigaTabellino;
  onChange: (patch: Partial<RigaTabellino>) => void;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-border/60 px-2 py-2">
      <Contatore etichetta="Gol" valore={riga.gol} onChange={(gol) => onChange({ gol })} />
      <Contatore etichetta="Rigori segnati" valore={riga.rigori} onChange={(rigori) => onChange({ rigori })} />
      <Contatore etichetta="Assist" valore={riga.assist} onChange={(assist) => onChange({ assist })} />
      <Contatore etichetta="Autoreti" valore={riga.autoreti} onChange={(autoreti) => onChange({ autoreti })} />

      <Interruttore
        etichetta="Ammonizione"
        colore="bg-amber-400"
        attivo={riga.ammonizione || riga.doppiaAmmonizione}
        // Con la doppia ammonizione il primo giallo è implicito: toglierlo da
        // solo lascerebbe a referto un'espulsione senza il cartellino che l'ha
        // prodotta.
        bloccato={riga.doppiaAmmonizione}
        onChange={(ammonizione) => onChange({ ammonizione })}
      />
      <Interruttore
        etichetta="Espulsione per doppia ammonizione"
        colore="bg-danger"
        attivo={riga.doppiaAmmonizione}
        onChange={(doppiaAmmonizione) =>
          onChange({ doppiaAmmonizione, ...(doppiaAmmonizione ? { ammonizione: true } : {}) })
        }
      />
      <Interruttore
        etichetta="Espulsione diretta"
        colore="bg-danger"
        attivo={riga.espulsione}
        onChange={(espulsione) => onChange({ espulsione })}
      />

      <div className="flex items-center justify-between gap-2 py-1.5">
        <span className="text-xs text-muted-foreground">In campo dal 1°</span>
        <button
          type="button"
          onClick={() => onChange({ titolare: !riga.titolare })}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors",
            riga.titolare
              ? "bg-primary/20 text-primary-glow hover:bg-primary/30"
              : "bg-white/[0.06] text-muted-foreground hover:bg-white/[0.1]"
          )}
        >
          {riga.titolare ? "Titolare" : "Panchina"}
        </button>
      </div>

      <p className="pb-1 text-[11px] text-muted-foreground">
        I minuti degli episodi non servono qui. Per registrarli si usa la cronaca più in basso: quello che è già
        inserito lì resta, con il suo minuto.
      </p>
    </div>
  );
}

function Contatore({
  etichetta,
  valore,
  onChange,
}: {
  etichetta: string;
  valore: number;
  onChange: (valore: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-xs">{etichetta}</span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onChange(Math.max(0, valore - 1))}
          aria-label={`${etichetta}: uno in meno`}
          disabled={valore === 0}
        >
          <Minus className="size-3.5" />
        </Button>
        <span className="font-score w-6 text-center text-sm font-bold tabular-nums">{valore}</span>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onChange(valore + 1)}
          aria-label={`${etichetta}: uno in più`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function Interruttore({
  etichetta,
  colore,
  attivo,
  bloccato,
  onChange,
}: {
  etichetta: string;
  colore: string;
  attivo: boolean;
  bloccato?: boolean;
  onChange: (attivo: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="flex items-center gap-2 text-xs">
        <span className={cn("size-3 rounded-[2px]", colore)} />
        {etichetta}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={attivo}
        aria-label={etichetta}
        disabled={bloccato}
        onClick={() => onChange(!attivo)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          attivo ? "bg-primary" : "bg-white/[0.12]",
          bloccato && "opacity-60"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-all",
            attivo ? "left-[22px]" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}
