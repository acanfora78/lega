import { legaData } from "@/lib/mock";

export function getPremiSettimanali() {
  return legaData().premiSettimanali;
}

export function getMvpUltimaGiornata() {
  return legaData().premiSettimanali.find((p) => p.tipo === "mvp_giornata");
}

export function getAlboOro() {
  return [...legaData().alboOro].sort((a, b) => b.stagioneId.localeCompare(a.stagioneId));
}

export function getStagioni() {
  return legaData().stagioni;
}

export function getStagioneAttuale() {
  return legaData().stagioni.find((s) => s.attuale)!;
}

export function getStagioneById(id: string) {
  return legaData().stagioni.find((s) => s.id === id);
}
