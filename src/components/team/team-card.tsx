import Link from "next/link";
import { TeamCrest } from "@/components/brand/team-crest";
import { FormBadges } from "@/components/shared/form-badges";
import type { Squadra, RigaClassifica } from "@/lib/types";

export function TeamCard({ squadra, riga }: { squadra: Squadra; riga?: RigaClassifica }) {
  return (
    <Link
      href={`/squadre/${squadra.slug}`}
      className="group relative block overflow-hidden rounded-2xl glass card-luxury p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary-glow/30"
    >
      <div
        className="absolute inset-x-0 top-0 h-24 opacity-25 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: `linear-gradient(135deg, ${squadra.coloriSociali[0]}, transparent)` }}
      />
      <div className="relative flex items-center gap-3">
        <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} logoUrl={squadra.logoUrl} size={52} />
        <div className="min-w-0">
          <p className="truncate font-display font-bold leading-tight">{squadra.nomeBreve}</p>
          <p className="text-xs text-muted-foreground">Fondata nel {squadra.fondazione}</p>
        </div>
        {riga && (
          <span className="ml-auto flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-score text-sm font-bold">
            {riga.posizione}°
          </span>
        )}
      </div>
      {riga && (
        <div className="relative mt-4 flex items-center justify-between border-t border-border pt-3">
          <div className="flex gap-4 text-xs">
            <span>
              <b className="font-score text-sm">{riga.punti}</b> <span className="text-muted-foreground">pt</span>
            </span>
            <span>
              <b className="font-score text-sm">{riga.golFatti - riga.golSubiti > 0 ? "+" : ""}{riga.golFatti - riga.golSubiti}</b>{" "}
              <span className="text-muted-foreground">dr</span>
            </span>
          </div>
          <FormBadges risultati={riga.ultimeCinque} />
        </div>
      )}
    </Link>
  );
}
