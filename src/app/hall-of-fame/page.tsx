import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { TeamCrest } from "@/components/brand/team-crest";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAlboOro, getSquadraById, getGiocatoreById, getGiocatori } from "@/lib/data";
import { Award, Crown, Shield, Trophy } from "lucide-react";

export const metadata: Metadata = { title: "Hall of Fame" };

export default function HallOfFamePage() {
  const alboOro = getAlboOro();

  const titoliPerSquadra = new Map<string, number>();
  alboOro.forEach((v) => titoliPerSquadra.set(v.squadraCampioneId, (titoliPerSquadra.get(v.squadraCampioneId) ?? 0) + 1));
  const squadraPiuTitolata = [...titoliPerSquadra.entries()].sort((a, b) => b[1] - a[1])[0];

  const recordGoalCarriera = [...getGiocatori()]
    .map((g) => ({ giocatore: g, goal: g.statistiche.reduce((acc, s) => acc + s.goal, 0) }))
    .sort((a, b) => b.goal - a.goal)[0];

  return (
    <Container className="flex flex-col gap-8 pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient p-8 text-center sm:p-12">
        <Crown className="mx-auto mb-3 size-9 text-gold-bright" />
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-gold-bright">Albo d&apos;Oro</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">Hall of Fame</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          La storia della Lega Calcio Over 40 si scrive stagione dopo stagione. Qui vivono per sempre i campioni,
          i capocannonieri e le imprese che hanno reso grande il Campo Sportivo Santa Teresa.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {squadraPiuTitolata && (
          <RecordCard
            icon={Trophy}
            label="Squadra più titolata"
            value={getSquadraById(squadraPiuTitolata[0])?.nomeBreve ?? "—"}
            sub={`${squadraPiuTitolata[1]} titoli vinti`}
          />
        )}
        {recordGoalCarriera && (
          <RecordCard
            icon={Award}
            label="Record gol in carriera"
            value={`${recordGoalCarriera.giocatore.nome} ${recordGoalCarriera.giocatore.cognome}`}
            sub={`${recordGoalCarriera.goal} gol totali`}
          />
        )}
        <RecordCard icon={Shield} label="Stagioni disputate" value={String(alboOro.length + 1)} sub="Dalla fondazione ad oggi" />
      </div>

      <section className="flex flex-col gap-4">
        {alboOro.map((voce) => {
          const squadra = getSquadraById(voce.squadraCampioneId);
          const capocannoniere = getGiocatoreById(voce.capocannoniereId);
          const mvp = getGiocatoreById(voce.mvpStagioneId);
          const difesa = getSquadraById(voce.miglioreDifesaSquadraId);
          const fairPlay = getSquadraById(voce.fairPlaySquadraId);
          if (!squadra) return null;

          return (
            <Card key={voce.stagioneId} className="overflow-hidden">
              <CardContent className="flex flex-col gap-5 p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="gold" className="px-3 py-1 text-sm">
                    Stagione {voce.stagioneId.replace("-", "/")}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href={`/squadre/${squadra.slug}`} className="flex items-center gap-3">
                    <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} size={56} />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Squadra Campione</p>
                      <p className="font-display text-lg font-bold">{squadra.nome}</p>
                    </div>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
                  {capocannoniere && (
                    <MiniStat label="Capocannoniere" value={`${capocannoniere.nome} ${capocannoniere.cognome}`} sub={`${voce.capocannoniereGoal} gol`} avatar={capocannoniere} />
                  )}
                  {mvp && <MiniStat label="MVP Stagione" value={`${mvp.nome} ${mvp.cognome}`} avatar={mvp} />}
                  {difesa && <MiniStat label="Miglior difesa" value={difesa.nomeBreve} crest={difesa} />}
                  {fairPlay && <MiniStat label="Fair Play" value={fairPlay.nomeBreve} crest={fairPlay} />}
                </div>
              </CardContent>
            </Card>
          );
        })}
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

function MiniStat({
  label,
  value,
  sub,
  avatar,
  crest,
}: {
  label: string;
  value: string;
  sub?: string;
  avatar?: { nome: string; cognome: string };
  crest?: { nome: string; coloriSociali: [string, string] };
}) {
  return (
    <div className="flex items-center gap-2.5">
      {avatar && <PlayerAvatar nome={avatar.nome} cognome={avatar.cognome} size={32} />}
      {crest && <TeamCrest nome={crest.nome} colors={crest.coloriSociali} size={28} />}
      <div className="min-w-0">
        <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
        {sub && <p className="text-xs text-gold-bright">{sub}</p>}
      </div>
    </div>
  );
}
