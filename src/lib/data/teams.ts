import { legaData } from "@/lib/mock";
import type { Squadra } from "@/lib/types";

export async function getSquadre(): Promise<Squadra[]> {
  return (await legaData()).squadre;
}

export async function getSquadraById(id: string): Promise<Squadra | undefined> {
  return (await legaData()).squadre.find((s) => s.id === id);
}

export async function getSquadraBySlug(slug: string): Promise<Squadra | undefined> {
  return (await legaData()).squadre.find((s) => s.slug === slug);
}

export async function getSponsorDellaSquadra(squadraId: string) {
  const { sponsor, squadre } = await legaData();
  if (sponsor.length === 0) return [];
  const idx = squadre.findIndex((s) => s.id === squadraId);
  // distribuzione deterministica: ogni squadra ha al massimo 2 sponsor
  const scelti = [sponsor[idx % sponsor.length], sponsor[(idx + 3) % sponsor.length]];
  return scelti.filter((s, i, arr) => s && arr.findIndex((x) => x.id === s.id) === i);
}
