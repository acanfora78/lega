import { legaData } from "@/lib/mock";
import { calcolaStatisticheDerivate, type StatisticheDerivate } from "@/lib/statistiche-derivate";
import type { Giocatore, StatisticheStagionaliGiocatore } from "@/lib/types";

export async function getGiocatori(): Promise<Giocatore[]> {
  return (await legaData()).giocatori;
}

export async function getGiocatoreById(id: string): Promise<Giocatore | undefined> {
  return (await legaData()).giocatori.find((g) => g.id === id);
}

export async function getGiocatoriDellaSquadra(squadraId: string): Promise<Giocatore[]> {
  return (await legaData()).giocatori
    .filter((g) => g.squadraId === squadraId)
    .sort((a, b) => a.numeroMaglia - b.numeroMaglia);
}

// ---------------------------------------------------------------------------
// CLASSIFICHE INDIVIDUALI
// ---------------------------------------------------------------------------
// Tutte partono da src/lib/statistiche-derivate.ts, cioè dagli eventi delle
// partite concluse. Prima leggevano `Giocatore.statistiche`, un campo che
// nessuna route ha mai scritto: marcatori, assist, presenze e MVP restavano
// perciò vuoti anche con il tabellino compilato. La forma del risultato
// ({ giocatore, stat }) è rimasta identica, così le pagine che le consumano
// non hanno dovuto cambiare.
// ---------------------------------------------------------------------------

export interface VoceClassificaGiocatore {
  giocatore: Giocatore;
  stat: StatisticheStagionaliGiocatore;
}

/** Adatta le statistiche derivate alla forma storica consumata dai componenti. */
function comeStatStagionale(derivata: StatisticheDerivate, stagioneId: string): StatisticheStagionaliGiocatore {
  return {
    stagioneId,
    squadraId: derivata.squadraId,
    presenze: derivata.presenze,
    minutiGiocati: 0,
    goal: derivata.goal,
    assist: derivata.assist,
    ammonizioni: derivata.ammonizioni,
    espulsioni: derivata.espulsioni,
    mediaVoto: derivata.mediaVoto,
    mvp: derivata.mvp,
    cleanSheet: derivata.cleanSheet,
    golSubiti: derivata.golSubiti,
  };
}

/**
 * Statistiche derivate di tutti i giocatori, sulle sole partite del campionato
 * principale della stagione in corso (le competizioni aggiuntive hanno le
 * proprie pagine e non devono confluire nelle classifiche del campionato).
 */
async function statisticheStagione(): Promise<VoceClassificaGiocatore[]> {
  const { partite, giocatori, stagioneAttualeId } = await legaData();
  const delCampionato = partite.filter((p) => !p.competizioneId && p.stagioneId === stagioneAttualeId);
  const derivate = calcolaStatisticheDerivate(delCampionato, giocatori);

  // calcolaStatisticheDerivate restituisce una voce per ogni giocatore
  // passato, anche a zero: il filter scarta solo eventuali disallineamenti.
  return giocatori
    .map((giocatore) => {
      const derivata = derivate.get(giocatore.id);
      return derivata ? { giocatore, stat: comeStatStagionale(derivata, stagioneAttualeId) } : undefined;
    })
    .filter((v): v is VoceClassificaGiocatore => v !== undefined);
}

async function classificaPer(
  valore: (s: StatisticheStagionaliGiocatore) => number,
  limit: number,
  filtro: (v: VoceClassificaGiocatore) => boolean = () => true
): Promise<VoceClassificaGiocatore[]> {
  return (await statisticheStagione())
    .filter((v) => filtro(v) && valore(v.stat) > 0)
    .sort((a, b) => valore(b.stat) - valore(a.stat))
    .slice(0, limit);
}

export async function getClassificaMarcatori(limit = 10) {
  return (await statisticheStagione())
    .filter((v) => v.stat.goal > 0)
    .sort((a, b) => b.stat.goal - a.stat.goal || b.stat.assist - a.stat.assist)
    .slice(0, limit);
}

export async function getClassificaAssist(limit = 10) {
  return classificaPer((s) => s.assist, limit);
}

export async function getClassificaAmmonizioni(limit = 10) {
  return classificaPer((s) => s.ammonizioni, limit);
}

export async function getClassificaEspulsioni(limit = 10) {
  return classificaPer((s) => s.espulsioni, limit);
}

export async function getClassificaMvp(limit = 10) {
  return classificaPer((s) => s.mvp, limit);
}

export async function getClassificaPresenze(limit = 10) {
  return classificaPer((s) => s.presenze, limit);
}

export async function getClassificaCleanSheet(limit = 10) {
  return classificaPer((s) => s.cleanSheet ?? 0, limit, (v) => v.giocatore.ruolo === "Portiere");
}

/** Portieri ordinati per media gol subiti a partita (meno è meglio). */
export async function getMigliorPortiere(limit = 10) {
  return (await statisticheStagione())
    .filter((v) => v.giocatore.ruolo === "Portiere" && v.stat.presenze > 0)
    .sort((a, b) => (a.stat.golSubiti ?? 0) / a.stat.presenze - (b.stat.golSubiti ?? 0) / b.stat.presenze)
    .slice(0, limit);
}

export async function getStatisticaStagionale(giocatoreId: string) {
  return (await statisticheStagione()).find((v) => v.giocatore.id === giocatoreId)?.stat;
}
