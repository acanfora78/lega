"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { RigaClassificaStorica } from "@/lib/types";

export function StandingsTableStorica({ righe }: { righe: RigaClassificaStorica[] }) {
  return (
    <TooltipProvider>
      <div className="relative rounded-2xl glass">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 rounded-r-2xl bg-gradient-to-l from-surface/90 to-transparent sm:hidden" />
        <div className="overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-10 px-3 py-3 text-center">#</th>
                <th className="px-2 py-3">Squadra</th>
                <th className="px-2 py-3 text-center">G</th>
                <th className="px-2 py-3 text-center">V</th>
                <th className="px-2 py-3 text-center">N</th>
                <th className="px-2 py-3 text-center">P</th>
                <th className="px-2 py-3 text-center">GF</th>
                <th className="px-2 py-3 text-center">GS</th>
                <th className="px-3 py-3 text-center font-bold text-foreground">Pt</th>
              </tr>
            </thead>
            <tbody>
              {righe.map((r) => (
                <tr key={r.posizione} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-3 py-3 text-center">
                    <span
                      className={cn(
                        "mx-auto flex size-6 items-center justify-center rounded-md font-score text-xs font-bold",
                        r.posizione === 1 ? "bg-gold/20 text-gold-bright" : "text-muted-foreground"
                      )}
                    >
                      {r.posizione}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1.5 font-semibold">
                      {r.squadra}
                      {r.nota && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" aria-label="Nota sulla riga" className="text-warning">
                              <Info className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">{r.nota}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.giocate}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.vinte}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.pareggiate ?? "—"}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.perse ?? "—"}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.golFatti ?? "—"}</td>
                  <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">{r.golSubiti ?? "—"}</td>
                  <td className="px-3 py-3 text-center font-score text-base font-bold tabular-nums">{r.punti}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}
