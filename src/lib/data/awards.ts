import { legaData } from "@/lib/mock";

export function getPremiSettimanali() {
  return legaData().premiSettimanali;
}

export function getMvpUltimaGiornata() {
  return legaData().premiSettimanali.find((p) => p.tipo === "mvp_giornata");
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

export function getNotifiche() {
  return [...legaData().notifiche].sort((a, b) => new Date(b.creataIl).getTime() - new Date(a.creataIl).getTime());
}

export function getImpostazioni() {
  return legaData().impostazioni;
}
