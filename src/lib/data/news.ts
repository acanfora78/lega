import { legaData } from "@/lib/mock";
import type { Articolo } from "@/lib/types";

export function getArticoli(): Articolo[] {
  return [...legaData().articoli].sort(
    (a, b) => new Date(b.pubblicatoIl).getTime() - new Date(a.pubblicatoIl).getTime()
  );
}

export function getArticoloBySlug(slug: string): Articolo | undefined {
  return legaData().articoli.find((a) => a.slug === slug);
}

export function getArticoliInEvidenza(limit = 3): Articolo[] {
  return getArticoli()
    .filter((a) => a.in_evidenza)
    .slice(0, limit)
    .concat(getArticoli().filter((a) => !a.in_evidenza))
    .slice(0, limit);
}

export function getComunicati(): Articolo[] {
  return getArticoli().filter((a) => a.categoria === "comunicato" || a.categoria === "disciplinare");
}

export function getArticoliDellaSquadra(squadraId: string): Articolo[] {
  return getArticoli().filter((a) => a.squadreCorrelate?.includes(squadraId));
}
