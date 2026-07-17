"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MatchCard } from "@/components/match/match-card";
import { NOW } from "@/lib/mock/now";
import type { Partita, Squadra } from "@/lib/types";

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function PartiteExplorer({ partite, squadre }: { partite: Partita[]; squadre: Squadra[] }) {
  const [squadraId, setSquadraId] = useState<string>("tutte");

  const filtrate = useMemo(
    () => (squadraId === "tutte" ? partite : partite.filter((p) => p.squadraCasaId === squadraId || p.squadraTrasfertaId === squadraId)),
    [partite, squadraId]
  );

  const oggi = filtrate.filter((p) => isSameDay(new Date(p.dataOra), NOW)).sort((a, b) => +new Date(a.dataOra) - +new Date(b.dataOra));
  const prossime = filtrate.filter((p) => p.stato === "programmata").sort((a, b) => +new Date(a.dataOra) - +new Date(b.dataOra));
  const concluse = filtrate.filter((p) => p.stato === "conclusa" || p.stato === "live" || p.stato === "intervallo").sort((a, b) => +new Date(b.dataOra) - +new Date(a.dataOra));

  const perGiornata = (lista: Partita[]) => {
    const gruppi = new Map<number, Partita[]>();
    lista.forEach((p) => {
      if (!gruppi.has(p.giornata)) gruppi.set(p.giornata, []);
      gruppi.get(p.giornata)!.push(p);
    });
    return Array.from(gruppi.entries());
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs defaultValue="oggi">
          <TabsList>
            <TabsTrigger value="oggi">Oggi</TabsTrigger>
            <TabsTrigger value="prossime">Prossime</TabsTrigger>
            <TabsTrigger value="concluse">Concluse</TabsTrigger>
          </TabsList>

          <Select value={squadraId} onValueChange={setSquadraId}>
            <SelectTrigger className="mt-3 w-full sm:w-56">
              <SelectValue placeholder="Tutte le squadre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tutte">Tutte le squadre</SelectItem>
              {squadre.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nomeBreve}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TabsContent value="oggi" className="mt-5">
            {oggi.length === 0 ? (
              <EmptyState label="Nessuna partita in programma oggi." />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {oggi.map((p) => (
                  <MatchCard key={p.id} partita={p} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prossime" className="mt-5 flex flex-col gap-6">
            {prossime.length === 0 ? (
              <EmptyState label="Nessuna partita futura per questo filtro." />
            ) : (
              perGiornata(prossime).map(([giornata, lista]) => (
                <div key={giornata}>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Giornata {giornata}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {lista.map((p) => (
                      <MatchCard key={p.id} partita={p} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="concluse" className="mt-5 flex flex-col gap-6">
            {concluse.length === 0 ? (
              <EmptyState label="Nessuna partita conclusa per questo filtro." />
            ) : (
              perGiornata(concluse).map(([giornata, lista]) => (
                <div key={giornata}>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Giornata {giornata}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {lista.map((p) => (
                      <MatchCard key={p.id} partita={p} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">{label}</div>;
}
