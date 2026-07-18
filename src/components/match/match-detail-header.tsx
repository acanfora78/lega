import Link from "next/link";
import { TeamCrest } from "@/components/brand/team-crest";
import { PitchBackdrop, StadiumLights } from "@/components/brand/pitch-art";
import { LiveBadge } from "@/components/shared/live-badge";
import { Countdown } from "@/components/shared/countdown";
import { Badge } from "@/components/ui/badge";
import { getGiocatoreById, getSquadraById, getStagioneAttuale } from "@/lib/data";
import { formatDateIt, formatTimeIt } from "@/lib/utils";
import type { Partita } from "@/lib/types";
import { MapPin, Star, Trophy } from "lucide-react";

export function MatchDetailHeader({ partita }: { partita: Partita }) {
  const casa = getSquadraById(partita.squadraCasaId)!;
  const trasferta = getSquadraById(partita.squadraTrasfertaId)!;
  const isLive = partita.stato === "live" || partita.stato === "intervallo";
  const isConclusa = partita.stato === "conclusa";
  const isProgrammata = partita.stato === "programmata";
  const stagione = getStagioneAttuale();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
      <PitchBackdrop />
      <StadiumLights />
      <div className="relative px-5 py-8 sm:px-10 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-bright">
            Giornata {partita.giornata} · Stagione {stagione.etichetta}
          </span>
          {isLive ? (
            <LiveBadge minuto={partita.minutoCorrente} className="text-sm" />
          ) : isConclusa ? (
            <Badge variant="muted">Partita conclusa</Badge>
          ) : (
            <Badge variant="outline">Programmata</Badge>
          )}
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link href={`/squadre/${casa.slug}`} className="flex flex-col items-center gap-3 text-center sm:w-40">
            <TeamCrest nome={casa.nome} colors={casa.coloriSociali} size={76} />
            <p className="font-display text-base font-bold leading-tight hover:text-primary-glow">{casa.nomeBreve}</p>
          </Link>

          <div className="flex flex-col items-center gap-3">
            {isProgrammata ? (
              <>
                <span className="font-score text-lg font-bold text-muted-foreground">
                  {formatDateIt(partita.dataOra, { weekday: "long", day: "2-digit", month: "long" })}
                </span>
                <Countdown target={partita.dataOra} />
                <span className="font-score text-lg font-semibold text-gold-bright">Ore {formatTimeIt(partita.dataOra)}</span>
              </>
            ) : (
              <span className="font-score text-6xl font-extrabold tabular-nums sm:text-7xl">
                {partita.golCasa}
                <span className="mx-2 text-gold-bright">–</span>
                {partita.golTrasferta}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {partita.campo}
            </span>
          </div>

          <Link href={`/squadre/${trasferta.slug}`} className="flex flex-col items-center gap-3 text-center sm:w-40">
            <TeamCrest nome={trasferta.nome} colors={trasferta.coloriSociali} size={76} />
            <p className="font-display text-base font-bold leading-tight hover:text-primary-glow">{trasferta.nomeBreve}</p>
          </Link>
        </div>

        {(partita.partitaDellaSettimana || partita.mvpGiocatoreId) && (
          <div className="mt-6 flex flex-wrap justify-center gap-2 border-t border-border pt-4">
            {partita.partitaDellaSettimana && (
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-semibold text-gold-bright">
                <Star className="size-3.5 fill-current" />
                Partita della settimana
              </span>
            )}
            {!isProgrammata && partita.mvpGiocatoreId && (() => {
              const mvp = getGiocatoreById(partita.mvpGiocatoreId);
              return mvp ? (
                <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-semibold text-primary-glow">
                  <Trophy className="size-3.5" />
                  MVP: {mvp.nome} {mvp.cognome}
                </span>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
