import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { StatisticheTabs } from "@/components/statistiche/statistiche-tabs";
import {
  getClassificaMarcatori,
  getClassificaAssist,
  getClassificaAmmonizioni,
  getClassificaEspulsioni,
  getClassificaMvp,
  getClassificaPresenze,
  getClassificaCleanSheet,
  getMigliorPortiere,
  getStagioneAttuale,
} from "@/lib/data";

export const metadata: Metadata = { title: "Statistiche" };

export default function StatistichePage() {
  const stagione = getStagioneAttuale();
  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Stagione {stagione.etichetta}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Centro Statistiche</h1>
        <p className="mt-1 text-sm text-muted-foreground">Numeri, record e la corsa ai titoli individuali della Lega.</p>
      </div>

      <StatisticheTabs
        marcatori={getClassificaMarcatori(20).map((x) => ({ giocatore: x.giocatore, value: x.stat!.goal }))}
        assist={getClassificaAssist(20).map((x) => ({ giocatore: x.giocatore, value: x.stat!.assist }))}
        portieri={getMigliorPortiere(20).map((x) => ({ giocatore: x.giocatore, value: x.stat!.golSubiti ?? 0 }))}
        cleanSheet={getClassificaCleanSheet(20).map((x) => ({ giocatore: x.giocatore, value: x.stat!.cleanSheet ?? 0 }))}
        ammoniti={getClassificaAmmonizioni(20).map((x) => ({ giocatore: x.giocatore, value: x.stat!.ammonizioni }))}
        espulsi={getClassificaEspulsioni(20).map((x) => ({ giocatore: x.giocatore, value: x.stat!.espulsioni }))}
        presenze={getClassificaPresenze(20).map((x) => ({ giocatore: x.giocatore, value: x.stat!.presenze }))}
        mvp={getClassificaMvp(20).map((x) => ({ giocatore: x.giocatore, value: x.stat!.mvp }))}
      />
    </Container>
  );
}
