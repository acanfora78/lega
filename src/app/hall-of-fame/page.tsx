import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCampionatiPassati, getTitoliPerSquadra, getRecordMarcatoreStorico } from "@/lib/data/storico";
import { Award, ChevronRight, Crown, Shield, Trophy } from "lucide-react";

export const metadata: Metadata = { title: "Hall of Fame" };

export default function HallOfFamePage() {
  const campionati = getCampionatiPassati();
  const titoli = getTitoliPerSquadra();
  const squadraPiuTitolata = titoli[0];
  const recordGol = getRecordMarcatoreStorico();

  return (
    <Container className="flex flex-col gap-8 pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient p-8 text-center sm:p-12">
        <div className="bg-aurora absolute inset-0 opacity-50 mix-blend-screen" />
        <div className="relative">
          <Crown className="mx-auto mb-3 size-9 text-gold-bright" />
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-bright">Albo d&apos;Oro</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">Hall of Fame</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            La storia della Lega si scrive stagione dopo stagione. Qui vivono per sempre i campioni e i capocannonieri
            che hanno reso grande il campionato.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {squadraPiuTitolata && (
          <RecordCard icon={Trophy} label="Squadra più titolata" value={squadraPiuTitolata.squadra} sub={`${squadraPiuTitolata.titoli} titoli vinti`} />
        )}
        {recordGol && (
          <RecordCard
            icon={Award}
            label="Record marcatore di stagione"
            value={recordGol.giocatore.replace(/^\*+/, "")}
            sub={`${recordGol.gol} gol — stagione ${recordGol.stagione}`}
          />
        )}
        <RecordCard icon={Shield} label="Stagioni in archivio" value={String(campionati.length)} sub="Campionati passati disponibili" />
      </div>

      <section className="flex flex-col gap-4">
        {campionati.map((c) => (
          <Link key={c.id} href={`/campionati-passati/${c.id}`}>
            <Card className="overflow-hidden transition-colors hover:border-gold/30">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Badge variant="gold" className="mb-2 px-3 py-1 text-sm">
                    Stagione {c.stagione}
                  </Badge>
                  {c.vincitore && (
                    <p className="font-display text-lg font-bold">
                      <Trophy className="mr-1.5 inline size-4 text-gold-bright" />
                      {c.vincitore}
                    </p>
                  )}
                  {c.marcatori[0] && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Capocannoniere: <span className="font-semibold text-foreground">{c.marcatori[0].giocatore.replace(/^\*+/, "")}</span> ({c.marcatori[0].gol} gol)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary-glow">
                  Vedi stagione <ChevronRight className="size-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </Container>
  );
}

function RecordCard({ icon: Icon, label, value, sub }: { icon: typeof Trophy; label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
        <Icon className="size-6 text-gold-bright" />
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-display text-lg font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
