import { legaData } from "@/lib/mock";
import type { Articolo } from "@/lib/types";

export async function getArticoli(): Promise<Articolo[]> {
  return [...(await legaData()).articoli].sort(
    (a, b) => new Date(b.pubblicatoIl).getTime() - new Date(a.pubblicatoIl).getTime()
  );
}

export async function getArticoloBySlug(slug: string): Promise<Articolo | undefined> {
  return (await legaData()).articoli.find((a) => a.slug === slug);
}

export async function getArticoliInEvidenza(limit = 3): Promise<Articolo[]> {
  const articoli = await getArticoli();
  return articoli
    .filter((a) => a.in_evidenza)
    .slice(0, limit)
    .concat(articoli.filter((a) => !a.in_evidenza))
    .slice(0, limit);
}

export async function getComunicati(): Promise<Articolo[]> {
  return (await getArticoli()).filter((a) => a.categoria === "comunicato" || a.categoria === "disciplinare");
}

export async function getArticoliDellaSquadra(squadraId: string): Promise<Articolo[]> {
  return (await getArticoli()).filter((a) => a.squadreCorrelate?.includes(squadraId));
}
