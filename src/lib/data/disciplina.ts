import { legaData } from "@/lib/mock";
import type { ConteggioDisciplinare, Giocatore, Squadra, Squalifica } from "@/lib/types";

// ============================================================================
// GIUSTIZIA SPORTIVA
// ----------------------------------------------------------------------------
// I conteggi di ammonizioni ed espulsioni NON sono un campo da compilare a
// mano: sono ricavati dagli eventi delle partite concluse, la stessa sorgente
// che alimenta la cronaca e la classifica fair play. Così il tabellino resta
// l'unico posto in cui l'organizzatore inserisce i cartellini, e i numeri non
// possono divergere tra le pagine.
//
// Le squalifiche invece sono decisioni del Giudice Sportivo e vengono immesse
// dall'area organizzatore.
// ============================================================================

/** Ammonizioni che fanno scattare la giornata di squalifica. */
export const AMMONIZIONI_PER_SQUALIFICA = 4;

/** Un giocatore è "diffidato" quando gli manca un solo giallo alla squalifica. */
function calcolaDiffida(ammonizioni: number) {
  const nelCiclo = ammonizioni % AMMONIZIONI_PER_SQUALIFICA;
  const mancanti = AMMONIZIONI_PER_SQUALIFICA - nelCiclo;
  return { ammonizioniVersoSqualifica: mancanti, diffidato: nelCiclo === AMMONIZIONI_PER_SQUALIFICA - 1 };
}

/**
 * Conteggio cartellini per giocatore sulla stagione in corso, derivato dagli
 * eventi delle partite concluse. Il secondo giallo conta sia come ammonizione
 * sia come espulsione, come nel referto arbitrale.
 */
export async function getConteggiDisciplinari(): Promise<ConteggioDisciplinare[]> {
  const { partite, giocatori, stagioneAttualeId } = await legaData();

  const accumulo = new Map<string, { ammonizioni: number; espulsioni: number; secondiGialli: number }>();
  const tocca = (giocatoreId: string) => {
    const corrente = accumulo.get(giocatoreId) ?? { ammonizioni: 0, espulsioni: 0, secondiGialli: 0 };
    accumulo.set(giocatoreId, corrente);
    return corrente;
  };

  partite
    .filter((p) => p.stagioneId === stagioneAttualeId && p.stato === "conclusa")
    .forEach((p) => {
      p.eventi.forEach((e) => {
        if (!e.giocatoreId) return;
        const voce = tocca(e.giocatoreId);
        if (e.tipo === "ammonizione") voce.ammonizioni += 1;
        else if (e.tipo === "secondo_giallo") {
          voce.ammonizioni += 1;
          voce.secondiGialli += 1;
          voce.espulsioni += 1;
        } else if (e.tipo === "espulsione") voce.espulsioni += 1;
      });
    });

  const mappaGiocatori = new Map(giocatori.map((g) => [g.id, g]));

  return [...accumulo.entries()]
    .map(([giocatoreId, voce]) => {
      const giocatore = mappaGiocatori.get(giocatoreId);
      if (!giocatore) return undefined;
      const { ammonizioniVersoSqualifica, diffidato } = calcolaDiffida(voce.ammonizioni);
      return {
        giocatoreId,
        squadraId: giocatore.squadraId,
        ammonizioni: voce.ammonizioni,
        espulsioni: voce.espulsioni,
        secondiGialli: voce.secondiGialli,
        ammonizioniVersoSqualifica,
        diffidato,
      } satisfies ConteggioDisciplinare;
    })
    .filter((c): c is ConteggioDisciplinare => c !== undefined)
    .sort((a, b) => b.espulsioni - a.espulsioni || b.ammonizioni - a.ammonizioni);
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

export async function getSqualifiche(): Promise<Squalifica[]> {
  const { squalifiche = [], stagioneAttualeId } = await legaData();
  return squalifiche
    .filter((s) => s.stagioneId === stagioneAttualeId)
    .sort((a, b) => new Date(b.emessaIl).getTime() - new Date(a.emessaIl).getTime());
}

export interface SqualificaRisolta extends Squalifica {
  giocatore?: Giocatore;
  squadra?: Squadra;
  /** Ultima giornata in cui il provvedimento è ancora in corso. */
  giornataA: number;
  attiva: boolean;
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
    };
  });
}

/** Solo i provvedimenti ancora da scontare. */
export async function getSqualificheAttive(giornataCorrente: number): Promise<SqualificaRisolta[]> {
  return (await getSqualificheRisolte(giornataCorrente)).filter((s) => s.attiva);
}
