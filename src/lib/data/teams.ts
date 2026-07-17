import { legaData } from "@/lib/mock";
import type { Squadra } from "@/lib/types";

export function getSquadre(): Squadra[] {
  return legaData().squadre;
}

export function getSquadraById(id: string): Squadra | undefined {
  return legaData().squadre.find((s) => s.id === id);
}

export function getSquadraBySlug(slug: string): Squadra | undefined {
  return legaData().squadre.find((s) => s.slug === slug);
}

export function getSponsorDellaSquadra(squadraId: string) {
  const { sponsor } = legaData();
  const idx = legaData().squadre.findIndex((s) => s.id === squadraId);
  // distribuzione deterministica: ogni squadra ha 2 sponsor
  return [sponsor[idx % sponsor.length], sponsor[(idx + 3) % sponsor.length]];
}
