import Link from "next/link";
import { Trophy, Crown, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VoceAlboOroStorico } from "@/lib/data/storico";
import { cn } from "@/lib/utils";

/**
 * Albo d'oro della competizione: l'elenco delle stagioni vinte, più il conteggio
 * dei titoli per squadra. Compare in fondo alla pagina di ogni stagione passata,
 * così dalla singola annata si vede subito la storia dell'intero torneo.
 */
export function AlboOro({
  voci,
  titoli,
  nomeCompetizione,
}: {
  voci: VoceAlboOroStorico[];
  titoli: { squadra: string; titoli: number }[];
  nomeCompetizione: string;
}) {
  if (!voci.length) {
    return (
      <div className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
        Nessuna stagione conclusa con un vincitore registrato per {nomeCompetizione}.
      </div>
    );
  }

  const plurimi = titoli.filter((t) => t.titoli > 1);

  return (
    <div className="flex flex-col gap-4">
      {plurimi.length > 0 && (
        <Card className="border-gold/20">
          <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-2 p-4 text-xs sm:p-5">
            <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wide text-muted-foreground">
              <Crown className="size-3.5 text-gold-bright" /> Più titolate
            </span>
            {plurimi.map((t) => (
              <span key={t.squadra} className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">{t.squadra}</span>
                <Badge variant="gold">{t.titoli}×</Badge>
              </span>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="overflow-hidden rounded-2xl glass">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Stagione</th>
                <th className="px-2 py-3">Campione</th>
                <th className="px-2 py-3">2ª</th>
                <th className="px-2 py-3">3ª</th>
                <th className="px-4 py-3">Capocannoniere</th>
              </tr>
            </thead>
            <tbody>
              {voci.map((v) => (
                <tr
                  key={v.id}
                  className={cn(
                    "border-b border-border/60 last:border-0",
                    v.corrente ? "bg-gold/[0.07]" : "hover:bg-white/[0.03]"
                  )}
                >
                  <td className="px-4 py-3">
                    {v.corrente ? (
                      <span className="flex items-center gap-2 font-score font-bold text-gold-bright">
                        {v.stagione}
                        <Badge variant="gold">questa stagione</Badge>
                      </span>
                    ) : (
                      <Link
                        href={`/campionati-passati/${v.id}`}
                        className="font-score font-bold text-foreground hover:text-primary-glow"
                      >
                        {v.stagione}
                      </Link>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Trophy className="size-3.5 shrink-0 text-gold-bright" />
                      {v.vincitore}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{v.secondo ?? "—"}</td>
                  <td className="px-2 py-3 text-muted-foreground">{v.terzo ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {v.capocannoniere ? (
                      <span className="flex items-center gap-1.5">
                        <Target className="size-3.5 shrink-0 text-primary-glow" />
                        {v.capocannoniere.giocatore}
                        <span className="font-score font-bold text-foreground">{v.capocannoniere.gol}</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
