import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { LegaMonogram } from "@/components/brand/pitch-art";
import { NotificationSettings } from "@/components/shared/notification-settings";
import { Card, CardContent } from "@/components/ui/card";
import {
  Archive,
  BarChart3,
  Bell,
  Crown,
  Gavel,
  Images,
  MapPinned,
  Newspaper,
  Search,
  ShieldCheck,
  User,
  ChevronRight,
  Info,
} from "lucide-react";

export const metadata: Metadata = { title: "Altro" };

const VOCI = [
  { href: "/statistiche", label: "Centro Statistiche", desc: "Marcatori, assist, record e leaderboard", icon: BarChart3 },
  { href: "/campionati-passati", label: "Campionati Passati", desc: "Classifiche e marcatori delle stagioni concluse", icon: Archive },
  { href: "/hall-of-fame", label: "Hall of Fame", desc: "Albo d'oro e leggende della Lega", icon: Crown },
  { href: "/media", label: "Media Center", desc: "Foto, video e highlights", icon: Images },
  { href: "/news", label: "News & Comunicati", desc: "Tutte le notizie ufficiali", icon: Newspaper },
  { href: "/disciplinare", label: "Giudice Sportivo", desc: "Squalifiche, diffide e conteggio cartellini", icon: Gavel },
  { href: "/campo", label: "Campo Santa Teresa", desc: "Come arrivare, servizi e regolamento", icon: MapPinned },
  { href: "/ricerca", label: "Ricerca", desc: "Squadre, giocatori, partite e sponsor", icon: Search },
  { href: "/profilo", label: "Il tuo profilo", desc: "Preferenze, squadra del cuore, dark mode", icon: User },
  { href: "/admin", label: "Area Organizzatore", desc: "Gestione completa del campionato", icon: ShieldCheck },
];

export default function AltroPage() {
  return (
    <Container className="flex flex-col gap-8 pt-6 sm:pt-10">
      <div className="flex items-center gap-3">
        <LegaMonogram size={44} />
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Altro</h1>
          <p className="text-sm text-muted-foreground">Tutto il resto della Lega Calcio Over 40, in un solo posto.</p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {VOCI.map((v) => (
          <Link key={v.href} href={v.href} className="flex items-center gap-3.5 rounded-2xl glass p-4 hover:border-primary-glow/30">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-glow">
              <v.icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{v.label}</p>
              <p className="truncate text-xs text-muted-foreground">{v.desc}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </section>

      <section id="notifiche" className="scroll-mt-24">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <Bell className="size-5 text-gold-bright" /> Notifiche Push
        </h2>
        <NotificationSettings />
      </section>

      <Card>
        <CardContent className="flex items-start gap-3 p-5">
          <Info className="mt-0.5 size-4 shrink-0 text-primary-glow" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Lega Calcio Over 40 — Campo Sportivo Santa Teresa, Scafati (SA). App ufficiale del campionato amatoriale
            riservato agli atleti Over 40. Versione 1.0.0.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
