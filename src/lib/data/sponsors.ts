import { legaData } from "@/lib/mock";
import type { Sponsor } from "@/lib/types";

export function getSponsor(): Sponsor[] {
  return legaData().sponsor;
}

export function getSponsorPerLivello(livello: Sponsor["livello"]): Sponsor[] {
  return getSponsor().filter((s) => s.livello === livello);
}
