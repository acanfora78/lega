"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TeamCrest } from "@/components/brand/team-crest";
import { PitchBackdrop, StadiumLights } from "@/components/brand/pitch-art";
import { Countdown } from "@/components/shared/countdown";
import { LiveBadge } from "@/components/shared/live-badge";
import { Button } from "@/components/ui/button";
import { getSquadraById } from "@/lib/data";
import { formatDateIt, formatTimeIt } from "@/lib/utils";
import type { Partita } from "@/lib/types";
import { CloudSun, MapPin, Radio } from "lucide-react";

export function Hero({ partita, live }: { partita: Partita; live: boolean }) {
  const casa = getSquadraById(partita.squadraCasaId)!;
  const trasferta = getSquadraById(partita.squadraTrasfertaId)!;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
      <PitchBackdrop />
      <StadiumLights />
      <div className="relative px-5 py-8 sm:px-10 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-bright">
            <Radio className="size-3.5" />
            Giornata {partita.giornata} · Stagione 2025/2026
          </span>
          {live ? (
            <LiveBadge minuto={partita.minutoCorrente} className="text-sm" />
          ) : (
            partita.meteo && (
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-semibold text-foreground/80">
                <CloudSun className="size-3.5" />
                {partita.meteo.temperaturaC}°C al Santa Teresa
              </span>
            )
          )}
        </div>

        <p className="mb-5 text-center font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-left">
          {live ? "In diretta ora" : "Prossimo fischio d'inizio"}
        </p>

        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-3 text-center sm:w-40"
          >
            <TeamCrest nome={casa.nome} colors={casa.coloriSociali} size={84} className="animate-float" />
            <p className="font-display text-base font-bold leading-tight">{casa.nomeBreve}</p>
          </motion.div>

          <div className="flex flex-col items-center gap-4">
            {live ? (
              <span className="font-score text-6xl font-extrabold tabular-nums sm:text-7xl">
                {partita.golCasa}
                <span className="mx-2 text-gold-bright">–</span>
                {partita.golTrasferta}
              </span>
            ) : (
              <>
                <span className="font-score text-2xl font-bold text-muted-foreground">
                  {formatDateIt(partita.dataOra, { weekday: "long", day: "2-digit", month: "long" })}
                </span>
                <Countdown target={partita.dataOra} />
                <span className="font-score text-lg font-semibold text-gold-bright">
                  Calcio d&apos;inizio ore {formatTimeIt(partita.dataOra)}
                </span>
              </>
            )}
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {partita.campo}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-3 text-center sm:w-40"
          >
            <TeamCrest nome={trasferta.nome} colors={trasferta.coloriSociali} size={84} className="animate-float" />
            <p className="font-display text-base font-bold leading-tight">{trasferta.nomeBreve}</p>
          </motion.div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" variant={live ? "default" : "gold"}>
            <Link href={`/partite/${partita.id}`}>{live ? "Segui la diretta" : "Dettagli partita"}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
