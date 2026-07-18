import { legaData } from "@/lib/mock";
import type { RigaClassifica } from "@/lib/types";

export async function getClassificaGenerale(): Promise<RigaClassifica[]> {
  return (await legaData()).classifica;
}

export async function getClassificaCasa(): Promise<RigaClassifica[]> {
  return [...(await legaData()).classifica]
    .sort((a, b) => b.puntiCasa - a.puntiCasa)
    .map((r, i) => ({ ...r, posizione: i + 1 }));
}

export async function getClassificaTrasferta(): Promise<RigaClassifica[]> {
  return [...(await legaData()).classifica]
    .sort((a, b) => b.puntiTrasferta - a.puntiTrasferta)
    .map((r, i) => ({ ...r, posizione: i + 1 }));
}

export async function getMigliorAttacco(): Promise<RigaClassifica[]> {
  return [...(await legaData()).classifica].sort((a, b) => b.golFatti - a.golFatti);
}

export async function getMigliorDifesa(): Promise<RigaClassifica[]> {
  return [...(await legaData()).classifica].sort((a, b) => a.golSubiti - b.golSubiti);
}

export async function getClassificaFairPlay(): Promise<RigaClassifica[]> {
  return [...(await legaData()).classifica].sort(
    (a, b) => a.ammonizioni + a.espulsioni * 3 - (b.ammonizioni + b.espulsioni * 3)
  );
}

export async function getFormaSquadra(squadraId: string) {
  return (await legaData()).classifica.find((r) => r.squadraId === squadraId)?.ultimeCinque ?? [];
}

export async function getRigaClassifica(squadraId: string) {
  return (await legaData()).classifica.find((r) => r.squadraId === squadraId);
}
