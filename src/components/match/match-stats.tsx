import { StatBar } from "@/components/shared/stat-bar";
import type { StatistichePartita } from "@/lib/types";

export function MatchStats({ stats }: { stats?: StatistichePartita }) {
  if (!stats) {
    return <p className="text-sm text-muted-foreground">Le statistiche saranno disponibili al calcio d&apos;inizio.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <StatBar label="Possesso palla" home={stats.possessoPalla[0]} away={stats.possessoPalla[1]} format={(v) => `${v}%`} />
      <StatBar label="Tiri totali" home={stats.tiri[0]} away={stats.tiri[1]} />
      <StatBar label="Tiri in porta" home={stats.tiriInPorta[0]} away={stats.tiriInPorta[1]} />
      <StatBar label="Corner" home={stats.corner[0]} away={stats.corner[1]} />
      <StatBar label="Parate" home={stats.parate[0]} away={stats.parate[1]} />
      <StatBar label="Falli" home={stats.falli[0]} away={stats.falli[1]} />
      <StatBar label="Fuorigioco" home={stats.fuorigioco[0]} away={stats.fuorigioco[1]} />
    </div>
  );
}
