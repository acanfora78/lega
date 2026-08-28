import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCompetizioneDetail } from "@/components/admin/admin-competizione-detail";
import { getCompetizioneById, getCompetizioni, getPartiteCompetizione, getSquadre } from "@/lib/data";

export async function generateStaticParams() {
  return (await getCompetizioni()).map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await getCompetizioneById(id);
  return c ? { title: c.nome } : {};
}

export default async function AdminCompetizioneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const competizione = await getCompetizioneById(id);
  if (!competizione) notFound();

  const [squadre, partite] = await Promise.all([getSquadre(), getPartiteCompetizione(id)]);
  const squadreMap = new Map(squadre.map((s) => [s.id, s]));
  const squadreIscritte = competizione.squadreIscritteIds
    .map((sid) => squadreMap.get(sid))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore · Competizioni</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{competizione.nome}</h1>
      </div>
      <AdminShell>
        <AdminCompetizioneDetail
          competizione={competizione}
          squadreIscritte={squadreIscritte}
          partite={partite}
          squadreMap={squadreMap}
        />
      </AdminShell>
    </Container>
  );
}
