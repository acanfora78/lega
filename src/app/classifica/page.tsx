import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { ClassificaTabs } from "@/components/shared/classifica-tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  getClassificaGenerale,
  getClassificaCasa,
  getClassificaTrasferta,
  getMigliorAttacco,
  getMigliorDifesa,
  getClassificaFairPlay,
} from "@/lib/data";

export const metadata: Metadata = { title: "Classifica" };

export default function ClassificaPage() {
  const generale = getClassificaGenerale();

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Stagione 2025/2026</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Classifica</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          La corsa al titolo della Lega Calcio Over 40, aggiornata automaticamente ad ogni triplice fischio.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 text-xs text-muted-foreground sm:p-5">
          <span className="mr-4 inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-primary/60" /> Zona Campione
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-danger/60" /> Zona retrocessione
          </span>
        </CardContent>
      </Card>

      <ClassificaTabs
        generale={generale}
        casa={getClassificaCasa()}
        trasferta={getClassificaTrasferta()}
        attacco={getMigliorAttacco()}
        difesa={getMigliorDifesa()}
        fairPlay={getClassificaFairPlay()}
      />
    </Container>
  );
}
