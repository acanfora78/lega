"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, Trophy } from "lucide-react";
import { TeamCrest } from "@/components/brand/team-crest";
import { MatchTimeline } from "@/components/match/timeline";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { EventoPartita, Giocatore, Partita, Squadra, StatoPartita, TipoEvento } from "@/lib/types";

const STATI: StatoPartita[] = ["programmata", "live", "intervallo", "conclusa", "rinviata", "sospesa"];
const TIPI_EVENTO: { value: TipoEvento; label: string }[] = [
  { value: "goal", label: "Gol" },
  { value: "rigore_segnato", label: "Rigore segnato" },
  { value: "ammonizione", label: "Ammonizione" },
  { value: "espulsione", label: "Espulsione" },
  { value: "sostituzione", label: "Sostituzione" },
];

export function AdminMatchControl({
  partita,
  casa,
  trasferta,
  rosterCasa,
  rosterTrasferta,
}: {
  partita: Partita;
  casa: Squadra;
  trasferta: Squadra;
  rosterCasa: Giocatore[];
  rosterTrasferta: Giocatore[];
}) {
  const [stato, setStato] = useState<StatoPartita>(partita.stato);
  const [golCasa, setGolCasa] = useState(partita.golCasa);
  const [golTrasferta, setGolTrasferta] = useState(partita.golTrasferta);
  const [eventi, setEventi] = useState<EventoPartita[]>(partita.eventi);
  const [mvpId, setMvpId] = useState(partita.mvpGiocatoreId ?? "");

  const [squadraForm, setSquadraForm] = useState(casa.id);
  const [tipoForm, setTipoForm] = useState<TipoEvento>("goal");
  const [giocatoreForm, setGiocatoreForm] = useState("");
  const [minutoForm, setMinutoForm] = useState(1);

  const rosterAttivo = squadraForm === casa.id ? rosterCasa : rosterTrasferta;

  function aggiungiEvento() {
    if (!giocatoreForm) {
      toast.error("Seleziona un giocatore");
      return;
    }
    const nuovo: EventoPartita = {
      id: `manual-${Date.now()}`,
      partitaId: partita.id,
      minuto: minutoForm,
      tempo: minutoForm <= 45 ? 1 : 2,
      tipo: tipoForm,
      squadraId: squadraForm,
      giocatoreId: giocatoreForm,
    };
    setEventi((prev) => [...prev, nuovo]);
    if (tipoForm === "goal" || tipoForm === "rigore_segnato") {
      if (squadraForm === casa.id) setGolCasa((g) => g + 1);
      else setGolTrasferta((g) => g + 1);
    }
    toast.success("Evento aggiunto alla cronaca");
    setGiocatoreForm("");
  }

  function salvaStato(v: StatoPartita) {
    setStato(v);
    toast.success(`Stato partita aggiornato a "${v}"`);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TeamCrest nome={casa.nome} colors={casa.coloriSociali} size={32} />
              <span className="font-semibold">{casa.nomeBreve}</span>
            </div>
            <div className="flex items-center gap-3">
              <ScoreControl value={golCasa} onChange={setGolCasa} />
              <span className="font-score text-lg text-muted-foreground">–</span>
              <ScoreControl value={golTrasferta} onChange={setGolTrasferta} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{trasferta.nomeBreve}</span>
              <TeamCrest nome={trasferta.nome} colors={trasferta.coloriSociali} size={32} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Stato partita</Label>
              <Select value={stato} onValueChange={(v) => salvaStato(v as StatoPartita)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATI.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant={stato === "live" ? "live" : "muted"} className="capitalize">
              {stato}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="font-display text-base font-bold">Aggiungi evento alla cronaca</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Squadra</Label>
              <Select value={squadraForm} onValueChange={(v) => { setSquadraForm(v); setGiocatoreForm(""); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={casa.id}>{casa.nomeBreve}</SelectItem>
                  <SelectItem value={trasferta.id}>{trasferta.nomeBreve}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Tipo evento</Label>
              <Select value={tipoForm} onValueChange={(v) => setTipoForm(v as TipoEvento)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPI_EVENTO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Giocatore</Label>
              <Select value={giocatoreForm} onValueChange={setGiocatoreForm}>
                <SelectTrigger>
                  <SelectValue placeholder="Scegli" />
                </SelectTrigger>
                <SelectContent>
                  {rosterAttivo.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      #{g.numeroMaglia} {g.nome} {g.cognome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Minuto</Label>
              <Select value={String(minutoForm)} onValueChange={(v) => setMinutoForm(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 90 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m}&apos;
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={aggiungiEvento} className="w-fit">
            <Plus className="size-4" /> Aggiungi evento
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="flex items-center gap-2 font-display text-base font-bold">
            <Trophy className="size-4 text-gold-bright" /> MVP della partita
          </p>
          <Select value={mvpId} onValueChange={(v) => { setMvpId(v); toast.success("MVP assegnato"); }}>
            <SelectTrigger className="sm:w-72">
              <SelectValue placeholder="Seleziona MVP" />
            </SelectTrigger>
            <SelectContent>
              {[...rosterCasa, ...rosterTrasferta].map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.nome} {g.cognome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 font-display text-base font-bold">Anteprima cronaca</p>
        <Card>
          <CardContent className="p-5">
            <MatchTimeline partita={{ ...partita, eventi }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScoreControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="outline" size="icon" onClick={() => onChange(Math.max(0, value - 1))} aria-label="Diminuisci">
        <Minus className="size-3.5" />
      </Button>
      <span className="font-score w-8 text-center text-2xl font-bold tabular-nums">{value}</span>
      <Button variant="outline" size="icon" onClick={() => onChange(value + 1)} aria-label="Aumenta">
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
