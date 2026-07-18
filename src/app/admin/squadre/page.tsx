import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSquadreTable } from "@/components/admin/admin-squadre-table";
import { getSquadre, getRigaClassifica } from "@/lib/data";

export const metadata: Metadata = { title: "Gestione Squadre" };

export default async function AdminSquadrePage() {
  const listaSquadre = await getSquadre();
  const squadre = await Promise.all(listaSquadre.map(async (s) => ({ squadra: s, riga: await getRigaClassifica(s.id) })));

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Gestione Squadre</h1>
      </div>
      <AdminShell>
        <AdminSquadreTable dati={squadre} />
      </AdminShell>
    </Container>
  );
}
