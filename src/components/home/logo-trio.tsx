"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TESTATA HOME — tre loghi affiancati
// Sinistra: il Campo Sportivo Santa Teresa. Centro: il logo storico dell'app.
// Destra: la Lega Calcio Over 40.
//
// I file laterali li fornisce la Lega: finché non sono caricati in
// /public/icons, lo slot mostra un segnaposto con la sigla invece di rompere
// il layout con un'immagine spezzata. Basta droppare i file con questi nomi
// perché compaiano, senza toccare il codice.
// ============================================================================

const LOGHI = {
  campo: { src: "/icons/logo-campo.png", alt: "Campo Sportivo Santa Teresa", sigla: "ST" },
  centro: { src: "/icons/logo.png", alt: "Lega Calcio Over 40 — Campo Santa Teresa", sigla: "L40" },
  lega: { src: "/icons/logo-lega.png", alt: "Lega Calcio Over 40", sigla: "O40" },
} as const;

export function LogoTrio({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center gap-5 rounded-3xl glass px-5 py-5 sm:gap-12 sm:px-10",
        className
      )}
    >
      <LogoSlot {...LOGHI.campo} size={64} />
      <LogoSlot {...LOGHI.centro} size={92} primario />
      <LogoSlot {...LOGHI.lega} size={64} />
    </div>
  );
}

function LogoSlot({
  src,
  alt,
  sigla,
  size,
  primario = false,
}: {
  src: string;
  alt: string;
  sigla: string;
  size: number;
  primario?: boolean;
}) {
  const [mancante, setMancante] = useState(false);

  if (mancante) {
    return (
      <div
        title={`${alt} — logo non ancora caricato`}
        style={{ width: size, height: size }}
        className="flex shrink-0 items-center justify-center rounded-2xl border border-dashed border-border-strong bg-white/[0.03] font-display text-xs font-bold tracking-wide text-muted-foreground"
      >
        {sigla}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- loghi statici serviti da /public, next/image non aggiunge nulla qui
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      onError={() => setMancante(true)}
      className={cn("shrink-0 rounded-2xl object-contain", primario && "drop-shadow-[0_0_24px_rgba(52,232,138,0.18)]")}
    />
  );
}
