"use client";

import { useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Msg {
  id: string;
  autore: string;
  testo: string;
  ora: string;
}

const MESSAGGI_INIZIALI: Msg[] = [
  { id: "m1", autore: "Tifoso_Scafati85", testo: "Forza ragazzi, spingete fino alla fine! 💪", ora: "18:12" },
  { id: "m2", autore: "MariaG", testo: "Che partita intensa oggi al Santa Teresa", ora: "18:20" },
];

export function MatchChat() {
  const [messaggi, setMessaggi] = useState<Msg[]>(MESSAGGI_INIZIALI);
  const [testo, setTesto] = useState("");

  function invia() {
    const val = testo.trim();
    if (!val) return;
    setMessaggi((m) => [
      ...m,
      { id: `local-${Date.now()}`, autore: "Tu", testo: val, ora: new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setTesto("");
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary-glow" />
          Chat live moderata dalla redazione della Lega
        </div>
        <div className="flex max-h-64 flex-col gap-2.5 overflow-y-auto pr-1">
          {messaggi.map((m) => (
            <div key={m.id} className="flex items-start gap-2 text-sm">
              <span className="font-semibold text-primary-glow">{m.autore}</span>
              <span className="flex-1 text-foreground/90">{m.testo}</span>
              <span className="shrink-0 text-[10px] text-muted-foreground">{m.ora}</span>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            invia();
          }}
          className="flex gap-2"
        >
          <Input
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            placeholder="Scrivi un messaggio..."
            maxLength={200}
          />
          <Button type="submit" size="icon" aria-label="Invia">
            <Send className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
