import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { ClassificaTabs } from "@/components/shared/classifica-tabs";
import { LegendaCoppe } from "@/components/shared/legenda-coppe";
import { OrganizerOnly } from "@/components/shared/organizer-area-link";
import { Button } from "@/components/ui/button";
import {
  getClassificaGenerale,
  getClassificaCasa,
  getClassificaTrasferta,
  getMigliorAttacco,
  getMigliorDifesa,
  getClassificaFairPlay,
  getStagioneAttuale,
  getSquadre,
} from "@/lib/data";
import { Trophy, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Classifica" };

export default async function ClassificaPage() {
  const [generale, stagione, casa, trasferta, attacco, difesa, fairPlay, squadre] = await Promise.all([
    getClassificaGenerale(),
    getStagioneAttuale(),
    getClassificaCasa(),
    getClassificaTrasferta(),
    getMigliorAttacco(),
    getMigliorDifesa(),
    getClassificaFairPlay(),
    getSquadre(),
  ]);

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Stagione {stagione.etichetta}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Classifica</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          La corsa al titolo della Lega, aggiornata automaticamente ad ogni triplice fischio.
        </p>
      </div>

      {generale.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl glass p-12 text-center">
          <Trophy className="size-8 text-muted-foreground" />
          <p className="font-display text-lg font-bold">Classifica non ancora disponibile</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Comparirà automaticamente non appena l&apos;area organizzatore avrà aggiunto squadre e risultati.
          </p>
          <OrganizerOnly>
            <Button asChild className="mt-2">
              <Link href="/admin/squadre">
                <ShieldCheck className="size-4" /> Configura le squadre
              </Link>
            </Button>
          </OrganizerOnly>
        </div>
      ) : (
        <>
          <LegendaCoppe totaleSquadre={generale.length} />

          <ClassificaTabs
            generale={generale}
            casa={casa}
            trasferta={trasferta}
            attacco={attacco}
            difesa={difesa}
            fairPlay={fairPlay}
            squadre={squadre}
          />
        </>
      )}
    </Container>
  );
}
