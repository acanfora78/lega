import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, ClipboardList, Settings2 } from "lucide-react";
import { Container } from "@/components/shared/container";
import { AdminShell } from "@/components/admin/admin-shell";
import { TeamCrest } from "@/components/brand/team-crest";
import { Badge } from "@/components/ui/badge";
import { getPartite, getSquadre } from "@/lib/data";

export const metadata: Metadata = { title: "Distinte di gara" };

export default async function AdminDistintePage() {
  const [partite, squadre] = await Promise.all([getPartite(), getSquadre()]);
  const squadreMap = new Map(squadre.map((s) => [s.id, s]));

  const righe = [...partite]
    .sort((a, b) => a.giornata - b.giornata || new Date(a.dataOra).getTime() - new Date(b.dataOra).getTime())
    .map((p) => ({ partita: p, casa: squadreMap.get(p.squadraCasaId), trasferta: squadreMap.get(p.squadraTrasfertaId) }))
    .filter((r): r is { partita: (typeof partite)[number]; casa: NonNullable<typeof r.casa>; trasferta: NonNullable<typeof r.trasferta> } =>
      Boolean(r.casa && r.trasferta)
    );

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Area Organizzatore</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Distinte di gara</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scegli la partita per segnare chi è presente e chi parte titolare, squadra per squadra. Gol, cartellini e
          voti si compilano a parte, dal Tabellino dentro la gestione della singola partita.
        </p>
      </div>
      <AdminShell>
        {righe.length === 0 ? (
          <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">
            Nessuna partita ancora in calendario: caricala prima da Partite &amp; Risultati.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {righe.map(({ partita, casa, trasferta }) => {
              const casaCompilata = Boolean(partita.formazioneCasa?.length);
              const trasfertaCompilata = Boolean(partita.formazioneTrasferta?.length);
              return (
                <Link
                  key={partita.id}
                  href={`/admin/distinte/${partita.id}`}
                  className="flex flex-wrap items-center gap-3 rounded-2xl glass p-3.5 hover:border-primary-glow/30 sm:flex-nowrap"
                >
                  <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-bold">G{partita.giornata}</span>
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <TeamCrest nome={casa.nome} colors={casa.coloriSociali} logoUrl={casa.logoUrl} size={22} />
                    <span className="truncate text-sm font-semibold">{casa.nomeBreve}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">vs</span>
                    <TeamCrest nome={trasferta.nome} colors={trasferta.coloriSociali} logoUrl={trasferta.logoUrl} size={22} />
                    <span className="truncate text-sm font-semibold">{trasferta.nomeBreve}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant={casaCompilata ? "default" : "muted"} className="gap-1">
                      <ClipboardCheck className="size-3" /> {casa.nomeBreve}
                    </Badge>
                    <Badge variant={trasfertaCompilata ? "default" : "muted"} className="gap-1">
                      <ClipboardCheck className="size-3" /> {trasferta.nomeBreve}
                    </Badge>
                  </div>
                  <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold sm:ml-0">
                    <Settings2 className="size-3.5" /> Compila
                  </span>
                </Link>
              );
            })}
          </div>
        )}
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClipboardList className="size-3.5 shrink-0" /> Il pallino colorato indica se la distinta di quella squadra è già stata salvata.
        </p>
      </AdminShell>
    </Container>
  );
}
