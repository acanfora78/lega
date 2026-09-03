import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminMatchControl } from "@/components/admin/admin-match-control";
import { getPartite, getPartitaById, getSquadraById, getGiocatoriDellaSquadra } from "@/lib/data";
import { getSqualificheRisolte } from "@/lib/data/disciplina";

export async function generateStaticParams() {
  return (await getPartite()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getPartitaById(id);
  if (!p) return {};
  const casa = await getSquadraById(p.squadraCasaId);
  const trasferta = await getSquadraById(p.squadraTrasfertaId);
  return { title: `Gestisci: ${casa?.nomeBreve} vs ${trasferta?.nomeBreve}` };
}

export default async function AdminPartitaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partita = await getPartitaById(id);
  if (!partita) notFound();

  const casa = (await getSquadraById(partita.squadraCasaId))!;
  const trasferta = (await getSquadraById(partita.squadraTrasfertaId))!;
  const [rosterCasa, rosterTrasferta, squalifiche] = await Promise.all([
    getGiocatoriDellaSquadra(casa.id),
    getGiocatoriDellaSquadra(trasferta.id),
    getSqualificheRisolte(partita.giornata),
  ]);

  // Chi sta scontando una squalifica proprio in questa giornata: la distinta lo
  // segnala, così non finisce in campo per una svista e non si arriva al
  // reclamo a partita giocata. Le squalifiche sono quelle del campionato, quindi
  // la segnalazione vale solo per le sue gare: su una coppa direbbe il falso.
  const indisponibili: Record<string, string> = {};
  squalifiche
    .filter((s) => !partita.competizioneId && s.giornataDa <= partita.giornata && partita.giornata <= s.giornataA)
    .forEach((s) => {
      indisponibili[s.giocatoreId] = `Squalificato (${
        s.giornataDa === s.giornataA ? `${s.giornataDa}ª` : `${s.giornataDa}ª–${s.giornataA}ª`
      })`;
    });

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Gestione partita — Giornata {partita.giornata}</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
          {casa.nomeBreve} vs {trasferta.nomeBreve}
        </h1>
      </div>
      <AdminShell>
        <AdminMatchControl
          partita={partita}
          casa={casa}
          trasferta={trasferta}
          rosterCasa={rosterCasa}
          rosterTrasferta={rosterTrasferta}
          indisponibili={indisponibili}
        />
      </AdminShell>
    </Container>
  );
}
