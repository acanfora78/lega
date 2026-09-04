import { leggiTabellino } from "@/lib/tabellino";
import type { Partita, Giocatore } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TabellinoViewProps {
  partita: Partita;
  rosterCasa: Giocatore[];
  rosterTrasferta: Giocatore[];
}

export function TabellinoView({ partita, rosterCasa, rosterTrasferta }: TabellinoViewProps) {
  const righeCasa = leggiTabellino(partita, rosterCasa);
  const righeTrasferta = leggiTabellino(partita, rosterTrasferta);

  const RigaGiocatore = ({ riga, giocatore }: { riga: ReturnType<typeof leggiTabellino>[0]; giocatore: Giocatore }) => (
    <div className="flex items-center justify-between border-b py-3 text-sm last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="font-medium">
          <span className="mr-2 inline-block w-6 text-center text-xs font-bold text-muted-foreground">{riga.numero || "—"}</span>
          <span>{giocatore.nome} {giocatore.cognome}</span>
          {riga.titolare && <span className="ml-2 text-xs text-muted-foreground">(T)</span>}
        </div>
      </div>
      <div className="ml-4 flex gap-4 text-xs">
        {riga.gol > 0 && <span className="text-center"><span className="block text-lg">⚽</span>{riga.gol}</span>}
        {riga.rigori > 0 && <span className="text-center"><span className="block text-lg">🎯</span>{riga.rigori}</span>}
        {riga.assist > 0 && <span className="text-center"><span className="block text-lg">👟</span>{riga.assist}</span>}
        {riga.autoreti > 0 && <span className="text-center"><span className="block text-lg">⚽</span>-{riga.autoreti}</span>}
        {riga.ammonizione && !riga.doppiaAmmonizione && <span className="text-lg">🟨</span>}
        {riga.doppiaAmmonizione && <span className="text-lg">🟨🟨</span>}
        {riga.espulsione && <span className="text-lg">🔴</span>}
        {riga.voto !== null && <span className="text-center font-semibold">{riga.voto}</span>}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tabellino — Casa</CardTitle>
        </CardHeader>
        <CardContent>
          {righeCasa.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun giocatore in distinta</p>
          ) : (
            <div className="space-y-0">
              {righeCasa.map((riga) => {
                const giocatore = rosterCasa.find((g) => g.id === riga.giocatoreId);
                if (!giocatore) return null;
                return <RigaGiocatore key={riga.giocatoreId} riga={riga} giocatore={giocatore} />;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tabellino — Trasferta</CardTitle>
        </CardHeader>
        <CardContent>
          {righeTrasferta.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun giocatore in distinta</p>
          ) : (
            <div className="space-y-0">
              {righeTrasferta.map((riga) => {
                const giocatore = rosterTrasferta.find((g) => g.id === riga.giocatoreId);
                if (!giocatore) return null;
                return <RigaGiocatore key={riga.giocatoreId} riga={riga} giocatore={giocatore} />;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
