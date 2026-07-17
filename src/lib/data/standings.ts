import { legaData } from "@/lib/mock";
import type { RigaClassifica } from "@/lib/types";

export function getClassificaGenerale(): RigaClassifica[] {
  return legaData().classifica;
}

export function getClassificaCasa(): RigaClassifica[] {
  return [...legaData().classifica]
    .sort((a, b) => b.puntiCasa - a.puntiCasa)
    .map((r, i) => ({ ...r, posizione: i + 1 }));
}

export function getClassificaTrasferta(): RigaClassifica[] {
  return [...legaData().classifica]
    .sort((a, b) => b.puntiTrasferta - a.puntiTrasferta)
    .map((r, i) => ({ ...r, posizione: i + 1 }));
}

export function getMigliorAttacco(): RigaClassifica[] {
  return [...legaData().classifica].sort((a, b) => b.golFatti - a.golFatti);
}

export function getMigliorDifesa(): RigaClassifica[] {
  return [...legaData().classifica].sort((a, b) => a.golSubiti - b.golSubiti);
}

export function getClassificaFairPlay(): RigaClassifica[] {
  return [...legaData().classifica].sort(
    (a, b) => a.ammonizioni + a.espulsioni * 3 - (b.ammonizioni + b.espulsioni * 3)
  );
}

export function getFormaSquadra(squadraId: string) {
  return legaData().classifica.find((r) => r.squadraId === squadraId)?.ultimeCinque ?? [];
}

export function getRigaClassifica(squadraId: string) {
  return legaData().classifica.find((r) => r.squadraId === squadraId);
}
