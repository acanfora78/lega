import { calcolaPosizioniDisciplinari, cartelliniDiGiornata } from "@/lib/disciplina-figc";
import { calcolaStatisticheDerivate } from "@/lib/statistiche-derivate";
import type { LegaData } from "@/lib/store/file-store";
import { formatDateIt, formatTimeIt } from "@/lib/utils";
import type { Giocatore, Partita, RigaClassifica, Squadra } from "@/lib/types";

// ============================================================================
// COMUNICATO UFFICIALE DI GIORNATA
// ----------------------------------------------------------------------------
// Un'unica funzione pura che, data la fotografia della lega e il numero di
// giornata, compone il testo del comunicato. Non chiede nulla all'utente e
// non duplica nessun calcolo: risultati, classifica, marcatori, cartellini,
// diffide e squalifiche escono dalle stesse funzioni che alimentano le pagine
// pubbliche. Inserito il tabellino di una gara, il comunicato che si genera
// dopo è già aggiornato.
// ============================================================================

export interface ComunicatoGenerato {
  giornata: number;
  titolo: string;
  sommario: string;
  contenuto: string;
  squadreCoinvolte: string[];
  /** Quante gare della giornata risultano concluse: zero significa niente da comunicare. */
  partiteConcluse: number;
}

function nomeGiocatore(g: Giocatore | undefined) {
  return g ? `${g.nome} ${g.cognome}` : "Giocatore";
}

function siglaSquadra(s: Squadra | undefined) {
  return s?.nomeBreve ?? s?.nome ?? "—";
}

function sezione(titolo: string, righe: string[], seVuoto?: string): string {
  const corpo = righe.length > 0 ? righe.join("\n") : seVuoto;
  return corpo ? `${titolo}\n${corpo}` : "";
}

/**
 * Compone il comunicato della giornata indicata sulle sole gare del campionato
 * principale. `data` è lo stato completo della lega: la funzione resta pura e
 * quindi verificabile senza database.
 */
export function generaComunicatoGiornata(data: LegaData, giornata: number): ComunicatoGenerato {
  const { squadre, giocatori, stagioneAttualeId } = data;
  const delCampionato = data.partite.filter((p) => !p.competizioneId && p.stagioneId === stagioneAttualeId);
  const dellaGiornata = [...delCampionato]
    .filter((p) => p.giornata === giornata)
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());
  const concluse = dellaGiornata.filter((p) => p.stato === "conclusa");

  const mappaSquadre = new Map(squadre.map((s) => [s.id, s]));
  const mappaGiocatori = new Map(giocatori.map((g) => [g.id, g]));

  // --- Risultati -----------------------------------------------------------
  const righeRisultati = dellaGiornata.map((p) => {
    const casa = siglaSquadra(mappaSquadre.get(p.squadraCasaId));
    const trasferta = siglaSquadra(mappaSquadre.get(p.squadraTrasfertaId));
    if (p.stato !== "conclusa") {
      const quando = `${formatDateIt(p.dataOra)} ore ${formatTimeIt(p.dataOra)}`;
      return `• ${casa} – ${trasferta}: ${p.stato === "rinviata" ? "rinviata" : `da giocare (${quando})`}`;
    }
    const marcatori = marcatoriDellaPartita(p, mappaGiocatori);
    return `• ${casa} – ${trasferta}  ${p.golCasa}-${p.golTrasferta}${marcatori ? `\n   ${marcatori}` : ""}`;
  });

  // --- Classifica generale -------------------------------------------------
  // Si usa la classifica già persistita e ricalcolata ad ogni risultato: è la
  // stessa che vede il pubblico, non un secondo calcolo che potrebbe divergere.
  const righeClassifica = [...data.classifica]
    .sort((a, b) => a.posizione - b.posizione)
    .map((r: RigaClassifica) => {
      const nome = siglaSquadra(mappaSquadre.get(r.squadraId));
      return `${String(r.posizione).padStart(2, " ")}. ${nome} — ${r.punti} pt (${r.giocate}g ${r.vinte}v ${r.pareggiate}n ${r.perse}p, ${r.golFatti}:${r.golSubiti})`;
    });

  // --- Marcatori -----------------------------------------------------------
  const statistiche = calcolaStatisticheDerivate(delCampionato, giocatori);
  const righeMarcatori = [...statistiche.values()]
    .filter((s) => s.goal > 0)
    .sort((a, b) => b.goal - a.goal || b.assist - a.assist)
    .slice(0, 15)
    .map((s, i) => {
      const g = mappaGiocatori.get(s.giocatoreId);
      const squadra = siglaSquadra(mappaSquadre.get(s.squadraId));
      const rigori = s.rigori > 0 ? ` (di cui ${s.rigori} su rigore)` : "";
      return `${String(i + 1).padStart(2, " ")}. ${nomeGiocatore(g)} (${squadra}) — ${s.goal} gol${rigori}`;
    });

  // --- Disciplina della giornata -------------------------------------------
  const cartellini = cartelliniDiGiornata(delCampionato, giornata);
  const descriviCartellino = (giocatoreId: string, squadraId: string) =>
    `• ${nomeGiocatore(mappaGiocatori.get(giocatoreId))} (${siglaSquadra(mappaSquadre.get(squadraId))})`;

  const righeAmmoniti = cartellini
    .filter((c) => c.tipo === "ammonizione")
    .map((c) => descriviCartellino(c.giocatoreId, c.squadraId));

  const righeEspulsi = cartellini
    .filter((c) => c.tipo === "espulsione" || c.tipo === "doppia_ammonizione")
    .map(
      (c) =>
        `${descriviCartellino(c.giocatoreId, c.squadraId)} — ${
          c.tipo === "doppia_ammonizione" ? "espulsione per seconda ammonizione" : "espulsione diretta"
        }`
    );

  // --- Diffidati e squalifiche ---------------------------------------------
  const posizioni = calcolaPosizioniDisciplinari(delCampionato, giocatori);

  const righeDiffidati = posizioni
    .filter((p) => p.diffidato)
    .map(
      (p) =>
        `${descriviCartellino(p.giocatoreId, p.squadraId)} — ${p.ammonizioni} ammonizioni: alla ${
          p.prossimaSogliaSqualifica
        }ª scatta la squalifica`
    );

  // Provvedimenti automatici maturati proprio in questa giornata, più quelli
  // manuali del Giudice Sportivo che partono dalla giornata successiva.
  const righeSqualificheAuto = posizioni
    .flatMap((p) => p.squalifiche)
    .filter((s) => s.giornataOrigine === giornata)
    .map(
      (s) =>
        `• ${nomeGiocatore(mappaGiocatori.get(s.giocatoreId))} (${siglaSquadra(
          mappaSquadre.get(s.squadraId)
        )}) — ${s.giornate} giornat${s.giornate === 1 ? "a" : "e"}, dalla ${s.giornataDa}ª. ${s.dettaglio}`
    );

  const righeSqualificheManuali = (data.squalifiche ?? [])
    .filter((s) => s.stagioneId === stagioneAttualeId && (s.giornataOrigine === giornata || s.giornataDa === giornata + 1))
    .map(
      (s) =>
        `• ${nomeGiocatore(mappaGiocatori.get(s.giocatoreId))} (${siglaSquadra(mappaSquadre.get(s.squadraId))}) — ${
          s.giornate
        } giornat${s.giornate === 1 ? "a" : "e"}, dalla ${s.giornataDa}ª${s.dettaglio ? `. ${s.dettaglio}` : ""}`
    );

  const sezioni = [
    sezione("RISULTATI DELLA GIORNATA", righeRisultati, "Nessuna gara in calendario per questa giornata."),
    sezione("CLASSIFICA GENERALE", righeClassifica, "Classifica non ancora disponibile."),
    sezione("CLASSIFICA MARCATORI", righeMarcatori, "Nessuna rete ancora segnata in campionato."),
    sezione("AMMONITI", righeAmmoniti, "Nessun ammonito in questa giornata."),
    sezione("ESPULSI", righeEspulsi, "Nessun espulso in questa giornata."),
    sezione(
      "SQUALIFICATI",
      [...righeSqualificheAuto, ...righeSqualificheManuali],
      "Nessuna squalifica comminata in questa giornata."
    ),
    sezione("DIFFIDATI", righeDiffidati, "Nessun giocatore in diffida."),
  ].filter(Boolean);

  const nota =
    "I provvedimenti per somma di ammonizioni e per espulsione sono determinati automaticamente " +
    "sulla base dei tabellini di gara, secondo l'impianto disciplinare FIGC/LND adottato dalla Lega: " +
    "squalifica di una giornata alla 4ª ammonizione, alla 7ª, alla 9ª e successivamente ad ogni " +
    "ammonizione, con diffida a chi si trova a un solo cartellino dalla misura; una giornata per " +
    "espulsione, con aggravante di recidiva; i due gialli che determinano l'espulsione non concorrono " +
    "al cumulo. Restano riservate al Giudice Sportivo le sanzioni per condotta e i reclami.";

  const contenuto = [...sezioni, `NOTA\n${nota}`].join("\n\n");

  const golTotali = concluse.reduce((tot, p) => tot + p.golCasa + p.golTrasferta, 0);
  const sommario =
    concluse.length > 0
      ? `${concluse.length} gare disputate, ${golTotali} reti totali, ${righeAmmoniti.length} ammoniti e ${righeEspulsi.length} espulsi.`
      : `Comunicato della ${giornata}ª giornata: nessuna gara ancora conclusa.`;

  return {
    giornata,
    titolo: `Comunicato Ufficiale — ${giornata}ª Giornata`,
    sommario,
    contenuto,
    squadreCoinvolte: [...new Set(dellaGiornata.flatMap((p) => [p.squadraCasaId, p.squadraTrasfertaId]))],
    partiteConcluse: concluse.length,
  };
}

/** Riepilogo marcatori di una gara, nella riga sotto al risultato. */
function marcatoriDellaPartita(partita: Partita, mappaGiocatori: Map<string, Giocatore>): string {
  const reti = partita.eventi
    .filter((e) => e.tipo === "goal" || e.tipo === "rigore_segnato" || e.tipo === "autogoal")
    .sort((a, b) => a.minuto - b.minuto)
    .map((e) => {
      const nome = nomeGiocatore(mappaGiocatori.get(e.giocatoreId ?? ""));
      const suffisso = e.tipo === "rigore_segnato" ? " rig." : e.tipo === "autogoal" ? " aut." : "";
      return `${nome} ${e.minuto}'${suffisso}`;
    });
  return reti.length > 0 ? `Reti: ${reti.join(", ")}` : "";
}
