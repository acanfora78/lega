import { legaData } from "@/lib/mock";
import type { Giocatore } from "@/lib/types";

export function getGiocatori(): Giocatore[] {
  return legaData().giocatori;
}

export function getGiocatoreById(id: string): Giocatore | undefined {
  return legaData().giocatori.find((g) => g.id === id);
}

export function getGiocatoriDellaSquadra(squadraId: string): Giocatore[] {
  return legaData()
    .giocatori.filter((g) => g.squadraId === squadraId)
    .sort((a, b) => a.numeroMaglia - b.numeroMaglia);
}

function statoStagioneCorrente(g: Giocatore) {
  return g.statistiche.find((s) => s.stagioneId === legaData().stagioneAttualeId);
}

export function getClassificaMarcatori(limit = 10) {
  return getGiocatori()
    .map((g) => ({ giocatore: g, stat: statoStagioneCorrente(g) }))
    .filter((x) => (x.stat?.goal ?? 0) > 0)
    .sort((a, b) => (b.stat!.goal - a.stat!.goal) || (b.stat!.assist - a.stat!.assist))
    .slice(0, limit);
}

export function getClassificaAssist(limit = 10) {
  return getGiocatori()
    .map((g) => ({ giocatore: g, stat: statoStagioneCorrente(g) }))
    .filter((x) => (x.stat?.assist ?? 0) > 0)
    .sort((a, b) => b.stat!.assist - a.stat!.assist)
    .slice(0, limit);
}

export function getClassificaAmmonizioni(limit = 10) {
  return getGiocatori()
    .map((g) => ({ giocatore: g, stat: statoStagioneCorrente(g) }))
    .filter((x) => (x.stat?.ammonizioni ?? 0) > 0)
    .sort((a, b) => b.stat!.ammonizioni - a.stat!.ammonizioni)
    .slice(0, limit);
}

export function getClassificaEspulsioni(limit = 10) {
  return getGiocatori()
    .map((g) => ({ giocatore: g, stat: statoStagioneCorrente(g) }))
    .filter((x) => (x.stat?.espulsioni ?? 0) > 0)
    .sort((a, b) => b.stat!.espulsioni - a.stat!.espulsioni)
    .slice(0, limit);
}

export function getClassificaMvp(limit = 10) {
  return getGiocatori()
    .map((g) => ({ giocatore: g, stat: statoStagioneCorrente(g) }))
    .filter((x) => (x.stat?.mvp ?? 0) > 0)
    .sort((a, b) => b.stat!.mvp - a.stat!.mvp)
    .slice(0, limit);
}

export function getClassificaPresenze(limit = 10) {
  return getGiocatori()
    .map((g) => ({ giocatore: g, stat: statoStagioneCorrente(g) }))
    .filter((x) => (x.stat?.presenze ?? 0) > 0)
    .sort((a, b) => b.stat!.presenze - a.stat!.presenze)
    .slice(0, limit);
}

export function getClassificaCleanSheet(limit = 10) {
  return getGiocatori()
    .filter((g) => g.ruolo === "Portiere")
    .map((g) => ({ giocatore: g, stat: statoStagioneCorrente(g) }))
    .filter((x) => (x.stat?.cleanSheet ?? 0) > 0)
    .sort((a, b) => (b.stat!.cleanSheet ?? 0) - (a.stat!.cleanSheet ?? 0))
    .slice(0, limit);
}

export function getMigliorPortiere(limit = 10) {
  return getGiocatori()
    .filter((g) => g.ruolo === "Portiere")
    .map((g) => ({ giocatore: g, stat: statoStagioneCorrente(g) }))
    .filter((x) => (x.stat?.presenze ?? 0) > 0)
    .sort((a, b) => (a.stat!.golSubiti ?? 99) / a.stat!.presenze - (b.stat!.golSubiti ?? 99) / b.stat!.presenze)
    .slice(0, limit);
}

export function getStatisticaStagionale(giocatoreId: string) {
  const g = getGiocatoreById(giocatoreId);
  return g ? statoStagioneCorrente(g) : undefined;
}
