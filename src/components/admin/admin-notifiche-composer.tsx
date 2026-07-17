"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateIt, formatTimeIt } from "@/lib/utils";

interface Storico {
  id: string;
  titolo: string;
  corpo: string;
  tipo: string;
  quando: string;
}

export function AdminNotificheComposer() {
  const [titolo, setTitolo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [tipo, setTipo] = useState("news");
  const [storico, setStorico] = useState<Storico[]>([
    { id: "n1", titolo: "Giornata 12 al via", corpo: "Segui tutte le partite in diretta sull'app!", tipo: "news", quando: new Date("2026-07-17T08:05:00+02:00").toISOString() },
    { id: "n2", titolo: "Comunicato disciplinare", corpo: "Pubblicate le decisioni del Giudice Sportivo.", tipo: "comunicato", quando: new Date("2026-07-14T12:10:00+02:00").toISOString() },
  ]);

  function invia() {
    if (!titolo.trim() || !corpo.trim()) {
      toast.error("Compila titolo e testo della notifica");
      return;
    }
    setStorico((prev) => [{ id: `local-${Date.now()}`, titolo, corpo, tipo, quando: new Date().toISOString() }, ...prev]);
    toast.success("Notifica inviata a tutti gli utenti");
    setTitolo("");
    setCorpo("");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="flex items-center gap-2 font-display text-base font-bold">
            <Bell className="size-4 text-gold-bright" /> Componi notifica
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo">Categoria</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goal">Goal</SelectItem>
                <SelectItem value="inizio_partita">Inizio partita</SelectItem>
                <SelectItem value="fine_partita">Fine partita</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="comunicato">Comunicato ufficiale</SelectItem>
                <SelectItem value="media">Nuovi contenuti media</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titolo">Titolo</Label>
            <Input id="titolo" value={titolo} onChange={(e) => setTitolo(e.target.value)} placeholder="Es. Fischio d'inizio!" maxLength={60} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="corpo">Testo</Label>
            <Textarea id="corpo" value={corpo} onChange={(e) => setCorpo(e.target.value)} placeholder="Scrivi il messaggio della notifica..." rows={4} maxLength={200} />
          </div>
          <Button onClick={invia} className="mt-1 w-fit">
            <Send className="size-4" /> Invia a tutti gli utenti
          </Button>
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 font-display text-base font-bold">Storico invii</p>
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl glass">
          {storico.map((n) => (
            <div key={n.id} className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{n.titolo}</p>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{n.tipo}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{n.corpo}</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {formatDateIt(n.quando)} · {formatTimeIt(n.quando)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
