"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TeamCrest } from "@/components/brand/team-crest";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { Giocatore, Squadra } from "@/lib/types";

export function ProfilePreferences({ squadre, giocatori }: { squadre: Squadra[]; giocatori: Giocatore[] }) {
  const [squadraId, setSquadraId] = useState<string>(squadre[0]?.id ?? "");
  const [giocatoreId, setGiocatoreId] = useState<string>("");

  const giocatoriSquadra = useMemo(() => giocatori.filter((g) => g.squadraId === squadraId), [giocatori, squadraId]);
  const squadraSel = squadre.find((s) => s.id === squadraId);
  const giocatoreSel = giocatori.find((g) => g.id === giocatoreId);

  if (squadre.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="text-sm text-muted-foreground">
            Le squadre della Lega non sono ancora state configurate: potrai scegliere la tua squadra del cuore non
            appena il campionato sarà pubblicato.
          </p>
          <ThemeToggle />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="text-sm font-bold">Squadra del cuore</p>
          <Select value={squadraId} onValueChange={(v) => { setSquadraId(v); setGiocatoreId(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="Scegli la tua squadra" />
            </SelectTrigger>
            <SelectContent>
              {squadre.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {squadraSel && (
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
              <TeamCrest nome={squadraSel.nome} colors={squadraSel.coloriSociali} size={40} />
              <div>
                <p className="text-sm font-semibold">{squadraSel.nome}</p>
                <p className="text-xs text-muted-foreground">Riceverai notifiche prioritarie per questa squadra</p>
              </div>
            </div>
          )}

          <Separator />

          <p className="text-sm font-bold">Giocatore preferito</p>
          <Select value={giocatoreId} onValueChange={setGiocatoreId}>
            <SelectTrigger>
              <SelectValue placeholder="Scegli il tuo giocatore" />
            </SelectTrigger>
            <SelectContent>
              {giocatoriSquadra.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  #{g.numeroMaglia} {g.nome} {g.cognome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {giocatoreSel && (
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
              <PlayerAvatar nome={giocatoreSel.nome} cognome={giocatoreSel.cognome} numero={giocatoreSel.numeroMaglia} size={40} />
              <div>
                <p className="text-sm font-semibold">
                  {giocatoreSel.nome} {giocatoreSel.cognome}
                </p>
                <p className="text-xs text-muted-foreground">{giocatoreSel.ruolo}</p>
              </div>
            </div>
          )}

          <Button
            className="mt-1"
            onClick={() => toast.success("Preferenze salvate")}
          >
            Salva preferenze
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
