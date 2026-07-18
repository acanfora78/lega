import { legaData } from "@/lib/mock";

export async function getPremiSettimanali() {
  return (await legaData()).premiSettimanali;
}

export async function getMvpUltimaGiornata() {
  return (await legaData()).premiSettimanali.find((p) => p.tipo === "mvp_giornata");
}

export async function getStagioni() {
  return (await legaData()).stagioni;
}

export async function getStagioneAttuale() {
  return (await legaData()).stagioni.find((s) => s.attuale)!;
}

export async function getStagioneById(id: string) {
  return (await legaData()).stagioni.find((s) => s.id === id);
}

export async function getNotifiche() {
  const { notifiche } = await legaData();
  return [...notifiche].sort((a, b) => new Date(b.creataIl).getTime() - new Date(a.creataIl).getTime());
}

export async function getImpostazioni() {
  return (await legaData()).impostazioni;
}
