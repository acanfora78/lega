import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { DemoBanner } from "@/components/admin/demo-banner";
import { AdminPartiteTable } from "@/components/admin/admin-partite-table";
import { getPartite, getSquadre } from "@/lib/data";

export const metadata: Metadata = { title: "Partite & Risultati" };

export default function AdminPartitePage() {
  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Partite &amp; Risultati</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestisci calendario, formazioni, gol, cartellini e MVP di ogni sfida.</p>
      </div>
      <DemoBanner />
      <AdminShell>
        <AdminPartiteTable partite={getPartite()} squadre={getSquadre()} />
      </AdminShell>
    </Container>
  );
}
