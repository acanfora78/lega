import { hashSeed, mulberry32 } from "@/lib/mock/prng";
import { cn } from "@/lib/utils";

const SHAPES = ["shield", "roundshield", "hex"] as const;

function initialsOf(nome: string) {
  const words = nome.replace(/^(ASD|Real|FC)\s+/i, "").split(" ");
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function TeamCrest({
  nome,
  colors,
  size = 40,
  className,
}: {
  nome: string;
  colors: [string, string];
  size?: number;
  className?: string;
}) {
  const rand = mulberry32(hashSeed(nome));
  const shape = SHAPES[Math.floor(rand() * SHAPES.length)];
  const id = `crest-${hashSeed(nome)}`;
  const [c1, c2] = colors;
  const initials = initialsOf(nome);

  const shapePath: Record<(typeof SHAPES)[number], string> = {
    shield: "M50 4 L92 18 V52 C92 78 74 92 50 98 C26 92 8 78 8 52 V18 Z",
    roundshield: "M50 4 C78 4 96 22 96 50 C96 78 78 96 50 96 C22 96 4 78 4 50 C4 22 22 4 50 4 Z",
    hex: "M50 2 L94 26 V74 L50 98 L6 74 V26 Z",
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]", className)}
      aria-label={nome}
      role="img"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={shapePath[shape]} fill={`url(#${id})`} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <path d={shapePath[shape]} fill={`url(#${id}-sheen)`} />
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="var(--font-display, sans-serif)"
        fontWeight="800"
        fontSize="34"
        fill="#ffffff"
        style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.25)", strokeWidth: 1 }}
      >
        {initials}
      </text>
    </svg>
  );
}
