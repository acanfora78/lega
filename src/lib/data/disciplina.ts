import { legaData } from "@/lib/mock";
import {
  calcolaPosizioniDisciplinari,
  cartelliniDiGiornata,
  REGOLAMENTO_FIGC_DILETTANTI,
  squalificheAutomatiche,
  type CartellinoGiornata,
  type PosizioneDisciplinare,
  type SqualificaAutomatica,
} from "@/lib/disciplina-figc";
import type { ConteggioDisciplinare, Giocatore, Squadra, Squalifica } from "@/lib/types";

// ============================================================================
// GIUSTIZIA SPORTIVA
// ----------------------------------------------------------------------------
// Ammonizioni, diffide, espulsioni e squalifiche per cumulo NON sono campi da
// compilare: escono dal regolamento applicato agli eventi delle partite
// concluse (src/lib/disciplina-figc.ts), la stessa sorgente di cronaca,
// classifica e statistiche individuali. Basta inserire i cartellini nel
// tabellino: diffidati e squalificati si aggiornano da soli.
//
// Restano manuali — e si sommano a quelle automatiche — solo le decisioni che
// il regolamento non può dedurre: condotta antisportiva, reclami accolti,
// aggravamenti decisi dal Giudice Sportivo.
// ============================================================================

/**
 * Le quote di ammonizioni che fanno scattare la giornata di squalifica
 * (impianto FIGC/LND): 4ª, 7ª, 9ª e poi ogni ammonizione successiva.
 */
export const SOGLIE_AMMONIZIONI = REGOLAMENTO_FIGC_DILETTANTI.soglieAmmonizioni;

/** Partite del campionato principale della stagione in corso: l'ambito disciplinare. */
async function partiteDelCampionato() {
  const { partite, giocatori, stagioneAttualeId } = await legaData();
  return {
    partite: partite.filter((p) => !p.competizioneId && p.stagioneId === stagioneAttualeId),
    giocatori,
    stagioneAttualeId,
  };
}

export async function getPosizioniDisciplinari(): Promise<PosizioneDisciplinare[]> {
  const { partite, giocatori } = await partiteDelCampionato();
  return calcolaPosizioniDisciplinari(partite, giocatori);
}

/**
 * Conteggio cartellini per giocatore, nella forma storica consumata dalle
 * pagine. `ammonizioni` è il totale a referto; il conteggio valido ai fini
 * del cumulo (che esclude i gialli assorbiti da una doppia ammonizione)
 * guida invece diffida e squalifiche.
 */
export async function getConteggiDisciplinari(): Promise<ConteggioDisciplinare[]> {
  return (await getPosizioniDisciplinari()).map((p) => ({
    giocatoreId: p.giocatoreId,
    squadraId: p.squadraId,
    ammonizioni: p.ammonizioniTotali,
    espulsioni: p.espulsioni,
    secondiGialli: p.doppieAmmonizioni,
    ammonizioniVersoSqualifica: p.ammonizioniVersoSqualifica,
    prossimaSogliaSqualifica: p.prossimaSogliaSqualifica,
    diffidato: p.diffidato,
  }));
}

export interface ConteggioRisolto extends ConteggioDisciplinare {
  giocatore: Giocatore;
  squadra?: Squadra;
}

/** Conteggi già uniti a giocatore e squadra, pronti da renderizzare. */
export async function getConteggiDisciplinariRisolti(): Promise<ConteggioRisolto[]> {
  const [conteggi, { giocatori, squadre }] = await Promise.all([getConteggiDisciplinari(), legaData()]);
  const mappaGiocatori = new Map(giocatori.map((g) => [g.id, g]));
  const mappaSquadre = new Map(squadre.map((s) => [s.id, s]));

  return conteggi
    .map((c): ConteggioRisolto | undefined => {
      const giocatore = mappaGiocatori.get(c.giocatoreId);
      return giocatore ? { ...c, giocatore, squadra: mappaSquadre.get(c.squadraId) } : undefined;
    })
    .filter((c): c is ConteggioRisolto => c !== undefined);
}

/** Giocatori a un cartellino dalla squalifica. */
export async function getDiffidati(): Promise<ConteggioRisolto[]> {
  return (await getConteggiDisciplinariRisolti()).filter((c) => c.diffidato);
}

/**
 * Squalifiche automatiche dedotte dal regolamento, tradotte nella stessa forma
 * di quelle manuali così che le pagine possano trattarle insieme.
 */
export async function getSqualificheAutomatiche(): Promise<Squalifica[]> {
  const [posizioni, { stagioneAttualeId }] = await Promise.all([getPosizioniDisciplinari(), legaData()]);
  return squalificheAutomatiche(posizioni).map((s: SqualificaAutomatica) => ({
    // Id deterministico: ricalcolando si ottiene sempre lo stesso, quindi non
    // si accumulano duplicati e le chiavi React restano stabili.
    id: `auto-${s.partitaId}-${s.giocatoreId}-${s.motivo}-${s.giornataOrigine}`,
    stagioneId: stagioneAttualeId,
    giocatoreId: s.giocatoreId,
    squadraId: s.squadraId,
    giornate: s.giornate,
    giornataDa: s.giornataDa,
    motivo: s.motivo === "doppia_ammonizione" ? "espulsione" : s.motivo,
    dettaglio: s.dettaglio,
    giornataOrigine: s.giornataOrigine,
    emessaIl: new Date().toISOString(),
  }));
}

/** Solo i provvedimenti inseriti a mano dal Giudice Sportivo. */
export async function getSqualificheManuali(): Promise<Squalifica[]> {
  const { squalifiche = [], stagioneAttualeId } = await legaData();
  return squalifiche.filter((s) => s.stagioneId === stagioneAttualeId);
}

/** Automatiche + manuali, dalla più recente. */
export async function getSqualifiche(): Promise<Squalifica[]> {
  const [automatiche, manuali] = await Promise.all([getSqualificheAutomatiche(), getSqualificheManuali()]);
  return [...automatiche, ...manuali].sort(
    (a, b) => (b.giornataDa - a.giornataDa) || new Date(b.emessaIl).getTime() - new Date(a.emessaIl).getTime()
  );
}

export interface SqualificaRisolta extends Squalifica {
  giocatore?: Giocatore;
  squadra?: Squadra;
  /** Ultima giornata in cui il provvedimento è ancora in corso. */
  giornataA: number;
  attiva: boolean;
  /** true se dedotta dal regolamento, false se decisa dal Giudice Sportivo. */
  automatica: boolean;
}

/**
 * Squalifiche unite a giocatore/squadra e confrontate con la giornata corrente,
 * per distinguere quelle ancora da scontare da quelle già esaurite.
 */
export async function getSqualificheRisolte(giornataCorrente: number): Promise<SqualificaRisolta[]> {
  const [squalifiche, { giocatori, squadre }] = await Promise.all([getSqualifiche(), legaData()]);
  const mappaGiocatori = new Map(giocatori.map((g) => [g.id, g]));
  const mappaSquadre = new Map(squadre.map((s) => [s.id, s]));

  return squalifiche.map((s) => {
    const giornataA = s.giornataDa + Math.max(1, s.giornate) - 1;
    return {
      ...s,
      giocatore: mappaGiocatori.get(s.giocatoreId),
      squadra: mappaSquadre.get(s.squadraId),
      giornataA,
      attiva: giornataCorrente <= giornataA,
      automatica: s.id.startsWith("auto-"),
    };
  });
}

/** Solo i provvedimenti ancora da scontare. */
export async function getSqualificheAttive(giornataCorrente: number): Promise<SqualificaRisolta[]> {
  return (await getSqualificheRisolte(giornataCorrente)).filter((s) => s.attiva);
}

/** Cartellini di una singola giornata, per il comunicato ufficiale. */
export async function getCartelliniDiGiornata(giornata: number): Promise<CartellinoGiornata[]> {
  const { partite } = await partiteDelCampionato();
  return cartelliniDiGiornata(partite, giornata);
}
