import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { MatchDetailHeader } from "@/components/match/match-detail-header";
import { MatchTimeline } from "@/components/match/timeline";
import { TeamLineup } from "@/components/match/lineup";
import { MatchStats } from "@/components/match/match-stats";
import { MatchInfo } from "@/components/match/match-info";
import { MatchChat } from "@/components/match/match-chat";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPartite, getPartitaById, getSquadraById, getGiocatoriDellaSquadra } from "@/lib/data";

export async function generateStaticParams() {
  return (await getPartite()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const partita = await getPartitaById(id);
  if (!partita) return {};
  const casa = await getSquadraById(partita.squadraCasaId);
  const trasferta = await getSquadraById(partita.squadraTrasfertaId);
  return { title: `${casa?.nomeBreve} vs ${trasferta?.nomeBreve}` };
}

export default async function PartitaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partita = await getPartitaById(id);
  if (!partita) notFound();

  const casa = (await getSquadraById(partita.squadraCasaId))!;
  const trasferta = (await getSquadraById(partita.squadraTrasfertaId))!;
  const isLive = partita.stato === "live" || partita.stato === "intervallo";
  // Basta una distinta delle due: la seconda squadra spesso consegna la
  // propria all'ultimo, e nascondere anche quella già depositata sarebbe
  // peggio che mostrarla da sola.
  const haFormazioni = Boolean(partita.formazioneCasa?.length || partita.formazioneTrasferta?.length);
  const [giocatoriCasa, giocatoriTrasferta] = await Promise.all([
    getGiocatoriDellaSquadra(casa.id),
    getGiocatoriDellaSquadra(trasferta.id),
  ]);
  const giocatoriCoinvolti = [...giocatoriCasa, ...giocatoriTrasferta];

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <MatchDetailHeader partita={partita} />

      <Tabs defaultValue="cronaca">
        <TabsList>
          <TabsTrigger value="cronaca">Cronaca</TabsTrigger>
          {haFormazioni && <TabsTrigger value="formazioni">Formazioni</TabsTrigger>}
          <TabsTrigger value="statistiche">Statistiche</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
          {isLive && <TabsTrigger value="chat">Chat Live</TabsTrigger>}
        </TabsList>

        <TabsContent value="cronaca" className="mt-5">
          <Card>
            <CardContent className="p-5">
              <MatchTimeline partita={partita} squadre={[casa, trasferta]} giocatori={giocatoriCoinvolti} />
            </CardContent>
          </Card>
        </TabsContent>

        {haFormazioni && (
          <TabsContent value="formazioni" className="mt-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="p-5">
                  <TeamLineup squadra={casa} formazione={partita.formazioneCasa} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <TeamLineup squadra={trasferta} formazione={partita.formazioneTrasferta} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="statistiche" className="mt-5">
          <Card>
            <CardContent className="p-5">
              <MatchStats stats={partita.statistiche} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-5">
          <MatchInfo partita={partita} />
        </TabsContent>

        {isLive && (
          <TabsContent value="chat" className="mt-5">
            <MatchChat />
          </TabsContent>
        )}
      </Tabs>
    </Container>
  );
}
