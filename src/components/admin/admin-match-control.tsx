"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, Trophy, Loader2, RotateCcw, ShieldAlert, ArrowLeft } from "lucide-react";
import { TeamCrest } from "@/components/brand/team-crest";
import { AdminTabellino } from "@/components/admin/admin-tabellino";
import { MatchTimeline } from "@/components/match/timeline";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { leggiTabellino, type RigaTabellino } from "@/lib/tabellino";
import type { EventoPartita, Giocatore, Partita, Squadra, StatoPartita, TipoEvento } from "@/lib/types";

const STATI: StatoPartita[] = ["programmata", "live", "intervallo", "conclusa", "rinviata", "sospesa"];
// "Seconda ammonizione" è una voce a sé e non un secondo giallo qualsiasi:
// nell'impianto FIGC l'espulsione che ne deriva assorbe i due gialli, che non
// entrano nel cumulo verso la squalifica. Senza questa voce il tabellino non
// potrebbe distinguerla e il conteggio delle diffide sarebbe sbagliato.
const TIPI_EVENTO: { value: TipoEvento; label: string }[] = [
  { value: "goal", label: "Gol" },
  { value: "rigore_segnato", label: "Rigore segnato" },
  { value: "autogoal", label: "Autorete" },
  { value: "assist", label: "Assist" },
  { value: "ammonizione", label: "Ammonizione" },
  { value: "secondo_giallo", label: "Seconda ammonizione (espulsione)" },
  { value: "espulsione", label: "Espulsione diretta" },
  { value: "sostituzione", label: "Sostituzione" },
];

/**
 * I giocatori proposti nella cronaca e nell'MVP: quelli segnati presenti nel
 * tabellino, o l'intera rosa finché non ne è stato segnato nessuno — le
 * partite importate da calendario non hanno distinta, e un elenco vuoto
 * impedirebbe di inserire marcatori e cartellini.
 */
function convocati(roster: Giocatore[], righe: RigaTabellino[]): Giocatore[] {
  const presenti = new Set(righe.filter((r) => r.presente).map((r) => r.giocatoreId));
  if (presenti.size === 0) return roster;
  return roster.filter((g) => presenti.has(g.id));
}

export function AdminMatchControl({
  partita,
  casa,
  trasferta,
  rosterCasa,
  rosterTrasferta,
  indisponibili = {},
}: {
  partita: Partita;
  casa: Squadra;
  trasferta: Squadra;
  rosterCasa: Giocatore[];
  rosterTrasferta: Giocatore[];
  /** giocatoreId → squalifica in corso su questa giornata, segnalata in distinta. */
  indisponibili?: Record<string, string>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAzzerando, setIsAzzerando] = useState(false);
  // Diventa vera quando una scrittura risponde "partita non trovata": non
  // esiste più nell'archivio, tipicamente perché nel frattempo (un'altra
  // scheda, un altro admin) è stata eliminata o l'intero calendario è stato
  // svuotato e ricaricato da un CSV — cosa che genera ID nuovi. Da qui in
  // avanti ogni ulteriore click ripeterebbe lo stesso errore all'infinito:
  // meglio bloccare la pagina e indirizzare al calendario aggiornato.
  const [partitaEliminata, setPartitaEliminata] = useState(false);
  const [stato, setStato] = useState<StatoPartita>(partita.stato);
  const [golCasa, setGolCasa] = useState(partita.golCasa);
  const [golTrasferta, setGolTrasferta] = useState(partita.golTrasferta);
  const [eventi, setEventi] = useState<EventoPartita[]>(partita.eventi);
  const [mvpId, setMvpId] = useState(partita.mvpGiocatoreId ?? "");

  // Il tabellino vive qui e non dentro il suo pannello: appena si spunta un
  // presente, gli elenchi di cronaca e MVP si restringono di conseguenza,
  // senza aspettare il salvataggio e il ricaricamento.
  const [righeCasa, setRigheCasa] = useState<RigaTabellino[]>(() => leggiTabellino(partita, rosterCasa));
  const [righeTrasferta, setRigheTrasferta] = useState<RigaTabellino[]>(() => leggiTabellino(partita, rosterTrasferta));

  const [squadraForm, setSquadraForm] = useState(casa.id);
  const [tipoForm, setTipoForm] = useState<TipoEvento>("goal");
  const [giocatoreForm, setGiocatoreForm] = useState("");
  const [minutoForm, setMinutoForm] = useState(1);

  const convocatiCasa = useMemo(() => convocati(rosterCasa, righeCasa), [rosterCasa, righeCasa]);
  const convocatiTrasferta = useMemo(
    () => convocati(rosterTrasferta, righeTrasferta),
    [rosterTrasferta, righeTrasferta]
  );

  const rosterAttivo = squadraForm === casa.id ? convocatiCasa : convocatiTrasferta;

  function cambiaTabellino(squadraId: string, righe: RigaTabellino[]) {
    if (squadraId === casa.id) setRigheCasa(righe);
    else setRigheTrasferta(righe);
    // Chi esce dalla distinta non può restare selezionato nel form evento.
    const presenti = righe.filter((r) => r.presente);
    if (squadraId === squadraForm && giocatoreForm && presenti.length > 0 && !presenti.some((r) => r.giocatoreId === giocatoreForm)) {
      setGiocatoreForm("");
    }
  }

  /**
   * Il tabellino di UNA squadra è stato salvato: il server ha già
   * riconciliato eventi e risultato (vedi src/lib/tabellino.ts), quindi qui
   * si riallinea lo stato locale a quello — punteggio e cronaca sempre, il
   * tabellino della sola squadra appena salvata. router.refresh() da solo
   * non basterebbe: questo componente ha già copiato le props in uno stato
   * locale al montaggio, e senza questo riallineamento esplicito resterebbe
   * indietro finché la pagina non viene ricaricata a mano.
   *
   * L'altra squadra, se aveva modifiche non ancora salvate nel suo
   * tabellino, le mantiene intatte: non c'è motivo di scartarle solo perché
   * è stata salvata la prima.
   */
  function tabellinoSalvato(squadraId: string, partitaAggiornata: Partita) {
    setGolCasa(partitaAggiornata.golCasa);
    setGolTrasferta(partitaAggiornata.golTrasferta);
    setEventi(partitaAggiornata.eventi);
    // Compilare un tabellino marca la gara "conclusa" in automatico lato
    // server (vedi promuoviAConclusaSeGiocata nello store): senza questo
    // riallineamento il menu "Stato partita" restava fermo su "programmata"
    // a schermo, anche se in archivio la classifica si era già aggiornata.
    setStato(partitaAggiornata.stato);
    if (squadraId === casa.id) setRigheCasa(leggiTabellino(partitaAggiornata, rosterCasa));
    else setRigheTrasferta(leggiTabellino(partitaAggiornata, rosterTrasferta));
  }

  async function patch(body: Record<string, unknown>): Promise<Partita> {
    const res = await fetch(`/api/admin/partite/${partita.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.status === 404) setPartitaEliminata(true);
    const corpo = await res.json();
    if (!res.ok) throw new Error(corpo.error ?? "Errore");
    startTransition(() => router.refresh());
    return corpo as Partita;
  }

  async function aggiornaRisultato(nuovoCasa: number, nuovoTrasferta: number) {
    setGolCasa(nuovoCasa);
    setGolTrasferta(nuovoTrasferta);
    try {
      // Toccare il risultato marca la gara "conclusa" in automatico lato
      // server se non era già rinviata/sospesa: si riallinea lo stato locale
      // alla risposta, altrimenti il menu "Stato partita" resta indietro.
      const partitaAggiornata = await patch({ golCasa: nuovoCasa, golTrasferta: nuovoTrasferta });
      setStato(partitaAggiornata.stato);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile salvare il risultato");
    }
  }

  async function aggiungiEvento() {
    if (!giocatoreForm) {
      toast.error("Seleziona un giocatore");
      return;
    }
    const nuovo: EventoPartita = {
      id: `manual-${Date.now()}`,
      partitaId: partita.id,
      minuto: minutoForm,
      tempo: minutoForm <= 45 ? 1 : 2,
      tipo: tipoForm,
      squadraId: squadraForm,
      giocatoreId: giocatoreForm,
    };
    setEventi((prev) => [...prev, nuovo]);
    if (tipoForm === "goal" || tipoForm === "rigore_segnato") {
      if (squadraForm === casa.id) setGolCasa((g) => g + 1);
      else setGolTrasferta((g) => g + 1);
    } else if (tipoForm === "autogoal") {
      // L'autorete vale per l'avversaria, come lato server.
      if (squadraForm === casa.id) setGolTrasferta((g) => g + 1);
      else setGolCasa((g) => g + 1);
    }
    try {
      const res = await fetch(`/api/admin/partite/${partita.id}/eventi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minuto: minutoForm, tipo: tipoForm, squadraId: squadraForm, giocatoreId: giocatoreForm }),
      });
      if (res.status === 404) setPartitaEliminata(true);
      const corpo = await res.json();
      if (!res.ok) throw new Error(corpo.error ?? "Errore");
      // Un evento in cronaca marca la gara "conclusa" in automatico lato
      // server (stesso motivo del risultato e del tabellino).
      setStato(corpo.stato);
      toast.success("Evento aggiunto alla cronaca");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile salvare l'evento");
    }
    setGiocatoreForm("");
  }

  async function eliminaEvento(eventoId: string) {
    const evento = eventi.find((e) => e.id === eventoId);
    if (!evento) return;

    // Ottimistico: sparisce subito dalla cronaca e, se era un gol, il
    // risultato torna indietro. In caso di errore entrambi tornano com'erano.
    setEventi((prev) => prev.filter((e) => e.id !== eventoId));
    const eraGol = evento.tipo === "goal" || evento.tipo === "rigore_segnato";
    const eraAutorete = evento.tipo === "autogoal";
    // L'autorete aveva accreditato l'avversaria: si scala da quella.
    const golDiCasa = eraAutorete ? evento.squadraId !== casa.id : evento.squadraId === casa.id;
    if (eraGol || eraAutorete) {
      if (golDiCasa) setGolCasa((g) => Math.max(0, g - 1));
      else setGolTrasferta((g) => Math.max(0, g - 1));
    }

    try {
      const res = await fetch(`/api/admin/partite/${partita.id}/eventi/${eventoId}`, { method: "DELETE" });
      if (res.status === 404) setPartitaEliminata(true);
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Evento rimosso dalla cronaca");
      startTransition(() => router.refresh());
    } catch (err) {
      setEventi((prev) => [...prev, evento]);
      if (eraGol || eraAutorete) {
        if (golDiCasa) setGolCasa((g) => g + 1);
        else setGolTrasferta((g) => g + 1);
      }
      toast.error(err instanceof Error ? err.message : "Impossibile rimuovere l'evento");
    }
  }

  async function salvaStato(v: StatoPartita) {
    setStato(v);
    try {
      await patch({ stato: v });
      toast.success(`Stato partita aggiornato a "${v}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile aggiornare lo stato");
    }
  }

  async function salvaMvp(giocatoreId: string) {
    setMvpId(giocatoreId);
    try {
      await patch({ mvpGiocatoreId: giocatoreId });
      toast.success("MVP assegnato");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile assegnare l'MVP");
    }
  }

  /**
   * Cancella cronaca, distinta, voti, MVP e risultato riportando la gara a
   * 0-0 e allo stato "programmata": la partita resta nel calendario, cambia
   * solo cosa vi è registrato sopra, e sparisce dal conteggio delle giocate
   * finché non viene ricompilata. Se era conclusa, la classifica si
   * aggiorna lato server di conseguenza — qui si azzera anche lo stato
   * locale, così lo schermo non resta a mostrare un punteggio o uno stato
   * "conclusa" che in archivio non esiste più.
   */
  async function azzeraStatistiche() {
    if (
      !window.confirm(
        `Azzerare tabellino e risultato di ${casa.nomeBreve} - ${trasferta.nomeBreve}? Cronaca, distinta, voti, MVP e punteggio torneranno a 0-0. L'operazione non è reversibile.`
      )
    ) {
      return;
    }
    setIsAzzerando(true);
    try {
      const res = await fetch(`/api/admin/partite/${partita.id}/azzera`, { method: "POST" });
      if (res.status === 404) setPartitaEliminata(true);
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");

      const svuotata: Partita = { ...partita, eventi: [], formazioneCasa: undefined, formazioneTrasferta: undefined, voti: [] };
      setGolCasa(0);
      setGolTrasferta(0);
      setEventi([]);
      setMvpId("");
      setStato("programmata");
      setRigheCasa(leggiTabellino(svuotata, rosterCasa));
      setRigheTrasferta(leggiTabellino(svuotata, rosterTrasferta));

      toast.success("Tabellino e risultato azzerati");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile azzerare le statistiche");
    } finally {
      setIsAzzerando(false);
    }
  }

  if (partitaEliminata) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <ShieldAlert className="size-8 text-danger" />
          <p className="font-display text-lg font-bold">Questa partita non esiste più</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {casa.nomeBreve} - {trasferta.nomeBreve} non è più nel calendario: probabilmente è stata eliminata, o il
            calendario è stato svuotato e ricaricato da un CSV nel frattempo (in quel caso ogni gara nasce con un
            indirizzo nuovo, e questa pagina restava aperta su quello vecchio). Le modifiche fatte qui da quando la
            pagina si è aperta non sono state salvate.
          </p>
          <Button asChild className="mt-2">
            <Link href="/admin/partite">
              <ArrowLeft className="size-4" /> Torna al calendario
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {isPending && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Sincronizzazione in corso...
        </div>
      )}
      <Card>
        <CardContent className="flex flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TeamCrest nome={casa.nome} colors={casa.coloriSociali} logoUrl={casa.logoUrl} size={32} />
              <span className="font-semibold">{casa.nomeBreve}</span>
            </div>
            <div className="flex items-center gap-3">
              <ScoreControl value={golCasa} onChange={(v) => aggiornaRisultato(v, golTrasferta)} />
              <span className="font-score text-lg text-muted-foreground">–</span>
              <ScoreControl value={golTrasferta} onChange={(v) => aggiornaRisultato(golCasa, v)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{trasferta.nomeBreve}</span>
              <TeamCrest nome={trasferta.nome} colors={trasferta.coloriSociali} logoUrl={trasferta.logoUrl} size={32} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Stato partita</Label>
              <Select value={stato} onValueChange={(v) => salvaStato(v as StatoPartita)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATI.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant={stato === "live" ? "live" : "muted"} className="capitalize">
              {stato}
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              className="ml-auto"
              onClick={azzeraStatistiche}
              disabled={isAzzerando}
            >
              {isAzzerando ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
              Azzera tabellino e risultato
            </Button>
          </div>
        </CardContent>
      </Card>

      <AdminTabellino
        partitaId={partita.id}
        casa={casa}
        trasferta={trasferta}
        rosterCasa={rosterCasa}
        rosterTrasferta={rosterTrasferta}
        righeCasa={righeCasa}
        righeTrasferta={righeTrasferta}
        onChange={cambiaTabellino}
        onSalvato={tabellinoSalvato}
        onNonTrovata={() => setPartitaEliminata(true)}
        indisponibili={indisponibili}
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="font-display text-base font-bold">Aggiungi evento alla cronaca</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Squadra</Label>
              <Select value={squadraForm} onValueChange={(v) => { setSquadraForm(v); setGiocatoreForm(""); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={casa.id}>{casa.nomeBreve}</SelectItem>
                  <SelectItem value={trasferta.id}>{trasferta.nomeBreve}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Tipo evento</Label>
              <Select value={tipoForm} onValueChange={(v) => setTipoForm(v as TipoEvento)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPI_EVENTO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Giocatore</Label>
              <Select value={giocatoreForm} onValueChange={setGiocatoreForm}>
                <SelectTrigger>
                  <SelectValue placeholder="Scegli" />
                </SelectTrigger>
                <SelectContent>
                  {rosterAttivo.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      #{g.numeroMaglia} {g.nome} {g.cognome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Minuto</Label>
              <Select value={String(minutoForm)} onValueChange={(v) => setMinutoForm(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 90 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m}&apos;
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={aggiungiEvento} className="w-fit">
            <Plus className="size-4" /> Aggiungi evento
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="flex items-center gap-2 font-display text-base font-bold">
            <Trophy className="size-4 text-gold-bright" /> MVP della partita
          </p>
          <Select value={mvpId} onValueChange={salvaMvp}>
            <SelectTrigger className="sm:w-72">
              <SelectValue placeholder="Seleziona MVP" />
            </SelectTrigger>
            <SelectContent>
              {[...convocatiCasa, ...convocatiTrasferta].map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.nome} {g.cognome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 font-display text-base font-bold">Cronaca</p>
        <Card>
          <CardContent className="p-5">
            <MatchTimeline
              partita={{ ...partita, eventi }}
              squadre={[casa, trasferta]}
              giocatori={[...rosterCasa, ...rosterTrasferta]}
              onElimina={eliminaEvento}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScoreControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="icon" onClick={() => onChange(Math.max(0, value - 1))} aria-label="Diminuisci">
        <Minus className="size-3.5" />
      </Button>
      <span className="font-score w-8 text-center text-2xl font-bold tabular-nums">{value}</span>
      <Button variant="outline" size="icon" onClick={() => onChange(value + 1)} aria-label="Aumenta">
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
