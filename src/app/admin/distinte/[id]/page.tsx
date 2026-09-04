import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDistinta } from "@/components/admin/admin-distinta";
import { getPartitaById, getSquadraById, getGiocatoriDellaSquadra } from "@/lib/data";
import { getSqualificheRisolte } from "@/lib/data/disciplina";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getPartitaById(id);
  if (!p) return {};
  const casa = await getSquadraById(p.squadraCasaId);
  const trasferta = await getSquadraById(p.squadraTrasfertaId);
  return { title: `Distinta: ${casa?.nomeBreve} vs ${trasferta?.nomeBreve}` };
}

export default async function AdminDistintaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partita = await getPartitaById(id);
  if (!partita) notFound();

  const casa = await getSquadraById(partita.squadraCasaId);
  const trasferta = await getSquadraById(partita.squadraTrasfertaId);
  if (!casa || !trasferta) notFound();

  const [rosterCasa, rosterTrasferta, squalifiche] = await Promise.all([
    getGiocatoriDellaSquadra(casa.id),
    getGiocatoriDellaSquadra(trasferta.id),
    getSqualificheRisolte(partita.giornata),
  ]);

  // Stessa segnalazione della gestione partita: chi sta scontando una
  // squalifica proprio in questa giornata non viene bloccato, ma è
  // evidenziato per non finire in distinta per disattenzione.
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
        <Link href="/admin/distinte" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Tutte le distinte
        </Link>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Distinta — Giornata {partita.giornata}</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
          {casa.nomeBreve} vs {trasferta.nomeBreve}
        </h1>
      </div>
      <AdminShell>
        <AdminDistinta
          partitaId={partita.id}
          casa={casa}
          trasferta={trasferta}
          rosterCasa={rosterCasa}
          rosterTrasferta={rosterTrasferta}
          distintaCasa={partita.formazioneCasa ?? []}
          distintaTrasferta={partita.formazioneTrasferta ?? []}
          indisponibili={indisponibili}
        />
      </AdminShell>
    </Container>
  );
}
