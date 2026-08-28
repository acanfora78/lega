import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminCompetizioniList } from "@/components/admin/admin-competizioni-list";
import { getCompetizioni, getSquadre } from "@/lib/data";

export const metadata: Metadata = { title: "Competizioni" };

export default async function AdminCompetizioniPage() {
  const [competizioni, squadre] = await Promise.all([getCompetizioni(), getSquadre()]);

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Competizioni</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tornei aggiuntivi paralleli al campionato principale (coppe, gironi, eliminazione diretta). Il calendario di
          ogni competizione si carica da file CSV, non viene generato in automatico.
        </p>
      </div>
      <AdminShell>
        <AdminCompetizioniList competizioni={competizioni} squadre={squadre} />
      </AdminShell>
    </Container>
  );
}
