import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminMediaGrid } from "@/components/admin/admin-media-grid";
import { getAlbum } from "@/lib/data";

export const metadata: Metadata = { title: "Gestione Galleria" };

export default function AdminMediaPage() {
  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Galleria Media</h1>
        <p className="mt-1 text-sm text-muted-foreground">Carica album fotografici, video e highlights della Lega.</p>
      </div>
      <AdminShell>
        <AdminMediaGrid album={getAlbum()} />
      </AdminShell>
    </Container>
  );
}
