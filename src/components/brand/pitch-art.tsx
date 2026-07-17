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
        <radialGradient id="pitch-glow" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stopColor="#0a4526" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#052012" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#060907" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#pitch-glow)" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={i * 80} y="0" width="40" height="500" fill="url(#stripe)" />
      ))}
      <circle cx="400" cy="380" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <line x1="0" y1="290" x2="800" y2="290" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <rect x="280" y="440" width="240" height="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <rect x="340" y="470" width="120" height="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
    </svg>
  );
}

/** Coni di luce da riflettori — usati su hero e cover squadra. */
export function StadiumLights({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 400" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)} aria-hidden>
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3d16b" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f3d16b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="60,0 220,0 340,400 -60,400" fill="url(#beam)" />
      <polygon points="620,0 780,0 900,400 500,400" fill="url(#beam)" />
    </svg>
  );
}

export function LegaMonogram({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-label="Lega Calcio Over 40" role="img">
      <defs>
        <linearGradient id="mono-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22e07a" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="mono-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3d16b" />
          <stop offset="100%" stopColor="#d9b84a" />
        </linearGradient>
      </defs>
      <path
        d="M50 3 L94 20 V50 C94 76 76 92 50 97 C24 92 6 76 6 50 V20 Z"
        fill="#0b100c"
        stroke="url(#mono-gold)"
        strokeWidth="2.5"
      />
      <path d="M50 3 L94 20 V50 C94 76 76 92 50 97 C24 92 6 76 6 50 V20 Z" fill="url(#mono-g)" opacity="0.12" />
      <text x="50" y="46" textAnchor="middle" fontFamily="var(--font-display, sans-serif)" fontWeight="800" fontSize="30" fill="url(#mono-gold)">
        O40
      </text>
      <text x="50" y="76" textAnchor="middle" fontFamily="var(--font-score, sans-serif)" fontWeight="700" fontSize="13" letterSpacing="2" fill="#f4f7f4">
        LEGA
      </text>
    </svg>
  );
}
