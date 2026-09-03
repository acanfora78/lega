import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPartiteTable } from "@/components/admin/admin-partite-table";
import { AdminComunicato } from "@/components/admin/admin-comunicato";
import { CalendarioCsvUpload } from "@/components/admin/calendario-csv-upload";
import { getGiornataCorrente, getPartite, getSquadre } from "@/lib/data";

export const metadata: Metadata = { title: "Partite & Risultati" };

export default async function AdminPartitePage() {
  const [partite, squadre, giornataCorrente] = await Promise.all([getPartite(), getSquadre(), getGiornataCorrente()]);
  const giornate = [...new Set(partite.map((p) => p.giornata))].sort((a, b) => a - b);
  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Partite &amp; Risultati</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestisci calendario, formazioni, gol, cartellini e MVP di ogni sfida.</p>
      </div>
      <AdminShell>
        <div className="flex flex-col gap-6">
          {giornate.length > 0 && <AdminComunicato giornate={giornate} giornataCorrente={giornataCorrente} />}
          <CalendarioCsvUpload endpoint="/api/admin/partite/calendario" nomeFileModello="calendario-campionato.csv" />
          <AdminPartiteTable partite={partite} squadre={squadre} />
        </div>
      </AdminShell>
    </Container>
  );
}
