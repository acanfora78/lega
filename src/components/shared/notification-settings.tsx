"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { subscribeToPush } from "@/lib/push";

const VOCI = [
  { key: "goal", label: "Goal in tempo reale", desc: "Un avviso ad ogni rete della tua squadra del cuore" },
  { key: "inizio", label: "Inizio partita", desc: "Calcio d'inizio delle partite che segui" },
  { key: "intervallo", label: "Intervallo", desc: "Risultato all'intervallo" },
  { key: "fine", label: "Fine partita", desc: "Risultato finale e tabellino" },
  { key: "news", label: "News", desc: "Articoli e novità dalla redazione" },
  { key: "comunicati", label: "Comunicati ufficiali", desc: "Decisioni del Giudice Sportivo e avvisi della Lega" },
  { key: "media", label: "Nuovi contenuti media", desc: "Foto e video appena pubblicati" },
  { key: "mvp", label: "Votazioni MVP", desc: "Quando si aprono le votazioni per l'MVP di giornata" },
] as const;

export function NotificationSettings() {
  const [stato, setStato] = useState<Record<string, boolean>>({
    goal: true,
    inizio: true,
    intervallo: false,
    fine: true,
    news: true,
    comunicati: true,
    media: false,
    mvp: false,
  });

  function toggle(key: string, value: boolean) {
    setStato((s) => ({ ...s, [key]: value }));
    toast.success(value ? "Notifica attivata" : "Notifica disattivata");
  }

  async function attivaPush() {
    const res = await subscribeToPush();
    if (res.ok) toast.success("Notifiche push attivate su questo dispositivo");
    else toast.error(res.reason ?? "Impossibile attivare le notifiche push");
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <Button variant="outline" size="sm" className="w-fit" onClick={attivaPush}>
          <BellRing className="size-4" />
          Attiva notifiche push su questo dispositivo
        </Button>
        <Separator />
        {VOCI.map((v, i) => (
          <div key={v.key}>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor={v.key} className="flex-1">
                <span className="block text-sm font-semibold">{v.label}</span>
                <span className="block text-xs font-normal text-muted-foreground">{v.desc}</span>
              </Label>
              <Switch id={v.key} checked={stato[v.key]} onCheckedChange={(val) => toggle(v.key, val)} />
            </div>
            {i < VOCI.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
