import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { AccountStatus } from "@/components/profile/account-status";
import { ProfilePreferences } from "@/components/profile/profile-preferences";
import { OrganizerAreaLink } from "@/components/shared/organizer-area-link";
import { getSquadre, getGiocatori } from "@/lib/data";
import { User, Bell } from "lucide-react";

export const metadata: Metadata = { title: "Profilo" };

export default async function ProfiloPage() {
  const [squadre, giocatori] = await Promise.all([getSquadre(), getGiocatori()]);

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div className="flex items-center gap-3">
        <span className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-glow to-primary">
          <User className="size-7 text-primary-foreground" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Il tuo profilo</h1>
          <p className="text-sm text-muted-foreground">Personalizza la tua esperienza nella Lega Calcio Over 40.</p>
        </div>
      </div>

      <AccountStatus />

      <ProfilePreferences squadre={squadre} giocatori={giocatori} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/altro#notifiche" className="flex items-center gap-3 rounded-2xl glass p-4 hover:border-primary-glow/30 sm:flex-1">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary-glow">
            <Bell className="size-4" />
          </span>
          <div>
            <p className="text-sm font-bold">Gestisci notifiche</p>
            <p className="text-xs text-muted-foreground">Goal, news e comunicati della Lega</p>
          </div>
        </Link>
        {/* Compare solo a chi ha già effettuato l'accesso come organizzatore: nessun
            nodo nel DOM per chiunque altro, quindi "Gestisci notifiche" resta sola
            e a piena larghezza invece di lasciare mezzo rigo vuoto accanto. */}
        <OrganizerAreaLink variant="card" />
      </div>
    </Container>
  );
}
