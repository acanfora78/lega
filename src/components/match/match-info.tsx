import { Card, CardContent } from "@/components/ui/card";
import type { Partita } from "@/lib/types";
import { CloudSun, Droplets, MapPin, User, Wind } from "lucide-react";

const CONDIZIONE_LABEL: Record<NonNullable<Partita["meteo"]>["condizione"], string> = {
  sereno: "Sereno",
  nuvoloso: "Nuvoloso",
  pioggia: "Pioggia",
  vento: "Ventoso",
  nebbia: "Nebbia",
};

export function MatchInfo({ partita }: { partita: Partita }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
          <User className="size-5 text-primary-glow" />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Arbitro</p>
          <p className="text-sm font-bold">{partita.arbitro}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
          <MapPin className="size-5 text-primary-glow" />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campo</p>
          <p className="text-sm font-bold">{partita.campo}</p>
        </CardContent>
      </Card>
      {partita.meteo && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-5 text-center">
            <CloudSun className="size-5 text-primary-glow" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Meteo</p>
            <p className="text-sm font-bold">
              {partita.meteo.temperaturaC}°C · {CONDIZIONE_LABEL[partita.meteo.condizione]}
            </p>
            <p className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Wind className="size-3" /> {partita.meteo.ventoKmh} km/h
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="size-3" /> {partita.meteo.umidita}%
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
