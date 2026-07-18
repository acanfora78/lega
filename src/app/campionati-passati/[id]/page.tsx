import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { PitchBackdrop } from "@/components/brand/pitch-art";
import { StandingsTableStorica } from "@/components/storico/standings-table-storica";
import { MarcatoriStorici } from "@/components/storico/marcatori-storici";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCampionatiPassati, getCampionatoPassatoById } from "@/lib/data/storico";
import { Trophy, AlertTriangle } from "lucide-react";

export function generateStaticParams() {
  return getCampionatiPassati().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = getCampionatoPassatoById(id);
  return c ? { title: `Stagione ${c.stagione}` } : {};
}

export default async function CampionatoPassatoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campionato = getCampionatoPassatoById(id);
  if (!campionato) notFound();

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
        <div className="bg-aurora absolute inset-0 opacity-50 mix-blend-screen" />
        <PitchBackdrop />
        <div className="relative flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Badge variant="gold">Stagione {campionato.stagione}</Badge>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{campionato.nomeCompetizione}</h1>
          {campionato.vincitore && (
            <p className="flex items-center gap-2 text-lg font-semibold text-gold-bright">
              <Trophy className="size-5" /> {campionato.vincitore}
            </p>
          )}
        </div>
      </div>

      {campionato.note && (
        <Card className="border-warning/25 bg-warning/5">
          <CardContent className="flex items-start gap-2.5 p-4 text-xs text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{campionato.note}</p>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Classifica finale</h2>
        <StandingsTableStorica righe={campionato.classificaFinale} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          Classifica marcatori
          {campionato.marcatoriIncompleti && <span className="ml-2 text-xs font-normal text-muted-foreground">(parziale)</span>}
        </h2>
        <MarcatoriStorici marcatori={campionato.marcatori} />
      </section>

      {(campionato.mvp || campionato.fairPlaySquadra || (campionato.premi && campionato.premi.length > 0)) && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Premi di stagione</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {campionato.mvp && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">MVP Stagione</p>
                  <p className="mt-1 font-display text-lg font-bold">{campionato.mvp}</p>
                </CardContent>
              </Card>
            )}
            {campionato.fairPlaySquadra && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Fair Play</p>
                  <p className="mt-1 font-display text-lg font-bold">{campionato.fairPlaySquadra}</p>
                </CardContent>
              </Card>
            )}
            {campionato.premi?.map((p) => (
              <Card key={p.titolo}>
                <CardContent className="p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.titolo}</p>
                  <p className="mt-1 font-display text-lg font-bold">{p.assegnatario}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Galleria fotografica</h2>
        {campionato.galleryUrls.length === 0 ? (
          <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
            Nessuna foto ancora caricata per questa stagione. L&apos;area organizzatore potrà aggiungerle dal pannello.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {campionato.galleryUrls.map((_, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-2xl bg-pitch-gradient glass">
                <PitchBackdrop />
              </div>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
