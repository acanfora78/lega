import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { PitchBackdrop } from "@/components/brand/pitch-art";
import { StandingsTable } from "@/components/shared/standings-table";
import { MatchCard } from "@/components/match/match-card";
import { Badge } from "@/components/ui/badge";
import {
  getCompetizioneBySlug,
  getCompetizioni,
  getClassificaCompetizione,
  getPartiteCompetizione,
  getSquadre,
} from "@/lib/data";
import type { Competizione, FaseCompetizione, Partita, Squadra } from "@/lib/types";
import { Trophy } from "lucide-react";

export async function generateStaticParams() {
  return (await getCompetizioni()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCompetizioneBySlug(slug);
  return c ? { title: c.nome } : {};
}

export default async function CompetizioneDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const competizione = await getCompetizioneBySlug(slug);
  if (!competizione) notFound();

  const squadre = await getSquadre();
  const squadreMap = new Map(squadre.map((s) => [s.id, s]));

  return (
    <Container className="flex flex-col gap-8 pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
        <PitchBackdrop />
        <div className="relative flex flex-col items-center gap-3 px-6 py-12 text-center">
          <Badge variant="gold" className="capitalize">
            {competizione.stato.replace("_", " ")}
          </Badge>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{competizione.nome}</h1>
        </div>
      </div>

      {competizione.fasi.length === 0 ? (
        <SezioneCompetizioneOFase competizione={competizione} squadreMap={squadreMap} />
      ) : (
        [...competizione.fasi]
          .sort((a, b) => a.ordine - b.ordine)
          .map((fase) => (
            <SezioneCompetizioneOFase key={fase.id} competizione={competizione} fase={fase} squadreMap={squadreMap} />
          ))
      )}
    </Container>
  );
}

async function SezioneCompetizioneOFase({
  competizione,
  fase,
  squadreMap,
}: {
  competizione: Competizione;
  fase?: FaseCompetizione;
  squadreMap: Map<string, Squadra>;
}) {
  const [classifica, partite] = await Promise.all([
    getClassificaCompetizione(competizione.id, fase?.id),
    getPartiteCompetizione(competizione.id, fase?.id),
  ]);

  const squadreIds = fase ? fase.squadreIds : competizione.squadreIscritteIds;
  const squadreSezione = squadreIds.map((id) => squadreMap.get(id)).filter((s): s is Squadra => Boolean(s));
  const formato = fase ? fase.formato : competizione.formato;
  const eEliminazioneDiretta = formato === "eliminazione_diretta";

  return (
    <section className="flex flex-col gap-4">
      {fase && <h2 className="font-display text-xl font-bold tracking-tight">{fase.nome}</h2>}

      {!eEliminazioneDiretta && classifica.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-lg font-bold tracking-tight">Classifica</h3>
          <StandingsTable righe={classifica} squadre={squadreSezione} />
        </div>
      )}

      <div>
        <h3 className="mb-3 font-display text-lg font-bold tracking-tight">
          {eEliminazioneDiretta ? "Tabellone" : "Calendario"}
        </h3>
        {partite.length === 0 ? (
          <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
            Calendario non ancora pubblicato.
          </div>
        ) : eEliminazioneDiretta ? (
          <Tabellone partite={partite} squadreMap={squadreMap} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partite.map((p) => {
              const casa = squadreMap.get(p.squadraCasaId);
              const trasferta = squadreMap.get(p.squadraTrasfertaId);
              if (!casa || !trasferta) return null;
              return <MatchCard key={p.id} partita={p} casa={casa} trasferta={trasferta} />;
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Il calendario a eliminazione diretta arriva via CSV, un turno (giornata)
 * alla volta man mano che si conoscono i vincitori: qui si raggruppano le
 * partite per giornata invece di disegnare un vero tabellone ad albero, che
 * richiederebbe conoscere in anticipo la struttura completa del torneo.
 */
function Tabellone({ partite, squadreMap }: { partite: Partita[]; squadreMap: Map<string, Squadra> }) {
  const turni = new Map<number, Partita[]>();
  partite.forEach((p) => {
    turni.set(p.giornata, [...(turni.get(p.giornata) ?? []), p]);
  });

  return (
    <div className="flex flex-col gap-6">
      {[...turni.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([giornata, partiteDelTurno]) => (
          <div key={giornata}>
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gold-bright">
              <Trophy className="size-3.5" /> Turno {giornata}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {partiteDelTurno.map((p) => {
                const casa = squadreMap.get(p.squadraCasaId);
                const trasferta = squadreMap.get(p.squadraTrasfertaId);
                if (!casa || !trasferta) return null;
                return <MatchCard key={p.id} partita={p} casa={casa} trasferta={trasferta} />;
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
