import { legaData } from "@/lib/mock";
import type { Sponsor } from "@/lib/types";

export async function getSponsor(): Promise<Sponsor[]> {
  return (await legaData()).sponsor;
}

export async function getSponsorPerLivello(livello: Sponsor["livello"]): Promise<Sponsor[]> {
  return (await getSponsor()).filter((s) => s.livello === livello);
}
