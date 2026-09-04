import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { TeamCrest } from "@/components/brand/team-crest";
import { PitchBackdrop, StadiumLights } from "@/components/brand/pitch-art";
import { TeamRoster } from "@/components/team/team-roster";
import { MatchCard } from "@/components/match/match-card";
import { FormBadges } from "@/components/shared/form-badges";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getSquadre,
  getSquadraBySlug,
  getSquadraById,
  getGiocatoriDellaSquadra,
  getRigaClassifica,
  getUltimeCinquePartiteSquadra,
  getSponsorDellaSquadra,
} from "@/lib/data";
import { getTitoliPerSquadra } from "@/lib/data/storico";
import { Calendar, MapPin, Shield, Trophy, Users } from "lucide-react";

export async function generateStaticParams() {
  return (await getSquadre()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const squadra = await getSquadraBySlug(slug);
  return squadra ? { title: squadra.nome } : {};
}

export default async function SquadraDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const squadra = await getSquadraBySlug(slug);
  if (!squadra) notFound();

  const [giocatori, riga, ultime, sponsor] = await Promise.all([
    getGiocatoriDellaSquadra(squadra.id),
    getRigaClassifica(squadra.id),
    getUltimeCinquePartiteSquadra(squadra.id),
    getSponsorDellaSquadra(squadra.id),
  ]);
  const titoli = getTitoliPerSquadra().find((t) => t.squadra === squadra.nome || t.squadra === squadra.nomeBreve);
  const capitano = giocatori.find((g) => g.id === squadra.capitanoId);
  const squadreUltime = new Map(
    await Promise.all(
      ultime.flatMap((p) => [p.squadraCasaId, p.squadraTrasfertaId]).map(async (id) => [id, await getSquadraById(id)] as const)
    )
  );

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
        {squadra.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- copertina caricata dall'organizzatore su Supabase Storage
          <img src={squadra.coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <>
            <PitchBackdrop />
            <StadiumLights />
          </>
        )}
        <div className="bg-aurora absolute inset-0 opacity-50 mix-blend-screen" />
        {squadra.coverUrl && <div className="absolute inset-0 bg-black/40" />}
        <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:items-end sm:text-left">
          <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} logoUrl={squadra.logoUrl} size={100} />
          <div className="flex-1">
            {titoli && (
              <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge variant="gold">
                  <Trophy className="size-3" /> {titoli.titoli}× Campione
                </Badge>
              </div>
            )}
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">{squadra.nome}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{squadra.descrizione}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" /> Fondata nel {squadra.fondazione}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {squadra.sedeSociale}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="size-3.5" /> Allenatore: {squadra.allenatore}
              </span>
              {capitano && (
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5" /> Capitano: {capitano.nome} {capitano.cognome}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {riga && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { label: "Posizione", value: `${riga.posizione}°` },
            { label: "Punti", value: riga.punti },
            { label: "Giocate", value: riga.giocate },
            { label: "Vittorie", value: riga.vinte },
            { label: "Pareggi", value: riga.pareggiate },
            { label: "Sconfitte", value: riga.perse },
            { label: "Diff. reti", value: riga.golFatti - riga.golSubiti > 0 ? `+${riga.golFatti - riga.golSubiti}` : riga.golFatti - riga.golSubiti },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className="font-score text-2xl font-bold">{s.value}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {riga && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm font-semibold text-muted-foreground">Forma delle ultime 5 giornate</p>
            <FormBadges risultati={riga.ultimeCinque} size="md" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Rosa</h2>
          <TeamRoster giocatori={giocatori} capitanoId={squadra.capitanoId} viceCapitanoId={squadra.viceCapitanoId} />
        </section>

        <div className="flex flex-col gap-6">
          <section>
            <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Ultimi risultati</h2>
            <div className="flex flex-col gap-3">
              {ultime.length ? ultime.map((p) => (
                <Link key={p.id} href={`/partite/${p.id}`} className="block hover:opacity-80 transition-opacity">
                  <MatchCard
                    partita={p}
                    casa={squadreUltime.get(p.squadraCasaId)!}
                    trasferta={squadreUltime.get(p.squadraTrasfertaId)!}
                  />
                </Link>
              )) : (
                <p className="text-sm text-muted-foreground">Nessun risultato disponibile.</p>
              )}
            </div>
            <Link href={`/partite?squadra=${squadra.id}`} className="mt-3 inline-block text-sm font-semibold text-primary-glow hover:text-gold-bright">
              Vedi tutte le partite →
            </Link>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Sponsor del club</h2>
            {sponsor.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessuno sponsor ancora associato a questo club.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {sponsor.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="flex flex-col items-center gap-1.5 p-4 text-center">
                      {s.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- logo caricato dall'organizzatore su Supabase Storage
                        <img src={s.logoUrl} alt={s.nome} className="mb-1 size-10 rounded-lg object-cover" />
                      )}
                      <span className="font-display text-sm font-bold">{s.nome}</span>
                      <Badge variant={s.livello === "platinum" ? "gold" : "outline"}>{s.livello}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Galleria</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-2xl bg-pitch-gradient glass">
              <PitchBackdrop />
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
