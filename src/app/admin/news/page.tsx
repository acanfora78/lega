import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminNewsTable } from "@/components/admin/admin-news-table";
import { getArticoli } from "@/lib/data";

export const metadata: Metadata = { title: "Gestione News" };

export default async function AdminNewsPage() {
  const articoli = await getArticoli();
  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">News &amp; Comunicati</h1>
      </div>
      <AdminShell>
        <AdminNewsTable articoli={articoli} />
      </AdminShell>
    </Container>
  );
}
