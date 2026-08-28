import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getSquadre,
  getGiocatori,
  getPartite,
  getPartitaLive,
  getProssimaPartita,
  getArticoli,
  getSponsor,
  getGiornataCorrente,
} from "@/lib/data";
import { Users, UserCog, CalendarDays, Newspaper, Handshake, Radio, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard Organizzatore" };

export default async function AdminDashboardPage() {
  const [squadre, giocatori, partite, live, prossima, articoli, sponsor, giornata] = await Promise.all([
    getSquadre(),
    getGiocatori(),
    getPartite(),
    getPartitaLive(),
    getProssimaPartita(),
    getArticoli(),
    getSponsor(),
    getGiornataCorrente(),
  ]);
  const concluse = partite.filter((p) => p.stato === "conclusa").length;

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Gestione campionato</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Benvenuto nello staff della Lega Calcio Over 40. Ecco lo stato attuale del campionato.</p>
      </div>
      <AdminShell>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <MetricCard icon={Users} label="Squadre" value={squadre.length} href="/admin/squadre" />
            <MetricCard icon={UserCog} label="Giocatori" value={giocatori.length} href="/admin/giocatori" />
            <MetricCard icon={CalendarDays} label="Partite giocate" value={concluse} href="/admin/partite" />
            <MetricCard icon={Radio} label="Giornata" value={giornata} href="/admin/partite" />
            <MetricCard icon={Newspaper} label="Articoli" value={articoli.length} href="/admin/news" />
            <MetricCard icon={Handshake} label="Sponsor" value={sponsor.length} href="/admin/sponsor" />
          </div>

          {live && (
            <Card className="border-live/30">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-live" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-live" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Partita in corso — Giornata {live.giornata}</p>
                    <p className="text-xs text-muted-foreground">Gestisci gol, cartellini e sostituzioni in tempo reale.</p>
                  </div>
                </div>
                <Button asChild size="sm">
                  <Link href={`/admin/partite/${live.id}`}>
                    Gestisci diretta <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {prossima && (
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-sm font-bold">Prossima partita in programma</p>
                  <p className="text-xs text-muted-foreground">Giornata {prossima.giornata} — verifica formazioni e distinte.</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/partite/${prossima.id}`}>
                    Apri scheda <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickLink href="/admin/squadre" title="Gestisci Squadre" desc="Rose, staff tecnico, colori sociali e sponsor del club" />
            <QuickLink href="/admin/giocatori" title="Gestisci Giocatori" desc="Anagrafica, ruoli, statistiche e trofei" />
            <QuickLink href="/admin/partite" title="Partite & Risultati" desc="Calendario, distinte, gol, cartellini e MVP" />
            <QuickLink href="/admin/competizioni" title="Competizioni" desc="Coppe e tornei aggiuntivi, calendario da CSV" />
            <QuickLink href="/admin/news" title="News & Comunicati" desc="Pubblica articoli e comunicati ufficiali" />
            <QuickLink href="/admin/disciplinare" title="Giudice Sportivo" desc="Squalifiche, diffide e conteggio cartellini" />
            <QuickLink href="/admin/media" title="Galleria Media" desc="Carica foto, video e highlights" />
            <QuickLink href="/admin/sponsor" title="Sponsor" desc="Gestisci i partner ufficiali della Lega" />
            <QuickLink href="/admin/notifiche" title="Notifiche Push" desc="Invia comunicazioni a tutti gli utenti" />
            <QuickLink href="/admin/impostazioni" title="Impostazioni Lega" desc="Dati generali, stagione e regolamento" />
          </div>
        </div>
      </AdminShell>
    </Container>
  );
}

function MetricCard({ icon: Icon, label, value, href }: { icon: typeof Users; label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:border-primary-glow/30">
        <CardContent className="flex flex-col items-center gap-1.5 p-4 text-center">
          <Icon className="size-4 text-primary-glow" />
          <p className="font-score text-2xl font-bold">{value}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 rounded-2xl glass p-4 hover:border-primary-glow/30">
      <div>
        <p className="text-sm font-bold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
