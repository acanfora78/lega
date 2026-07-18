import { legaData } from "@/lib/mock";
import type { Partita } from "@/lib/types";

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function getPartite(): Partita[] {
  return legaData().partite;
}

export function getPartitaById(id: string): Partita | undefined {
  return legaData().partite.find((p) => p.id === id);
}

export function getPartiteDiOggi(): Partita[] {
  return getPartite()
    .filter((p) => isSameDay(new Date(p.dataOra), new Date()))
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());
}

export function getPartitaLive(): Partita | undefined {
  return getPartite().find((p) => p.stato === "live" || p.stato === "intervallo");
}

export function getProssimaPartita(): Partita | undefined {
  return getPartite()
    .filter((p) => p.stato === "programmata")
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime())[0];
}

export function getUltimiRisultati(limit = 6): Partita[] {
  return getPartite()
    .filter((p) => p.stato === "conclusa")
    .sort((a, b) => new Date(b.dataOra).getTime() - new Date(a.dataOra).getTime())
    .slice(0, limit);
}

export function getPartitePerGiornata(giornata: number): Partita[] {
  return getPartite()
    .filter((p) => p.giornata === giornata)
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());
}

export function getGiornataCorrente(): number {
  const live = getPartitaLive();
  if (live) return live.giornata;
  const oggi = getPartiteDiOggi();
  if (oggi.length) return oggi[0].giornata;
  const prossima = getProssimaPartita();
  if (prossima) return prossima.giornata;
  const tutte = getPartite();
  return tutte.length ? Math.max(...tutte.map((p) => p.giornata)) : 0;
}

export function getPartitaDellaSettimana(): Partita | undefined {
  return getPartite().find((p) => p.partitaDellaSettimana);
}

export function getPartiteDellaSquadra(squadraId: string): Partita[] {
  return getPartite()
    .filter((p) => p.squadraCasaId === squadraId || p.squadraTrasfertaId === squadraId)
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());
}

export function getProssimeGiornate(limit = 8): Partita[] {
  return getPartite()
    .filter((p) => p.stato === "programmata")
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime())
    .slice(0, limit);
}

export function getUltimeCinquePartiteSquadra(squadraId: string): Partita[] {
  return getPartiteDellaSquadra(squadraId)
    .filter((p) => p.stato === "conclusa")
    .slice(-5)
    .reverse();
}
