"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaderboard } from "@/components/statistiche/leaderboard";
import type { Giocatore, Squadra } from "@/lib/types";

type Voce = { giocatore: Giocatore; value: number };

export function StatisticheTabs({
  marcatori,
  assist,
  portieri,
  cleanSheet,
  ammoniti,
  espulsi,
  presenze,
  mvp,
  squadre,
}: {
  marcatori: Voce[];
  assist: Voce[];
  portieri: Voce[];
  cleanSheet: Voce[];
  ammoniti: Voce[];
  espulsi: Voce[];
  presenze: Voce[];
  mvp: Voce[];
  squadre: Squadra[];
}) {
  return (
    <Tabs defaultValue="marcatori">
      <TabsList>
        <TabsTrigger value="marcatori">Marcatori</TabsTrigger>
        <TabsTrigger value="assist">Assist</TabsTrigger>
        <TabsTrigger value="portieri">Miglior portiere</TabsTrigger>
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
      <TabsContent value="portieri" className="mt-5">
        <Leaderboard items={portieri} unit="gol subiti" squadre={squadre} />
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
