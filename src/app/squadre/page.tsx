import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { OrganizerOnly } from "@/components/shared/organizer-area-link";
import { TeamCard } from "@/components/team/team-card";
import { Button } from "@/components/ui/button";
import { getSquadre, getRigaClassifica, getStagioneAttuale } from "@/lib/data";
import { ShieldCheck, Users } from "lucide-react";

export const metadata: Metadata = { title: "Squadre" };

export default async function SquadrePage() {
  const [squadre, stagione] = await Promise.all([getSquadre(), getStagioneAttuale()]);
  const righeClassifica = new Map(
    await Promise.all(squadre.map(async (s) => [s.id, await getRigaClassifica(s.id)] as const))
  );

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Stagione {stagione.etichetta}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Le Squadre della Lega</h1>
        <p className="mt-1 text-sm text-muted-foreground">Il campionato, club per club.</p>
      </div>

      {squadre.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl glass p-12 text-center">
          <Users className="size-8 text-muted-foreground" />
          <p className="font-display text-lg font-bold">Nessuna squadra ancora configurata</p>
          <p className="max-w-md text-sm text-muted-foreground">
            L&apos;area organizzatore può iniziare ad aggiungere i club iscritti al campionato dal pannello di gestione.
          </p>
          <OrganizerOnly>
            <Button asChild className="mt-2">
              <Link href="/admin/squadre">
                <ShieldCheck className="size-4" /> Aggiungi la prima squadra
              </Link>
            </Button>
          </OrganizerOnly>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {squadre.map((s) => (
            <TeamCard key={s.id} squadra={s} riga={righeClassifica.get(s.id)} />
          ))}
        </div>
      )}
    </Container>
  );
}
