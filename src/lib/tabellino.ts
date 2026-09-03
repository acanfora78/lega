import type { EventoPartita, FormazioneVoce, Giocatore, Partita, TipoEvento, VotoPartita } from "@/lib/types";

// ============================================================================
// TABELLINO DI GARA
// ----------------------------------------------------------------------------
// Il referto come lo compila chi era a bordo campo: un giocatore per riga, e
// per ognuno quanti gol, quanti assist, che cartellini. Non si ragiona per
// singolo episodio col minuto — a fine partita si sa che Rossi ha fatto due
// gol, non necessariamente al 23' e al 61'.
//
// Sotto, però, resta tutto com'era: il tabellino non introduce un secondo
// archivio di statistiche accanto agli eventi, le scrive COME eventi. È la
// stessa sorgente da cui escono classifica, marcatori, disciplinare e
// comunicato, quindi non c'è modo che i due numeri divergano — che è
// esattamente il problema che avrebbe un contatore salvato per conto suo.
//
// Per lo stesso motivo la scrittura è una riconciliazione e non una
// sostituzione: gli eventi già a referto col loro minuto vengono riusati, si
// aggiunge o si toglie solo la differenza. Chi ha inserito "gol al 23'" dalla
// cronaca non lo perde riaprendo il tabellino.
// ============================================================================

/** I tipi di evento che il tabellino governa: gli altri (sostituzioni, fischi) restano intatti. */
const GESTITI: TipoEvento[] = [
  "goal",
  "rigore_segnato",
  "autogoal",
  "assist",
  "ammonizione",
  "secondo_giallo",
  "espulsione",
];

export interface RigaTabellino {
  giocatoreId: string;
  /** In distinta: chi non c'è non può avere né statistiche né voto. */
  presente: boolean;
  titolare: boolean;
  numero: number;
  /** Gol su azione (i rigori si contano a parte, come nel referto). */
  gol: number;
  rigori: number;
  autoreti: number;
  assist: number;
  ammonizione: boolean;
  /** Espulsione per seconda ammonizione: i due gialli non entrano nel cumulo. */
  doppiaAmmonizione: boolean;
  espulsione: boolean;
  /** Voto in scala 1–10, null se non assegnato. */
  voto: number | null;
}

export interface EsitoTabellino {
  eventi: EventoPartita[];
  distinta: FormazioneVoce[];
  voti: VotoPartita[];
  /** Reti da sommare (o sottrarre) al risultato, come farebbe l'inserimento singolo. */
  deltaGolCasa: number;
  deltaGolTrasferta: number;
}

function conta(eventi: EventoPartita[], giocatoreId: string, tipo: TipoEvento): number {
  return eventi.filter((e) => e.giocatoreId === giocatoreId && e.tipo === tipo).length;
}

/**
 * Il tabellino di una squadra come risulta da ciò che è già in archivio:
 * è lo stato iniziale del pannello, così riaprirlo mostra quello che c'è
 * invece di una scheda vuota che cancellerebbe tutto al primo salvataggio.
 */
export function leggiTabellino(partita: Partita, roster: Giocatore[]): RigaTabellino[] {
  return roster.map((g) => leggiRiga(partita, g));
}

/** Riga del tabellino di un singolo giocatore, ricavata dagli eventi già a referto. */
export function leggiRiga(partita: Partita, giocatore: Giocatore): RigaTabellino {
  const inCasa = giocatore.squadraId === partita.squadraCasaId;
  const distinta = (inCasa ? partita.formazioneCasa : partita.formazioneTrasferta) ?? [];
  const voce = distinta.find((v) => v.giocatoreId === giocatore.id);
  const voto = partita.voti?.find((v) => v.giocatoreId === giocatore.id)?.voto;
  const eventi = partita.eventi;

  // Senza distinta compilata è presente chi ha almeno un episodio a referto:
  // le gare importate da calendario non hanno formazioni, e presentarle tutte
  // a zero cancellerebbe i tabellini già inseriti dalla cronaca.
  const haEpisodi = eventi.some((e) => e.giocatoreId === giocatore.id);

  return {
    giocatoreId: giocatore.id,
    presente: voce ? true : distinta.length === 0 && haEpisodi,
    titolare: voce?.titolare ?? true,
    numero: voce?.numero ?? giocatore.numeroMaglia,
    gol: conta(eventi, giocatore.id, "goal"),
    rigori: conta(eventi, giocatore.id, "rigore_segnato"),
    autoreti: conta(eventi, giocatore.id, "autogoal"),
    assist: conta(eventi, giocatore.id, "assist"),
    ammonizione: conta(eventi, giocatore.id, "ammonizione") > 0,
    doppiaAmmonizione: conta(eventi, giocatore.id, "secondo_giallo") > 0,
    espulsione: conta(eventi, giocatore.id, "espulsione") > 0,
    voto: typeof voto === "number" ? voto : null,
  };
}

/** Quante volte ogni tipo di evento deve comparire, secondo la riga compilata. */
function quantita(riga: RigaTabellino): Record<string, number> {
  if (!riga.presente) return {};
  return {
    goal: Math.max(0, Math.trunc(riga.gol)),
    rigore_segnato: Math.max(0, Math.trunc(riga.rigori)),
    autogoal: Math.max(0, Math.trunc(riga.autoreti)),
    assist: Math.max(0, Math.trunc(riga.assist)),
    // Il secondo giallo presuppone il primo: senza, il conteggio dei cartellini
    // a referto direbbe un'espulsione uscita dal nulla.
    ammonizione: riga.ammonizione || riga.doppiaAmmonizione ? 1 : 0,
    secondo_giallo: riga.doppiaAmmonizione ? 1 : 0,
    espulsione: riga.espulsione ? 1 : 0,
  };
}

/**
 * Applica il tabellino di UNA squadra alla partita: gli eventi dei suoi
 * tesserati vengono riallineati ai conteggi, quelli dell'altra squadra e
 * quelli non gestiti (sostituzioni, fischi) restano dove sono.
 *
 * `nuovoId` è iniettato invece di generato qui dentro perché la funzione resti
 * pura e quindi verificabile senza database.
 */
export function applicaTabellino(
  partita: Partita,
  squadraId: string,
  roster: Giocatore[],
  righe: RigaTabellino[],
  nuovoId: () => string
): EsitoTabellino {
  const dellaSquadra = new Set(roster.map((g) => g.id));
  const perGiocatore = new Map(righe.filter((r) => dellaSquadra.has(r.giocatoreId)).map((r) => [r.giocatoreId, r]));
  const numeroDi = new Map(roster.map((g) => [g.id, g.numeroMaglia]));
  const ruoloDi = new Map(roster.map((g) => [g.id, g.ruolo]));

  const gestito = (e: EventoPartita) =>
    Boolean(e.giocatoreId) && perGiocatore.has(e.giocatoreId as string) && GESTITI.includes(e.tipo);

  const intatti = partita.eventi.filter((e) => !gestito(e));
  const daRiallineare = partita.eventi.filter(gestito);

  const eventiSquadra: EventoPartita[] = [];
  perGiocatore.forEach((riga, giocatoreId) => {
    const attesi = quantita(riga);
    Object.entries(attesi).forEach(([tipo, quante]) => {
      // Si riusano gli episodi già a referto, dal più vecchio: chi aveva un
      // minuto lo conserva, e si aggiunge o si toglie solo la differenza.
      const esistenti = daRiallineare
        .filter((e) => e.giocatoreId === giocatoreId && e.tipo === tipo)
        .sort((a, b) => a.minuto - b.minuto);

      eventiSquadra.push(...esistenti.slice(0, quante));

      for (let i = esistenti.length; i < quante; i++) {
        eventiSquadra.push({
          id: nuovoId(),
          partitaId: partita.id,
          // Minuto ignoto: il tabellino registra che è successo, non quando.
          minuto: 0,
          tempo: 1,
          tipo: tipo as TipoEvento,
          squadraId,
          giocatoreId,
        });
      }
    });
  });

  // --- Risultato ------------------------------------------------------------
  // Stessa regola dell'inserimento singolo: un gol in più sposta il punteggio
  // di uno, un'autorete lo sposta dalla parte dell'avversaria. Si applica la
  // differenza e non il totale, così un risultato messo a mano resta valido
  // per le reti di cui nessuno ha indicato il marcatore.
  const reti = (eventi: EventoPartita[], tipi: TipoEvento[]) =>
    eventi.filter((e) => tipi.includes(e.tipo)).length;

  const primaFatti = reti(daRiallineare, ["goal", "rigore_segnato"]);
  const dopoFatti = reti(eventiSquadra, ["goal", "rigore_segnato"]);
  const primaAutoreti = reti(daRiallineare, ["autogoal"]);
  const dopoAutoreti = reti(eventiSquadra, ["autogoal"]);

  const inCasa = squadraId === partita.squadraCasaId;
  const deltaPropri = dopoFatti - primaFatti;
  const deltaAvversari = dopoAutoreti - primaAutoreti;

  // --- Distinta e voti ------------------------------------------------------
  const distinta: FormazioneVoce[] = righe
    .filter((r) => r.presente && dellaSquadra.has(r.giocatoreId))
    .map((r) => ({
      giocatoreId: r.giocatoreId,
      titolare: r.titolare,
      numero: Number.isFinite(r.numero) && r.numero > 0 ? r.numero : numeroDi.get(r.giocatoreId) ?? 0,
      ruolo: ruoloDi.get(r.giocatoreId) ?? "Centrocampista",
    }));

  const altriVoti = (partita.voti ?? []).filter((v) => !perGiocatore.has(v.giocatoreId));
  const votiSquadra: VotoPartita[] = righe
    .filter((r) => r.presente && dellaSquadra.has(r.giocatoreId) && typeof r.voto === "number")
    .map((r) => ({ giocatoreId: r.giocatoreId, voto: r.voto as number }));

  return {
    eventi: [...intatti, ...eventiSquadra],
    distinta,
    voti: [...altriVoti, ...votiSquadra],
    deltaGolCasa: inCasa ? deltaPropri : deltaAvversari,
    deltaGolTrasferta: inCasa ? deltaAvversari : deltaPropri,
  };
}
