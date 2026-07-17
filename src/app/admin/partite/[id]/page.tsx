import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { DemoBanner } from "@/components/admin/demo-banner";
import { AdminMatchControl } from "@/components/admin/admin-match-control";
import { getPartite, getPartitaById, getSquadraById, getGiocatoriDellaSquadra } from "@/lib/data";

export function generateStaticParams() {
  return getPartite().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getPartitaById(id);
  if (!p) return {};
  const casa = getSquadraById(p.squadraCasaId);
  const trasferta = getSquadraById(p.squadraTrasfertaId);
  return { title: `Gestisci: ${casa?.nomeBreve} vs ${trasferta?.nomeBreve}` };
}

export default async function AdminPartitaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partita = getPartitaById(id);
  if (!partita) notFound();

  const casa = getSquadraById(partita.squadraCasaId)!;
  const trasferta = getSquadraById(partita.squadraTrasfertaId)!;
  const rosterCasa = getGiocatoriDellaSquadra(casa.id);
  const rosterTrasferta = getGiocatoriDellaSquadra(trasferta.id);

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Gestione partita — Giornata {partita.giornata}</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
          {casa.nomeBreve} vs {trasferta.nomeBreve}
        </h1>
      </div>
      <DemoBanner />
      <AdminShell>
        <AdminMatchControl partita={partita} casa={casa} trasferta={trasferta} rosterCasa={rosterCasa} rosterTrasferta={rosterTrasferta} />
      </AdminShell>
    </Container>
  );
}
