import Link from "next/link";
import { Container } from "@/components/shared/container";
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
} from "@/lib/data";
import { Trophy, Sparkles, PartyPopper } from "lucide-react";

export default function HomePage() {
  const live = getPartitaLive();
  const prossima = getProssimaPartita();
  const heroMatch = live ?? prossima;
  const oggi = getPartiteDiOggi();
  const risultati = getUltimiRisultati(4);
  const classifica = getClassificaGenerale().slice(0, 5);
  const marcatori = getClassificaMarcatori(5).map((x) => ({ giocatore: x.giocatore, value: x.stat!.goal }));
  const assist = getClassificaAssist(5).map((x) => ({ giocatore: x.giocatore, value: x.stat!.assist }));
  const news = getArticoliInEvidenza(3);
  const mvp = getMvpUltimaGiornata();
  const mvpGiocatore = mvp?.giocatoreId ? getGiocatoreById(mvp.giocatoreId) : undefined;
  const mvpSquadra = mvpGiocatore ? getSquadraById(mvpGiocatore.squadraId) : undefined;
  const giornata = getGiornataCorrente();
  const album = getAlbum().slice(0, 4);
  const squadre = getSquadre();

  return (
    <Container className="flex flex-col gap-10 pt-6 sm:gap-14 sm:pt-10">
      {heroMatch && <Hero partita={heroMatch} live={Boolean(live)} />}

      {oggi.length > 0 && (
        <section>
          <SectionHeader eyebrow={`Giornata ${giornata}`} title="Partite di oggi" href="/partite" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {oggi.map((p) => (
              <MatchCard key={p.id} partita={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader eyebrow="Ultima giornata" title="Ultimi risultati" href="/partite" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {risultati.map((p) => (
            <MatchCard key={p.id} partita={p} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionHeader eyebrow="Stagione 2025/2026" title="Classifica" href="/classifica" />
          <StandingsTable righe={classifica} compact />
        </section>

        {mvpGiocatore && (
          <section>
            <SectionHeader eyebrow={`Giornata ${mvp?.giornata}`} title="MVP della settimana" />
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-pitch-gradient opacity-80" />
              <CardContent className="relative flex flex-col items-center gap-3 p-6 text-center">
                <Trophy className="size-6 text-gold-bright" />
                <PlayerAvatar nome={mvpGiocatore.nome} cognome={mvpGiocatore.cognome} size={80} numero={mvpGiocatore.numeroMaglia} ring />
                <div>
                  <p className="font-display text-lg font-bold">
                    {mvpGiocatore.nome} {mvpGiocatore.cognome}
                  </p>
                  {mvpSquadra && (
                    <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                      <TeamCrest nome={mvpSquadra.nome} colors={mvpSquadra.coloriSociali} size={16} />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <SectionHeader eyebrow="Corsa al Capocannoniere" title="Top 5 marcatori" href="/statistiche" />
          <Card>
            <CardContent className="p-4">
              <TopList items={marcatori} unit="gol" />
            </CardContent>
          </Card>
        </section>
        <section>
          <SectionHeader eyebrow="Il gioco di squadra" title="Top 5 assist" href="/statistiche" />
          <Card>
            <CardContent className="p-4">
              <TopList items={assist} unit="ast" />
            </CardContent>
          </Card>
        </section>
      </div>

      <section>
        <SectionHeader eyebrow="Il mondo della Lega" title="Ultime news" href="/news" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {news.map((a, i) => (
            <NewsCard key={a.id} articolo={a} featured={i === 0} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Media Center" title="Foto e video della settimana" href="/media" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {album.map((a) => (
            <MediaCard key={a.id} album={a} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Il campionato" title="Tutte le squadre" href="/squadre" />
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {squadre.map((s) => (
            <Link
              key={s.id}
              href={`/squadre/${s.slug}`}
              className="flex shrink-0 flex-col items-center gap-2 rounded-2xl glass px-4 py-3 hover:border-primary-glow/30"
            >
              <TeamCrest nome={s.nome} colors={s.coloriSociali} size={40} />
              <span className="text-xs font-semibold">{s.nomeBreve}</span>
            </Link>
          ))}
        </div>
      </section>

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-gold/10" />
        <CardContent className="relative flex flex-col items-center gap-3 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <PartyPopper className="size-8 shrink-0 text-gold-bright" />
            <div>
              <p className="font-display text-lg font-bold">Iscrizioni aperte per la Stagione 2026/2027</p>
              <p className="text-sm text-muted-foreground">Porta la tua squadra nella Lega Calcio Over 40: posti limitati.</p>
            </div>
          </div>
          <Button asChild variant="gold" className="shrink-0">
            <Link href="/altro">
              <Sparkles className="size-4" />
              Scopri come iscriverti
            </Link>
          </Button>
        </CardContent>
      </Card>

      <SponsorBanner />
    </Container>
  );
}
