"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StandingsTable } from "@/components/shared/standings-table";
import { TeamCrest } from "@/components/brand/team-crest";
import { getSquadraById } from "@/lib/data";
import type { RigaClassifica } from "@/lib/types";

export function ClassificaTabs({
  generale,
  casa,
  trasferta,
  attacco,
  difesa,
  fairPlay,
}: {
  generale: RigaClassifica[];
  casa: RigaClassifica[];
  trasferta: RigaClassifica[];
  attacco: RigaClassifica[];
  difesa: RigaClassifica[];
  fairPlay: RigaClassifica[];
}) {
  return (
    <Tabs defaultValue="generale">
      <TabsList>
        <TabsTrigger value="generale">Generale</TabsTrigger>
        <TabsTrigger value="casa">Casa</TabsTrigger>
        <TabsTrigger value="trasferta">Trasferta</TabsTrigger>
        <TabsTrigger value="attacco">Miglior attacco</TabsTrigger>
        <TabsTrigger value="difesa">Miglior difesa</TabsTrigger>
        <TabsTrigger value="fairplay">Fair Play</TabsTrigger>
      </TabsList>

      <TabsContent value="generale" className="mt-5">
        <StandingsTable righe={generale} />
      </TabsContent>
      <TabsContent value="casa" className="mt-5">
        <StandingsTable righe={casa} compact />
      </TabsContent>
      <TabsContent value="trasferta" className="mt-5">
        <StandingsTable righe={trasferta} compact />
      </TabsContent>
      <TabsContent value="attacco" className="mt-5">
        <StandingsTable righe={attacco} />
      </TabsContent>
      <TabsContent value="difesa" className="mt-5">
        <StandingsTable righe={difesa} />
      </TabsContent>
      <TabsContent value="fairplay" className="mt-5">
        <FairPlayTable righe={fairPlay} />
      </TabsContent>
    </Tabs>
  );
}

function FairPlayTable({ righe }: { righe: RigaClassifica[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl glass">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="w-10 px-3 py-3 text-center">#</th>
            <th className="px-2 py-3">Squadra</th>
            <th className="px-2 py-3 text-center">Ammonizioni</th>
            <th className="px-2 py-3 text-center">Espulsioni</th>
            <th className="px-2 py-3 text-center font-bold text-foreground">Indice disciplinare</th>
          </tr>
        </thead>
        <tbody>
          {righe.map((r, idx) => (
            <FairPlayRow key={r.squadraId} riga={r} posizione={idx + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FairPlayRow({ riga, posizione }: { riga: RigaClassifica; posizione: number }) {
  const squadra = getSquadraById(riga.squadraId);
  if (!squadra) return null;
  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
      <td className="px-3 py-3 text-center font-score text-xs font-bold text-muted-foreground">{posizione}</td>
      <td className="px-2 py-3">
        <Link href={`/squadre/${squadra.slug}`} className="flex items-center gap-2.5 font-semibold hover:text-primary-glow">
          <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} size={24} />
          {squadra.nomeBreve}
        </Link>
      </td>
      <td className="px-2 py-3 text-center tabular-nums text-amber-400">{riga.ammonizioni}</td>
      <td className="px-2 py-3 text-center tabular-nums text-danger">{riga.espulsioni}</td>
      <td className="px-2 py-3 text-center font-score text-base font-bold tabular-nums">{riga.ammonizioni + riga.espulsioni * 3}</td>
    </tr>
  );
}
