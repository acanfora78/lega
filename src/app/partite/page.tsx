import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { PartiteExplorer } from "@/components/match/partite-explorer";
import { getPartite, getSquadre } from "@/lib/data";

export const metadata: Metadata = { title: "Partite" };

export default async function PartitePage() {
  const [partite, squadre] = await Promise.all([getPartite(), getSquadre()]);

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Calendario &amp; risultati</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Partite</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tutte le sfide della Lega Calcio Over 40: risultati, dirette e programma completo.
        </p>
      </div>
      <PartiteExplorer partite={partite} squadre={squadre} />
    </Container>
  );
}
