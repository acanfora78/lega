import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ETA_MINIMA_REGOLAMENTO, isUnderQuaranta } from "@/lib/utils";
import type { Giocatore } from "@/lib/types";

/**
 * Stellina che marca i giocatori sotto i 40 anni: in un campionato Over 40
 * sono i tesserati in deroga (fascia 35–39), quindi devono essere riconoscibili
 * a colpo d'occhio in rose, classifiche e tabellini.
 */
export function UnderQuarantaStar({
  eta,
  size = 12,
  className,
  withLabel = false,
}: {
  eta: number | undefined;
  size?: number;
  className?: string;
  withLabel?: boolean;
}) {
  if (!isUnderQuaranta(eta)) return null;

  const titolo = `Under ${ETA_MINIMA_REGOLAMENTO}: ${eta} anni`;

  return (
    <span
      title={titolo}
      aria-label={titolo}
      className={cn("inline-flex shrink-0 items-center gap-1 align-middle text-gold-bright", className)}
    >
      <Star size={size} className="fill-current" aria-hidden />
      {withLabel && (
        <span className="text-[10px] font-bold uppercase tracking-wide">Under {ETA_MINIMA_REGOLAMENTO}</span>
      )}
    </span>
  );
}

/** Variante che accetta direttamente il giocatore, per accorciare le call-site. */
export function StellaGiocatore({
  giocatore,
  size,
  className,
  withLabel,
}: {
  giocatore: Pick<Giocatore, "eta">;
  size?: number;
  className?: string;
  withLabel?: boolean;
}) {
  return <UnderQuarantaStar eta={giocatore.eta} size={size} className={className} withLabel={withLabel} />;
}
