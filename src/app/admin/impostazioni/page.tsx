import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminImpostazioniForm } from "@/components/admin/admin-impostazioni-form";
import { getImpostazioni } from "@/lib/data";

export const metadata: Metadata = { title: "Impostazioni Lega" };

export default async function AdminImpostazioniPage() {
  const impostazioni = await getImpostazioni();
  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Impostazioni della Lega</h1>
      </div>
      <AdminShell>
        <AdminImpostazioniForm impostazioni={impostazioni} />
      </AdminShell>
    </Container>
  );
}
