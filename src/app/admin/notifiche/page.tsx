import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminNotificheComposer } from "@/components/admin/admin-notifiche-composer";
import { getNotifiche } from "@/lib/data";

export const metadata: Metadata = { title: "Notifiche Push" };

export default async function AdminNotifichePage() {
  const notifiche = await getNotifiche();
  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Notifiche Push</h1>
        <p className="mt-1 text-sm text-muted-foreground">Invia comunicazioni istantanee a tutti i tifosi della Lega.</p>
      </div>
      <AdminShell>
        <AdminNotificheComposer notifiche={notifiche} />
      </AdminShell>
    </Container>
  );
}
