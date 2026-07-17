import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { TeamCard } from "@/components/team/team-card";
import { getSquadre, getRigaClassifica } from "@/lib/data";

export const metadata: Metadata = { title: "Squadre" };

export default function SquadrePage() {
  const squadre = getSquadre();

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Stagione 2025/2026</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Le Squadre della Lega</h1>
        <p className="mt-1 text-sm text-muted-foreground">Otto club, una sola passione: il calcio Over 40 al Campo Santa Teresa.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {squadre.map((s) => (
          <TeamCard key={s.id} squadra={s} riga={getRigaClassifica(s.id)} />
        ))}
      </div>
    </Container>
  );
}
