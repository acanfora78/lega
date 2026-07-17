import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { SearchExplorer } from "@/components/shared/search-explorer";

export const metadata: Metadata = { title: "Ricerca" };

export default function RicercaPage() {
  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Ricerca globale</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Trova tutto il campionato</h1>
        <p className="mt-1 text-sm text-muted-foreground">Squadre, giocatori, partite, news e sponsor: tutto a portata di ricerca.</p>
      </div>
      <SearchExplorer />
    </Container>
  );
}
