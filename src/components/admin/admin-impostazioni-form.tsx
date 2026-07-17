"use client";

import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { Stagione } from "@/lib/types";

export function AdminImpostazioniForm({ stagione }: { stagione: Stagione }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="font-display text-base font-bold">Dati generali</p>
          <Field label="Nome della Lega" defaultValue="Lega Calcio Over 40" />
          <Field label="Campo ufficiale" defaultValue="Campo Sportivo Santa Teresa, Scafati (SA)" />
          <Field label="Email di contatto" defaultValue="info@legacalciooverquaranta.it" type="email" />
          <Field label="Telefono segreteria" defaultValue="+39 081 XXX XXXX" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="font-display text-base font-bold">Stagione in corso</p>
          <Field label="Etichetta stagione" defaultValue={stagione.etichetta} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data inizio" defaultValue={stagione.dataInizio} type="date" />
            <Field label="Data fine" defaultValue={stagione.dataFine} type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Regolamento sintetico</Label>
            <Textarea
              rows={4}
              defaultValue="Girone unico ad andata e ritorno, 8 squadre. 3 punti per la vittoria, 1 per il pareggio. A parità di punti prevale la differenza reti, poi gli scontri diretti."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="font-display text-base font-bold">Automazioni</p>
          <ToggleRow label="Aggiornamento automatico classifica" desc="Ricalcola la classifica ad ogni partita conclusa" defaultChecked />
          <Separator />
          <ToggleRow label="Aggiornamento automatico marcatori" desc="Aggiorna la classifica marcatori/assist in tempo reale" defaultChecked />
          <Separator />
          <ToggleRow label="Calcolo automatico MVP" desc="Propone l'MVP di giornata in base a voti e prestazioni" defaultChecked />
          <Separator />
          <ToggleRow label="Notifiche push automatiche sui goal" desc="Invia una notifica push ad ogni rete segnata" defaultChecked />
          <Separator />
          <ToggleRow label="Partita della settimana automatica" desc="Evidenzia in automatico la sfida più spettacolare" />
        </CardContent>
      </Card>

      <div className="lg:col-span-2">
        <Button onClick={() => toast.success("Impostazioni salvate")}>Salva impostazioni</Button>
      </div>
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} type={type} />
    </div>
  );
}

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={defaultChecked} onCheckedChange={() => toast.success("Impostazione aggiornata")} />
    </div>
  );
}
