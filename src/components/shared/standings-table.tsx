import Link from "next/link";
import { TeamCrest } from "@/components/brand/team-crest";
import { FormBadges } from "@/components/shared/form-badges";
import { getSquadraById } from "@/lib/data";
import type { RigaClassifica } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StandingsTable({
  righe,
  highlightTop = 2,
  highlightBottom = 1,
  compact = false,
}: {
  righe: RigaClassifica[];
  highlightTop?: number;
  highlightBottom?: number;
  compact?: boolean;
}) {
  return (
    <div className="relative rounded-2xl glass">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 rounded-r-2xl bg-gradient-to-l from-surface/90 to-transparent sm:hidden" />
      <div className="overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="w-10 px-3 py-3 text-center">#</th>
            <th className="px-2 py-3">Squadra</th>
            <th className="px-2 py-3 text-center">G</th>
            <th className="px-2 py-3 text-center">V</th>
            <th className="px-2 py-3 text-center">N</th>
            <th className="px-2 py-3 text-center">P</th>
            {!compact && (
              <>
                <th className="px-2 py-3 text-center">GF</th>
                <th className="px-2 py-3 text-center">GS</th>
              </>
            )}
            <th className="px-2 py-3 text-center">DR</th>
            <th className="px-2 py-3 text-center font-bold text-foreground">Pt</th>
            {!compact && <th className="px-3 py-3 text-center">Forma</th>}
          </tr>
        </thead>
        <tbody>
          {righe.map((r, idx) => {
            const squadra = getSquadraById(r.squadraId);
            if (!squadra) return null;
            const isTop = idx < highlightTop;
            const isBottom = idx >= righe.length - highlightBottom;
            return (
              <tr
                key={r.squadraId}
                className={cn(
                  "border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.03]",
                )}
              >
                <td className="px-3 py-3 text-center">
                  <span
                    className={cn(
                      "mx-auto flex size-6 items-center justify-center rounded-md font-score text-xs font-bold",
                      isTop && "bg-primary/20 text-primary-glow",
                      isBottom && "bg-danger/20 text-danger",
                      !isTop && !isBottom && "text-muted-foreground"
                    )}
                  >
                    {r.posizione}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <Link href={`/squadre/${squadra.slug}`} className="flex items-center gap-2.5 font-semibold hover:text-primary-glow">
                    <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} size={24} />
                    <span className="truncate">{squadra.nomeBreve}</span>
                  </Link>
                </td>
                <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.giocate}</td>
                <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.vinte}</td>
                <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.pareggiate}</td>
                <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.perse}</td>
                {!compact && (
                  <>
                    <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.golFatti}</td>
                    <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.golSubiti}</td>
                  </>
                )}
                <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">
                  {r.golFatti - r.golSubiti > 0 ? "+" : ""}
                  {r.golFatti - r.golSubiti}
                </td>
                <td className="px-2 py-3 text-center font-score text-base font-bold tabular-nums">{r.punti}</td>
                {!compact && (
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <FormBadges risultati={r.ultimeCinque} />
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
