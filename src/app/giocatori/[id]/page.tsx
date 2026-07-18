import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { TeamCrest } from "@/components/brand/team-crest";
import { PitchBackdrop, StadiumLights } from "@/components/brand/pitch-art";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getGiocatori, getGiocatoreById, getSquadraById, getStagioneById, getStagioneAttuale } from "@/lib/data";
import { Ruler, Weight, Footprints, Cake, Trophy, ShieldHalf } from "lucide-react";

export function generateStaticParams() {
  return getGiocatori().map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const g = getGiocatoreById(id);
  return g ? { title: `${g.nome} ${g.cognome}` } : {};
}

export default async function GiocatoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const giocatore = getGiocatoreById(id);
  if (!giocatore) notFound();

  const squadra = getSquadraById(giocatore.squadraId)!;
  const stagioneCorrente = getStagioneAttuale();
  const statoAttuale = giocatore.statistiche.find((s) => s.stagioneId === stagioneCorrente.id);
  const carriera = [...giocatore.statistiche].sort((a, b) => b.stagioneId.localeCompare(a.stagioneId));

  const totali = giocatore.statistiche.reduce(
    (acc, s) => ({
      presenze: acc.presenze + s.presenze,
      goal: acc.goal + s.goal,
      assist: acc.assist + s.assist,
      ammonizioni: acc.ammonizioni + s.ammonizioni,
      espulsioni: acc.espulsioni + s.espulsioni,
      mvp: acc.mvp + s.mvp,
    }),
    { presenze: 0, goal: 0, assist: 0, ammonizioni: 0, espulsioni: 0, mvp: 0 }
  );

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
        <div className="bg-aurora absolute inset-0 opacity-50 mix-blend-screen" />
        <PitchBackdrop />
        <StadiumLights />
        <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:items-end sm:text-left">
          <PlayerAvatar nome={giocatore.nome} cognome={giocatore.cognome} numero={giocatore.numeroMaglia} size={110} ring />
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge variant="default">{giocatore.ruolo}</Badge>
              <Badge variant="outline">#{giocatore.numeroMaglia}</Badge>
              {giocatore.id === squadra.capitanoId && <Badge variant="gold">Capitano</Badge>}
              {giocatore.id === squadra.viceCapitanoId && <Badge variant="outline">Vice Capitano</Badge>}
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
              {giocatore.nome} {giocatore.cognome}
            </h1>
            <Link href={`/squadre/${squadra.slug}`} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary-glow">
              <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} size={20} />
              {squadra.nome}
            </Link>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{giocatore.bio}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoCard icon={Cake} label="Età" value={`${giocatore.eta} anni`} />
        <InfoCard icon={Ruler} label="Altezza" value={`${giocatore.altezzaCm} cm`} />
        <InfoCard icon={Weight} label="Peso" value={`${giocatore.pesoKg} kg`} />
        <InfoCard icon={Footprints} label="Piede" value={giocatore.piedePreferito} />
      </div>

      {statoAttuale && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Stagione {stagioneCorrente.etichetta}</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[
              { label: "Presenze", value: statoAttuale.presenze },
              { label: "Gol", value: statoAttuale.goal },
              { label: "Assist", value: statoAttuale.assist },
              { label: "Ammonizioni", value: statoAttuale.ammonizioni },
              { label: "Espulsioni", value: statoAttuale.espulsioni },
              { label: "Media voto", value: statoAttuale.mediaVoto || "—" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-3 text-center sm:p-4">
                  <p className="font-score text-xl font-bold sm:text-2xl">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <ShieldHalf className="size-5 text-gold-bright" />
          <h2 className="font-display text-xl font-bold tracking-tight">Carriera nella Lega</h2>
        </div>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Stagione</th>
                  <th className="px-2 py-3 text-center">Pres.</th>
                  <th className="px-2 py-3 text-center">Gol</th>
                  <th className="px-2 py-3 text-center">Assist</th>
                  <th className="px-2 py-3 text-center">Amm.</th>
                  <th className="px-2 py-3 text-center">Esp.</th>
                  <th className="px-2 py-3 text-center">MVP</th>
                  <th className="px-4 py-3 text-center">Voto medio</th>
                </tr>
              </thead>
              <tbody>
                {carriera.map((s) => {
                  const stagione = getStagioneById(s.stagioneId);
                  return (
                    <tr key={s.stagioneId} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 font-semibold">{stagione?.etichetta}</td>
                      <td className="px-2 py-3 text-center tabular-nums">{s.presenze}</td>
                      <td className="px-2 py-3 text-center tabular-nums font-bold text-primary-glow">{s.goal}</td>
                      <td className="px-2 py-3 text-center tabular-nums">{s.assist}</td>
                      <td className="px-2 py-3 text-center tabular-nums text-amber-400">{s.ammonizioni}</td>
                      <td className="px-2 py-3 text-center tabular-nums text-danger">{s.espulsioni}</td>
                      <td className="px-2 py-3 text-center tabular-nums text-gold-bright">{s.mvp}</td>
                      <td className="px-4 py-3 text-center tabular-nums">{s.mediaVoto?.toFixed(2) ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-border-strong bg-white/[0.03] font-bold">
                  <td className="px-4 py-3">Totale carriera</td>
                  <td className="px-2 py-3 text-center tabular-nums">{totali.presenze}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-primary-glow">{totali.goal}</td>
                  <td className="px-2 py-3 text-center tabular-nums">{totali.assist}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-amber-400">{totali.ammonizioni}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-danger">{totali.espulsioni}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-gold-bright">{totali.mvp}</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </section>

      {giocatore.trofei.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Trofei vinti</h2>
          <div className="flex flex-wrap gap-2">
            {giocatore.trofei.map((t, i) => (
              <Badge key={i} variant="gold" className="px-3 py-1.5 text-sm">
                <Trophy className="size-3.5" /> {t.titolo}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Galleria personale</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-pitch-gradient glass">
              <PitchBackdrop />
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Ruler; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-1.5 p-4 text-center">
        <Icon className="size-4 text-primary-glow" />
        <p className="text-sm font-bold">{value}</p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
