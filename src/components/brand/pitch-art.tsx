import { cn } from "@/lib/utils";

/** Sfondo decorativo: campo da calcio stilizzato visto dall'alto, con luci da stadio. */
export function PitchBackdrop({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 h-full w-full", className)}
      aria-hidden
    >
      <defs>
        {/*
          Verde del campo che sfuma nel navy dello stemma. I colori arrivano dai
          token del tema invece che scritti a mano: altrimenti questo SVG
          dipingerebbe un campo scuro anche in tema chiaro, e il testo chiaro
          sopra l'hero diventerebbe illeggibile.
        */}
        <radialGradient id="pitch-glow" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="var(--pitch-700)" stopOpacity="0.9" />
          <stop offset="55%" stopColor="var(--pitch-800)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#pitch-glow)" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={i * 80} y="0" width="40" height="500" fill="url(#stripe)" />
      ))}
      <circle cx="400" cy="380" r="90" fill="none" stroke="var(--foreground)" strokeOpacity="0.1" strokeWidth="2" />
      <line x1="0" y1="290" x2="800" y2="290" stroke="var(--foreground)" strokeOpacity="0.1" strokeWidth="2" />
      <rect x="280" y="440" width="240" height="70" fill="none" stroke="var(--foreground)" strokeOpacity="0.1" strokeWidth="2" />
      <rect x="340" y="470" width="120" height="40" fill="none" stroke="var(--foreground)" strokeOpacity="0.1" strokeWidth="2" />
    </svg>
  );
}

/** Coni di luce da riflettori — usati su hero e cover squadra. */
export function StadiumLights({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 400" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        {/* Come nello stemma: fari bianco-ciano da un lato, gialli dall'altro. */}
        <linearGradient id="beam-cyan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2ac9ff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2ac9ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="beam-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd24a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffd24a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="60,0 220,0 340,400 -60,400" fill="url(#beam-cyan)" />
      <polygon points="620,0 780,0 900,400 500,400" fill="url(#beam-gold)" />
    </svg>
  );
}

export function LegaMonogram({ size = 32, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- logo ufficiale statico servito da /public, next/image non serve qui
    <img
      src="/icons/logo.png"
      alt="Lega Calcio Over 40"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-2xl object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
