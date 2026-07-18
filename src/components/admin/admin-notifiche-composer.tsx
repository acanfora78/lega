"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Bell, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateIt, formatTimeIt } from "@/lib/utils";
import type { Notifica } from "@/lib/types";

export function AdminNotificheComposer({ notifiche }: { notifiche: Notifica[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [titolo, setTitolo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [tipo, setTipo] = useState("news");

  async function invia() {
    if (!titolo.trim() || !corpo.trim()) {
      toast.error("Compila titolo e testo della notifica");
      return;
    }
    try {
      const res = await fetch("/api/admin/notifiche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titolo, corpo, tipo }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Notifica inviata a tutti gli utenti");
      setTitolo("");
      setCorpo("");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile inviare la notifica");
    }
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
          <Button onClick={invia} disabled={isPending} className="mt-1 w-fit">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Invia a tutti gli utenti
          </Button>
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 font-display text-base font-bold">Storico invii</p>
        {notifiche.length === 0 ? (
          <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">Nessuna notifica ancora inviata.</div>
        ) : (
          <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl glass">
            {notifiche.map((n) => (
              <div key={n.id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{n.titolo}</p>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{n.tipo}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{n.corpo}</p>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {formatDateIt(n.creataIl)} · {formatTimeIt(n.creataIl)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
