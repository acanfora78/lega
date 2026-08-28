"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaderboard } from "@/components/statistiche/leaderboard";
import type { Giocatore, Squadra } from "@/lib/types";

// Le medie voto arrivano già formattate a due decimali (stringa), i conteggi
// come numero: la Leaderboard accetta entrambi e li stampa così come sono.
type Voce = { giocatore: Giocatore; value: number | string };

export function StatisticheTabs({
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
  presenzeMinime,
}: {
  marcatori: Voce[];
  assist: Voce[];
  migliorGiocatore: Voce[];
  migliorPortiere: Voce[];
  menoBattuto: Voce[];
  cleanSheet: Voce[];
  ammoniti: Voce[];
  espulsi: Voce[];
  presenze: Voce[];
  mvp: Voce[];
  squadre: Squadra[];
  presenzeMinime: number;
}) {
  return (
    <Tabs defaultValue="marcatori">
      <TabsList>
        <TabsTrigger value="marcatori">Marcatori</TabsTrigger>
        <TabsTrigger value="assist">Assist</TabsTrigger>
        <TabsTrigger value="miglior-giocatore">Miglior giocatore</TabsTrigger>
        <TabsTrigger value="miglior-portiere">Miglior portiere</TabsTrigger>
        <TabsTrigger value="menobattuto">Meno battuto</TabsTrigger>
        <TabsTrigger value="cleansheet">Clean sheet</TabsTrigger>
        <TabsTrigger value="presenze">Presenze</TabsTrigger>
        <TabsTrigger value="ammoniti">Ammoniti</TabsTrigger>
        <TabsTrigger value="espulsi">Espulsi</TabsTrigger>
        <TabsTrigger value="mvp">MVP</TabsTrigger>
      </TabsList>

      <TabsContent value="marcatori" className="mt-5">
        <Leaderboard items={marcatori} unit="gol" squadre={squadre} />
      </TabsContent>
      <TabsContent value="assist" className="mt-5">
        <Leaderboard items={assist} unit="assist" squadre={squadre} />
      </TabsContent>
      <TabsContent value="miglior-giocatore" className="mt-5 flex flex-col gap-3">
        <NotaPagelle presenzeMinime={presenzeMinime} />
        <Leaderboard items={migliorGiocatore} unit="media" squadre={squadre} />
      </TabsContent>
      <TabsContent value="miglior-portiere" className="mt-5 flex flex-col gap-3">
        <NotaPagelle presenzeMinime={presenzeMinime} />
        <Leaderboard items={migliorPortiere} unit="media" squadre={squadre} />
      </TabsContent>
      <TabsContent value="menobattuto" className="mt-5">
        <Leaderboard items={menoBattuto} unit="gol subiti" squadre={squadre} />
      </TabsContent>
      <TabsContent value="cleansheet" className="mt-5">
        <Leaderboard items={cleanSheet} unit="clean sheet" squadre={squadre} />
      </TabsContent>
      <TabsContent value="presenze" className="mt-5">
        <Leaderboard items={presenze} unit="presenze" squadre={squadre} />
      </TabsContent>
      <TabsContent value="ammoniti" className="mt-5">
        <Leaderboard items={ammoniti} unit="gialli" squadre={squadre} />
      </TabsContent>
      <TabsContent value="espulsi" className="mt-5">
        <Leaderboard items={espulsi} unit="rossi" squadre={squadre} />
      </TabsContent>
      <TabsContent value="mvp" className="mt-5">
        <Leaderboard items={mvp} unit="MVP" squadre={squadre} />
      </TabsContent>
    </Tabs>
  );
}

function NotaPagelle({ presenzeMinime }: { presenzeMinime: number }) {
  return (
    <p className="rounded-xl glass px-4 py-2.5 text-xs text-muted-foreground">
      Media dei voti assegnati dall&apos;organizzatore nei tabellini. Entrano in classifica i giocatori con almeno{" "}
      <span className="font-semibold text-foreground">{presenzeMinime} partite votate</span>.
    </p>
  );
}
