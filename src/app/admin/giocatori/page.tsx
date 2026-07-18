import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminGiocatoriTable } from "@/components/admin/admin-giocatori-table";
import { getGiocatori, getSquadre, getStagioneAttuale } from "@/lib/data";

export const metadata: Metadata = { title: "Gestione Giocatori" };

export default function AdminGiocatoriPage() {
  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Gestione Giocatori</h1>
      </div>
      <AdminShell>
        <AdminGiocatoriTable giocatori={getGiocatori()} squadre={getSquadre()} stagioneId={getStagioneAttuale().id} />
      </AdminShell>
    </Container>
  );
}
