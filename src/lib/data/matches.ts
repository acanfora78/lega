import { legaData } from "@/lib/mock";
import type { Partita } from "@/lib/types";

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Solo le partite del campionato principale (nessun competizioneId): questa
 * funzione alimenta home, /partite, le pagine squadra e l'admin partite, che
 * sono sempre stati "il campionato" per definizione. Le partite di una
 * competizione aggiuntiva hanno le proprie pagine dedicate
 * (getPartiteCompetizione in src/lib/data/competizioni.ts) e non devono
 * comparire mischiate qui.
 */
export async function getPartite(): Promise<Partita[]> {
  return (await legaData()).partite.filter((p) => !p.competizioneId);
}

/** Cerca per id su TUTTE le partite, competizioni incluse: è la funzione dietro alla pagina di dettaglio/gestione di una singola partita, che deve funzionare identica per qualunque partita. */
export async function getPartitaById(id: string): Promise<Partita | undefined> {
  return (await legaData()).partite.find((p) => p.id === id);
}

export async function getPartiteDiOggi(): Promise<Partita[]> {
  return (await getPartite())
    .filter((p) => isSameDay(new Date(p.dataOra), new Date()))
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());
}

export async function getPartitaLive(): Promise<Partita | undefined> {
  return (await getPartite()).find((p) => p.stato === "live" || p.stato === "intervallo");
}

export async function getProssimaPartita(): Promise<Partita | undefined> {
  return (await getPartite())
    .filter((p) => p.stato === "programmata")
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime())[0];
}

export async function getUltimiRisultati(limit = 6): Promise<Partita[]> {
  return (await getPartite())
    .filter((p) => p.stato === "conclusa")
    .sort((a, b) => new Date(b.dataOra).getTime() - new Date(a.dataOra).getTime())
    .slice(0, limit);
}

export async function getPartitePerGiornata(giornata: number): Promise<Partita[]> {
  return (await getPartite())
    .filter((p) => p.giornata === giornata)
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());
}

export async function getGiornataCorrente(): Promise<number> {
  const live = await getPartitaLive();
  if (live) return live.giornata;
  const oggi = await getPartiteDiOggi();
  if (oggi.length) return oggi[0].giornata;
  const prossima = await getProssimaPartita();
  if (prossima) return prossima.giornata;
  const tutte = await getPartite();
  return tutte.length ? Math.max(...tutte.map((p) => p.giornata)) : 0;
}

export async function getPartitaDellaSettimana(): Promise<Partita | undefined> {
  return (await getPartite()).find((p) => p.partitaDellaSettimana);
}

export async function getPartiteDellaSquadra(squadraId: string): Promise<Partita[]> {
  return (await getPartite())
    .filter((p) => p.squadraCasaId === squadraId || p.squadraTrasfertaId === squadraId)
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());
}

export async function getProssimeGiornate(limit = 8): Promise<Partita[]> {
  return (await getPartite())
    .filter((p) => p.stato === "programmata")
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime())
    .slice(0, limit);
}

export async function getUltimeCinquePartiteSquadra(squadraId: string): Promise<Partita[]> {
  return (await getPartiteDellaSquadra(squadraId))
    .filter((p) => p.stato === "conclusa")
    .slice(-5)
    .reverse();
}
