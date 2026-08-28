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
  getClassificaMigliorGiocatore,
  getClassificaMigliorPortiere,
  PRESENZE_MINIME_PER_MEDIA,
  getStagioneAttuale,
  getSquadre,
} from "@/lib/data";

export const metadata: Metadata = { title: "Statistiche" };

export default async function StatistichePage() {
  const [
    stagione,
    marcatori,
    assist,
    migliorGiocatore,
    migliorPortiere,
    menoBattuto,
    cleanSheet,
    ammoniti,
    espulsi,
    presenze,
    mvp,
    squadre,
  ] = await Promise.all([
    getStagioneAttuale(),
    getClassificaMarcatori(20),
    getClassificaAssist(20),
    getClassificaMigliorGiocatore(20),
    getClassificaMigliorPortiere(20),
    getMigliorPortiere(20),
    getClassificaCleanSheet(20),
    getClassificaAmmonizioni(20),
    getClassificaEspulsioni(20),
    getClassificaPresenze(20),
    getClassificaMvp(20),
    getSquadre(),
  ]);

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Stagione {stagione.etichetta}</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Centro Statistiche</h1>
        <p className="mt-1 text-sm text-muted-foreground">Numeri, record e la corsa ai titoli individuali della Lega.</p>
      </div>

      <StatisticheTabs
        marcatori={marcatori.map((x) => ({ giocatore: x.giocatore, value: x.stat!.goal }))}
        assist={assist.map((x) => ({ giocatore: x.giocatore, value: x.stat!.assist }))}
        migliorGiocatore={migliorGiocatore.map((x) => ({ giocatore: x.giocatore, value: x.media.toFixed(2) }))}
        migliorPortiere={migliorPortiere.map((x) => ({ giocatore: x.giocatore, value: x.media.toFixed(2) }))}
        menoBattuto={menoBattuto.map((x) => ({ giocatore: x.giocatore, value: x.stat!.golSubiti ?? 0 }))}
        presenzeMinime={PRESENZE_MINIME_PER_MEDIA}
        cleanSheet={cleanSheet.map((x) => ({ giocatore: x.giocatore, value: x.stat!.cleanSheet ?? 0 }))}
        ammoniti={ammoniti.map((x) => ({ giocatore: x.giocatore, value: x.stat!.ammonizioni }))}
        espulsi={espulsi.map((x) => ({ giocatore: x.giocatore, value: x.stat!.espulsioni }))}
        presenze={presenze.map((x) => ({ giocatore: x.giocatore, value: x.stat!.presenze }))}
        mvp={mvp.map((x) => ({ giocatore: x.giocatore, value: x.stat!.mvp }))}
        squadre={squadre}
      />
    </Container>
  );
}
