import { legaData } from "@/lib/mock";
import type { RigaClassifica } from "@/lib/types";

export async function getCompetizioni() {
  return (await legaData()).competizioni;
}

export async function getCompetizioneById(id: string) {
  return (await legaData()).competizioni.find((c) => c.id === id);
}

export async function getCompetizioneBySlug(slug: string) {
  return (await legaData()).competizioni.find((c) => c.slug === slug);
}

/** Classifica scoped di una competizione (o di una sua fase a girone). Vuota per le fasi a eliminazione diretta, che non hanno una classifica. */
export async function getClassificaCompetizione(competizioneId: string, faseId?: string): Promise<RigaClassifica[]> {
  const chiave = faseId ? `${competizioneId}:${faseId}` : competizioneId;
  return (await legaData()).classificheCompetizioni[chiave] ?? [];
}

export async function getPartiteCompetizione(competizioneId: string, faseId?: string) {
  const { partite } = await legaData();
  return partite
    .filter((p) => p.competizioneId === competizioneId && (faseId ? p.faseId === faseId : true))
    .sort((a, b) => new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime());
}
