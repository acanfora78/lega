import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/shared/container";
import { AccessDeniedNotice } from "@/components/shared/access-denied-notice";
import { SectionHeader } from "@/components/shared/section-header";
import { Hero } from "@/components/home/hero";
import { MatchCard } from "@/components/match/match-card";
import { StandingsTable } from "@/components/shared/standings-table";
import { TopList } from "@/components/home/top-list";
import { NewsCard } from "@/components/news/news-card";
import { MediaCard } from "@/components/media/media-card";
import { SponsorBanner } from "@/components/shared/sponsor-banner";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { TeamCrest } from "@/components/brand/team-crest";
import { PitchBackdrop, StadiumLights, LegaMonogram } from "@/components/brand/pitch-art";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getPartitaLive,
  getProssimaPartita,
  getPartiteDiOggi,
  getUltimiRisultati,
  getClassificaGenerale,
  getClassificaMarcatori,
  getClassificaAssist,
  getArticoliInEvidenza,
  getMvpUltimaGiornata,
  getGiocatoreById,
  getSquadraById,
  getGiornataCorrente,
  getAlbum,
  getSquadre,
  getSponsor,
  getStagioneAttuale,
} from "@/lib/data";
import { getCampionatiPassati } from "@/lib/data/storico";
import { Trophy, Sparkles, ShieldCheck, Archive, ChevronRight } from "lucide-react";

export default async function HomePage() {
  const [live, prossima, oggi, risultati, classificaCompleta, marcatoriRaw, assistRaw, news, mvp, giornata, albumCompleto, squadre, sponsor] =
    await Promise.all([
      getPartitaLive(),
      getProssimaPartita(),
      getPartiteDiOggi(),
      getUltimiRisultati(4),
      getClassificaGenerale(),
      getClassificaMarcatori(5),
      getClassificaAssist(5),
      getArticoliInEvidenza(3),
      getMvpUltimaGiornata(),
      getGiornataCorrente(),
      getAlbum(),
      getSquadre(),
      getSponsor(),
    ]);
  const campionatiPassati = getCampionatiPassati();

  const heroMatch = live ?? prossima;
  const classifica = classificaCompleta.slice(0, 5);
  const marcatori = marcatoriRaw.map((x) => ({ giocatore: x.giocatore, value: x.stat!.goal }));
  const assist = assistRaw.map((x) => ({ giocatore: x.giocatore, value: x.stat!.assist }));
  const mvpGiocatore = mvp?.giocatoreId ? await getGiocatoreById(mvp.giocatoreId) : undefined;
  const mvpSquadra = mvpGiocatore ? await getSquadraById(mvpGiocatore.squadraId) : undefined;
  const album = albumCompleto.slice(0, 4);
  const stagioneAttuale = await getStagioneAttuale();

  const stagioneAttivata = squadre.length > 0;
  const squadreMap = new Map(squadre.map((s) => [s.id, s]));
  const heroCasa = heroMatch ? squadreMap.get(heroMatch.squadraCasaId) : undefined;
  const heroTrasferta = heroMatch ? squadreMap.get(heroMatch.squadraTrasfertaId) : undefined;

  return (
    <Container className="flex flex-col gap-10 pt-6 sm:gap-14 sm:pt-10">
      <Suspense fallback={null}>
        <AccessDeniedNotice />
      </Suspense>
      {heroMatch && heroCasa && heroTrasferta ? (
        <Hero
          partita={heroMatch}
          live={Boolean(live)}
          casa={heroCasa}
          trasferta={heroTrasferta}
          stagione={stagioneAttuale}
        />
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
          <PitchBackdrop />
          <StadiumLights />
          <div className="relative flex flex-col items-center gap-4 px-6 py-14 text-center sm:py-20">
            <LegaMonogram size={52} />
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
              {stagioneAttivata ? "Il campionato sta per cominciare" : "Benvenuto nella tua Lega"}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              {stagioneAttivata
                ? "Le squadre sono pronte: calendario e partite compariranno qui non appena l'area organizzatore le pubblicherà."
                : "La nuova stagione non è ancora stata configurata. L'area organizzatore può iniziare subito ad aggiungere squadre, giocatori e calendario."}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Button asChild variant="gold">
                <Link href="/admin">
                  <ShieldCheck className="size-4" />
                  Vai all&apos;area organizzatore
                </Link>
              </Button>
              {campionatiPassati.length > 0 && (
                <Button asChild variant="outline">
                  <Link href="/campionati-passati">
                    <Archive className="size-4" />
                    Sfoglia i campionati passati
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {oggi.length > 0 && (
        <section>
          <SectionHeader eyebrow={`Giornata ${giornata}`} title="Partite di oggi" href="/partite" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {oggi.map((p) => (
              <MatchCard key={p.id} partita={p} casa={squadreMap.get(p.squadraCasaId)!} trasferta={squadreMap.get(p.squadraTrasfertaId)!} />
            ))}
          </div>
        </section>
      )}

      {risultati.length > 0 && (
        <section>
          <SectionHeader eyebrow="Ultima giornata" title="Ultimi risultati" href="/partite" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {risultati.map((p) => (
              <MatchCard key={p.id} partita={p} casa={squadreMap.get(p.squadraCasaId)!} trasferta={squadreMap.get(p.squadraTrasfertaId)!} />
            ))}
          </div>
        </section>
      )}

      {(classifica.length > 0 || mvpGiocatore) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {classifica.length > 0 && (
            <section className="lg:col-span-2">
              <SectionHeader eyebrow="Stagione in corso" title="Classifica" href="/classifica" />
              <StandingsTable righe={classifica} squadre={squadre} compact />
            </section>
          )}

          {mvpGiocatore && (
            <section>
              <SectionHeader eyebrow={`Giornata ${mvp?.giornata}`} title="MVP della settimana" />
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-pitch-gradient opacity-80" />
                <CardContent className="relative flex flex-col items-center gap-3 p-6 text-center">
                  <Trophy className="size-6 text-gold-bright" />
                  <PlayerAvatar nome={mvpGiocatore.nome} cognome={mvpGiocatore.cognome} fotoUrl={mvpGiocatore.fotoUrl} size={80} numero={mvpGiocatore.numeroMaglia} ring />
                  <div>
                    <p className="font-display text-lg font-bold">
                      {mvpGiocatore.nome} {mvpGiocatore.cognome}
                    </p>
                    {mvpSquadra && (
                      <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                        <TeamCrest nome={mvpSquadra.nome} colors={mvpSquadra.coloriSociali} logoUrl={mvpSquadra.logoUrl} size={16} />
                        {mvpSquadra.nomeBreve}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{mvp?.motivazione}</p>
                  <Button asChild size="sm" variant="gold" className="mt-1">
                    <Link href={`/giocatori/${mvpGiocatore.id}`}>Vedi il profilo</Link>
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      )}

      {(marcatori.length > 0 || assist.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {marcatori.length > 0 && (
            <section>
              <SectionHeader eyebrow="Corsa al Capocannoniere" title="Top 5 marcatori" href="/statistiche" />
              <Card>
                <CardContent className="p-4">
                  <TopList items={marcatori} unit="gol" />
                </CardContent>
              </Card>
            </section>
          )}
          {assist.length > 0 && (
            <section>
              <SectionHeader eyebrow="Il gioco di squadra" title="Top 5 assist" href="/statistiche" />
              <Card>
                <CardContent className="p-4">
                  <TopList items={assist} unit="ast" />
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      )}

      {news.length > 0 && (
        <section>
          <SectionHeader eyebrow="Il mondo della Lega" title="Ultime news" href="/news" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {news.map((a, i) => (
              <NewsCard key={a.id} articolo={a} featured={i === 0} />
            ))}
          </div>
        </section>
      )}

      {album.length > 0 && (
        <section>
          <SectionHeader eyebrow="Media Center" title="Foto e video della settimana" href="/media" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {album.map((a) => (
              <MediaCard key={a.id} album={a} />
            ))}
          </div>
        </section>
      )}

      {squadre.length > 0 && (
        <section>
          <SectionHeader eyebrow="Il campionato" title="Tutte le squadre" href="/squadre" />
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {squadre.map((s) => (
              <Link
                key={s.id}
                href={`/squadre/${s.slug}`}
                className="flex shrink-0 flex-col items-center gap-2 rounded-2xl glass px-4 py-3 hover:border-primary-glow/30"
              >
                <TeamCrest nome={s.nome} colors={s.coloriSociali} logoUrl={s.logoUrl} size={40} />
                <span className="text-xs font-semibold">{s.nomeBreve}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {campionatiPassati.length > 0 && (
        <section>
          <SectionHeader eyebrow="Archivio storico" title="Campionati Passati" href="/campionati-passati" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {campionatiPassati.slice(0, 3).map((c) => (
              <Link key={c.id} href={`/campionati-passati/${c.id}`} className="flex flex-col gap-1.5 rounded-2xl glass p-4 hover:border-gold/30">
                <span className="text-xs font-bold uppercase tracking-wide text-gold-bright">Stagione {c.stagione}</span>
                {c.vincitore && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <Trophy className="size-3.5 text-gold-bright" /> {c.vincitore}
                  </span>
                )}
                <span className="mt-1 flex items-center gap-1 text-xs text-primary-glow">
                  Vedi classifica <ChevronRight className="size-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-gold/10" />
        <CardContent className="relative flex flex-col items-center gap-3 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <Sparkles className="size-8 shrink-0 text-gold-bright" />
            <div>
              <p className="font-display text-lg font-bold">Vuoi iscrivere la tua squadra?</p>
              <p className="text-sm text-muted-foreground">Contatta la segreteria della Lega per entrare nel prossimo campionato.</p>
            </div>
          </div>
          <Button asChild variant="gold" className="shrink-0">
            <Link href="/campo">
              <Sparkles className="size-4" />
              Scopri come iscriverti
            </Link>
          </Button>
        </CardContent>
      </Card>

      {sponsor.length > 0 && <SponsorBanner />}
    </Container>
  );
}
