import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { DemoBanner } from "@/components/admin/demo-banner";
import { TeamCrest } from "@/components/brand/team-crest";
import { Badge } from "@/components/ui/badge";
import { getPartite, getSquadraById } from "@/lib/data";
import { formatDateIt, formatTimeIt } from "@/lib/utils";
import { Settings2 } from "lucide-react";

export const metadata: Metadata = { title: "Partite & Risultati" };

export default function AdminPartitePage() {
  const partite = [...getPartite()].sort((a, b) => a.giornata - b.giornata);

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Partite &amp; Risultati</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestisci calendario, formazioni, gol, cartellini e MVP di ogni sfida.</p>
      </div>
      <DemoBanner />
      <AdminShell>
        <div className="overflow-hidden rounded-2xl glass">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Giornata</th>
                <th className="px-2 py-3">Data</th>
                <th className="px-2 py-3">Sfida</th>
                <th className="px-2 py-3 text-center">Risultato</th>
                <th className="px-2 py-3 text-center">Stato</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {partite.map((p) => {
                const casa = getSquadraById(p.squadraCasaId)!;
                const trasferta = getSquadraById(p.squadraTrasfertaId)!;
                return (
                  <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-semibold">G{p.giornata}</td>
                    <td className="px-2 py-3 text-muted-foreground">
                      {formatDateIt(p.dataOra)} · {formatTimeIt(p.dataOra)}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1.5">
                        <TeamCrest nome={casa.nome} colors={casa.coloriSociali} size={20} />
                        <span className="text-xs font-semibold">{casa.nomeBreve}</span>
                        <span className="text-muted-foreground">vs</span>
                        <TeamCrest nome={trasferta.nome} colors={trasferta.coloriSociali} size={20} />
                        <span className="text-xs font-semibold">{trasferta.nomeBreve}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center font-score font-bold tabular-nums">
                      {p.stato === "programmata" ? "—" : `${p.golCasa}-${p.golTrasferta}`}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Badge
                        variant={p.stato === "live" ? "live" : p.stato === "conclusa" ? "muted" : "outline"}
                        className="capitalize"
                      >
                        {p.stato}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/partite/${p.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold hover:bg-white/[0.1]"
                      >
                        <Settings2 className="size-3.5" /> Gestisci
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminShell>
    </Container>
  );
}
