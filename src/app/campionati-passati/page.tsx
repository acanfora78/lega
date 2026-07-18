import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { PitchBackdrop, StadiumLights } from "@/components/brand/pitch-art";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCampionatiPassati, getTitoliPerSquadra } from "@/lib/data/storico";
import { Trophy, ChevronRight, Archive } from "lucide-react";

export const metadata: Metadata = { title: "Campionati Passati" };

export default function CampionatiPassatiPage() {
  const campionati = getCampionatiPassati();
  const titoli = getTitoliPerSquadra();

  return (
    <Container className="flex flex-col gap-8 pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
        <PitchBackdrop />
        <StadiumLights />
        <div className="relative flex flex-col items-center gap-3 px-6 py-14 text-center sm:py-20">
          <Archive className="size-8 text-gold-bright" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-bright">Archivio Storico</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">Campionati Passati</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Ogni stagione conclusa della Lega, con classifiche finali e classifiche marcatori consultabili in
            qualsiasi momento.
          </p>
        </div>
      </div>

      {titoli.length > 0 && (
        <section className="flex flex-wrap gap-2">
          {titoli.map((t) => (
            <span key={t.squadra} className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-semibold">
              <Trophy className="size-3.5 text-gold-bright" />
              {t.squadra}
              <span className="text-muted-foreground">× {t.titoli}</span>
            </span>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-4">
        {campionati.map((c) => {
          const capocannoniere = c.marcatori[0];
          return (
            <Link key={c.id} href={`/campionati-passati/${c.id}`}>
              <Card className="transition-colors hover:border-gold/30">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Badge variant="gold" className="mb-2">
                      Stagione {c.stagione}
                    </Badge>
                    <p className="font-display text-xl font-bold">{c.nomeCompetizione}</p>
                    {c.vincitore && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Trophy className="size-4 text-gold-bright" /> Campione: <span className="font-semibold text-foreground">{c.vincitore}</span>
                      </p>
                    )}
                    {capocannoniere && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Capocannoniere: <span className="font-semibold text-foreground">{capocannoniere.giocatore.replace(/^\*+/, "")}</span> ({capocannoniere.gol} gol)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary-glow">
                    Vedi stagione <ChevronRight className="size-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </Container>
  );
}
