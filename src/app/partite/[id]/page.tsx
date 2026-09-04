import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { Card, CardContent } from "@/components/ui/card";
import { MatchTimeline } from "@/components/match/timeline";
import { TabellinoView } from "@/components/match/tabellino-view";
import { getPartitaById, getSquadraById, getGiocatoriDellaSquadra } from "@/lib/data";
import { ScoreDisplay } from "@/components/match/score-display";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const partita = await getPartitaById(id);
  if (!partita) return {};

  const [squadraCasa, squadraTrasferta] = await Promise.all([
    getSquadraById(partita.squadraCasaId),
    getSquadraById(partita.squadraTrasfertaId),
  ]);

  const titolo = squadraCasa && squadraTrasferta ? `${squadraCasa.nome} - ${squadraTrasferta.nome}` : "Partita";
  return { title: titolo };
}

export default async function PartitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partita = await getPartitaById(id);
  if (!partita) notFound();

  const [squadraCasa, squadraTrasferta, rosterCasa, rosterTrasferta] = await Promise.all([
    getSquadraById(partita.squadraCasaId),
    getSquadraById(partita.squadraTrasfertaId),
    getGiocatoriDellaSquadra(partita.squadraCasaId),
    getGiocatoriDellaSquadra(partita.squadraTrasfertaId),
  ]);

  if (!squadraCasa || !squadraTrasferta) notFound();

  return (
    <Container className="flex flex-col gap-8 py-6 sm:py-10">
      <div>
        <h1 className="mb-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">Dettagli partita</h1>

        <Card className="mb-6">
          <CardContent className="p-6">
            <ScoreDisplay
              partita={partita}
              squadraCasa={squadraCasa}
              squadraTrasferta={squadraTrasferta}
              layout="vertical"
            />
            <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">
                  {new Date(partita.dataOra).toLocaleDateString("it-IT", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {partita.campo && (
                <div>
                  <p className="text-muted-foreground">Campo</p>
                  <p className="font-medium">{partita.campo}</p>
                </div>
              )}
              {partita.arbitro && (
                <div>
                  <p className="text-muted-foreground">Arbitro</p>
                  <p className="font-medium">{partita.arbitro}</p>
                </div>
              )}
              {partita.giornata && (
                <div>
                  <p className="text-muted-foreground">Giornata</p>
                  <p className="font-medium">Giornata {partita.giornata}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {partita.eventi.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Cronaca</h2>
          <MatchTimeline
            partita={partita}
            squadre={[squadraCasa, squadraTrasferta]}
            giocatori={[...rosterCasa, ...rosterTrasferta]}
          />
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Tabellino</h2>
        <TabellinoView partita={partita} rosterCasa={rosterCasa} rosterTrasferta={rosterTrasferta} />
      </section>
    </Container>
  );
}
