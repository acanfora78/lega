import { legaData } from "@/lib/mock";
import type { Giocatore } from "@/lib/types";

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

async function statoStagioneCorrente(g: Giocatore) {
  const { stagioneAttualeId } = await legaData();
  return g.statistiche.find((s) => s.stagioneId === stagioneAttualeId);
}

export async function getClassificaMarcatori(limit = 10) {
  const giocatori = await getGiocatori();
  const conStat = await Promise.all(giocatori.map(async (g) => ({ giocatore: g, stat: await statoStagioneCorrente(g) })));
  return conStat
    .filter((x) => (x.stat?.goal ?? 0) > 0)
    .sort((a, b) => (b.stat!.goal - a.stat!.goal) || (b.stat!.assist - a.stat!.assist))
    .slice(0, limit);
}

export async function getClassificaAssist(limit = 10) {
  const giocatori = await getGiocatori();
  const conStat = await Promise.all(giocatori.map(async (g) => ({ giocatore: g, stat: await statoStagioneCorrente(g) })));
  return conStat
    .filter((x) => (x.stat?.assist ?? 0) > 0)
    .sort((a, b) => b.stat!.assist - a.stat!.assist)
    .slice(0, limit);
}

export async function getClassificaAmmonizioni(limit = 10) {
  const giocatori = await getGiocatori();
  const conStat = await Promise.all(giocatori.map(async (g) => ({ giocatore: g, stat: await statoStagioneCorrente(g) })));
  return conStat
    .filter((x) => (x.stat?.ammonizioni ?? 0) > 0)
    .sort((a, b) => b.stat!.ammonizioni - a.stat!.ammonizioni)
    .slice(0, limit);
}

export async function getClassificaEspulsioni(limit = 10) {
  const giocatori = await getGiocatori();
  const conStat = await Promise.all(giocatori.map(async (g) => ({ giocatore: g, stat: await statoStagioneCorrente(g) })));
  return conStat
    .filter((x) => (x.stat?.espulsioni ?? 0) > 0)
    .sort((a, b) => b.stat!.espulsioni - a.stat!.espulsioni)
    .slice(0, limit);
}

export async function getClassificaMvp(limit = 10) {
  const giocatori = await getGiocatori();
  const conStat = await Promise.all(giocatori.map(async (g) => ({ giocatore: g, stat: await statoStagioneCorrente(g) })));
  return conStat
    .filter((x) => (x.stat?.mvp ?? 0) > 0)
    .sort((a, b) => b.stat!.mvp - a.stat!.mvp)
    .slice(0, limit);
}

export async function getClassificaPresenze(limit = 10) {
  const giocatori = await getGiocatori();
  const conStat = await Promise.all(giocatori.map(async (g) => ({ giocatore: g, stat: await statoStagioneCorrente(g) })));
  return conStat
    .filter((x) => (x.stat?.presenze ?? 0) > 0)
    .sort((a, b) => b.stat!.presenze - a.stat!.presenze)
    .slice(0, limit);
}

export async function getClassificaCleanSheet(limit = 10) {
  const giocatori = (await getGiocatori()).filter((g) => g.ruolo === "Portiere");
  const conStat = await Promise.all(giocatori.map(async (g) => ({ giocatore: g, stat: await statoStagioneCorrente(g) })));
  return conStat
    .filter((x) => (x.stat?.cleanSheet ?? 0) > 0)
    .sort((a, b) => (b.stat!.cleanSheet ?? 0) - (a.stat!.cleanSheet ?? 0))
    .slice(0, limit);
}

export async function getMigliorPortiere(limit = 10) {
  const giocatori = (await getGiocatori()).filter((g) => g.ruolo === "Portiere");
  const conStat = await Promise.all(giocatori.map(async (g) => ({ giocatore: g, stat: await statoStagioneCorrente(g) })));
  return conStat
    .filter((x) => (x.stat?.presenze ?? 0) > 0)
    .sort((a, b) => (a.stat!.golSubiti ?? 99) / a.stat!.presenze - (b.stat!.golSubiti ?? 99) / b.stat!.presenze)
    .slice(0, limit);
}

export async function getStatisticaStagionale(giocatoreId: string) {
  const g = await getGiocatoreById(giocatoreId);
  return g ? statoStagioneCorrente(g) : undefined;
}
