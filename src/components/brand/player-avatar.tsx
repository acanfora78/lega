import { hashSeed, mulberry32 } from "@/lib/mock/prng";
import { cn } from "@/lib/utils";

const PALETTES: [string, string][] = [
  ["#16a34a", "#052012"],
  ["#0891b2", "#082f33"],
  ["#7c3aed", "#1e1033"],
  ["#dc2626", "#2b0a0a"],
  ["#ea580c", "#2b1305"],
  ["#0f766e", "#062622"],
  ["#2563eb", "#0a1a3d"],
  ["#b91c1c", "#2b0808"],
];

export function PlayerAvatar({
  nome,
  cognome,
  fotoUrl,
  size = 44,
  numero,
  className,
  ring,
}: {
  nome: string;
  cognome: string;
  fotoUrl?: string;
  size?: number;
  numero?: number;
  className?: string;
  ring?: boolean;
}) {
  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- foto caricata dall'organizzatore su Supabase Storage, dominio non noto in anticipo
      <img
        src={fotoUrl}
        alt={`${nome} ${cognome}`}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", ring && "ring-2 ring-white/15", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  const key = `${nome} ${cognome}`;
  const rand = mulberry32(hashSeed(key));
  const [c1, c2] = PALETTES[Math.floor(rand() * PALETTES.length)];
  const id = `pav-${hashSeed(key)}`;
  const initials = `${nome[0] ?? ""}${cognome[0] ?? ""}`.toUpperCase();

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full", ring && "ring-2 ring-white/15", className)}
      aria-label={key}
      role="img"
    >
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill={`url(#${id})`} />
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontFamily="var(--font-display, sans-serif)"
        fontWeight="700"
        fontSize="34"
        fill="#ffffff"
        opacity="0.95"
      >
        {initials}
      </text>
      {numero !== undefined && (
        <text x="82" y="88" textAnchor="end" fontFamily="var(--font-score, sans-serif)" fontWeight="700" fontSize="20" fill="#ffffff" opacity="0.5">
          {numero}
        </text>
      )}
    </svg>
  );
}
