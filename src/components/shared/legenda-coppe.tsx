import { Card, CardContent } from "@/components/ui/card";
import { fascePresenti } from "@/lib/coppe";

/**
 * Legenda delle zone di qualificazione mostrate in classifica. Le ampiezze si
 * adattano al numero di squadre iscritte, quindi la legenda va generata dai
 * dati e non scritta a mano.
 */
export function LegendaCoppe({ totaleSquadre }: { totaleSquadre: number }) {
  const fasce = fascePresenti(totaleSquadre);
  if (!fasce.length) return null;

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-2.5 p-4 text-xs sm:p-5">
        {fasce.map((f) => (
          <span key={f.zona} className="inline-flex items-center gap-2" title={f.descrizione}>
            <span className="h-4 w-1 shrink-0 rounded-full" style={{ background: f.colore }} aria-hidden />
            <span className="font-semibold text-foreground">{f.etichetta}</span>
            <span className="text-muted-foreground">{f.posizioni}</span>
          </span>
        ))}
      </CardContent>
    </Card>
  );
}
