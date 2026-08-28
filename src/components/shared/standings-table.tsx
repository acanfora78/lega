import Link from "next/link";
import { TeamCrest } from "@/components/brand/team-crest";
import { FormBadges } from "@/components/shared/form-badges";
import { FASCE, zonaPerPosizione } from "@/lib/coppe";
import type { RigaClassifica, Squadra } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StandingsTable({
  righe,
  squadre,
  compact = false,
  /**
   * Mostra il binario colorato con la zona di qualificazione accanto alla
   * posizione. Va attivato solo sulla classifica generale: sulle classifiche
   * parziali (casa, trasferta, attacco...) il posizionamento non determina
   * l'accesso alle coppe, quindi indicarlo sarebbe fuorviante.
   */
  mostraCoppe = false,
  /**
   * Totale delle squadre del campionato: le fasce vanno calcolate sull'intera
   * classifica anche quando qui se ne mostra solo un estratto (es. top 5 in home).
   */
  totaleSquadre,
}: {
  righe: RigaClassifica[];
  squadre: Squadra[];
  compact?: boolean;
  mostraCoppe?: boolean;
  totaleSquadre?: number;
}) {
  const mappa = new Map(squadre.map((s) => [s.id, s]));
  const totale = totaleSquadre ?? righe.length;

  return (
    <div className="relative rounded-2xl glass">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 rounded-r-2xl bg-gradient-to-l from-surface/90 to-transparent sm:hidden" />
      <div className="overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="w-12 px-3 py-3 text-center">#</th>
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
            {mostraCoppe && <th className="px-2 py-3 text-center">Coppa</th>}
            {!compact && <th className="px-3 py-3 text-center">Forma</th>}
          </tr>
        </thead>
        <tbody>
          {righe.map((r) => {
            const squadra = mappa.get(r.squadraId);
            if (!squadra) return null;
            const fascia = mostraCoppe ? FASCE[zonaPerPosizione(r.posizione, totale)] : undefined;
            return (
              <tr
                key={r.squadraId}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.03]"
              >
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {fascia && (
                      <span
                        className="h-6 w-1 shrink-0 rounded-full"
                        style={{ background: fascia.colore }}
                        title={fascia.descrizione}
                        aria-label={fascia.etichetta}
                      />
                    )}
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-md font-score text-xs font-bold",
                        fascia?.zona === "esclusa" ? "text-danger" : "text-muted-foreground"
                      )}
                    >
                      {r.posizione}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-3">
                  <Link href={`/squadre/${squadra.slug}`} className="flex items-center gap-2.5 font-semibold hover:text-primary-glow">
                    <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} logoUrl={squadra.logoUrl} size={24} />
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
                {mostraCoppe && fascia && (
                  <td className="px-2 py-3 text-center">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        color: fascia.zona === "esclusa" ? "var(--muted-foreground)" : fascia.colore,
                        background:
                          fascia.zona === "esclusa"
                            ? "rgba(255,255,255,0.05)"
                            : `color-mix(in oklab, ${fascia.colore} 16%, transparent)`,
                      }}
                      title={fascia.descrizione}
                    >
                      {fascia.etichettaBreve}
                    </span>
                  </td>
                )}
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
