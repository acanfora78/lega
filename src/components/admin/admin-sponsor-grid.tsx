"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Sponsor } from "@/lib/types";

export function AdminSponsorGrid({ sponsor }: { sponsor: Sponsor[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  async function salva(form: FormData) {
    try {
      const res = await fetch("/api/admin/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: String(form.get("nome") ?? ""),
          livello: form.get("livello"),
          descrizione: String(form.get("descrizione") ?? ""),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Sponsor aggiunto");
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile aggiungere lo sponsor");
    }
  }

  async function elimina(id: string) {
    try {
      const res = await fetch(`/api/admin/sponsor/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Sponsor rimosso");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile rimuovere lo sponsor");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nuovo sponsor
        </Button>
      </div>

      {sponsor.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">Nessuno sponsor ancora registrato.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sponsor.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-bold">{s.nome}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.descrizione}</p>
                  <Badge variant={s.livello === "platinum" ? "gold" : "outline"} className="mt-2 capitalize">
                    {s.livello}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => elimina(s.id)} aria-label="Rimuovi">
                  <Trash2 className="size-4 text-danger" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo sponsor</DialogTitle>
          </DialogHeader>
          <form action={(fd) => salva(fd)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome sponsor</Label>
              <Input id="nome" name="nome" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="livello">Livello</Label>
              <Select name="livello" defaultValue="silver">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descrizione">Descrizione</Label>
              <Input id="descrizione" name="descrizione" />
            </div>
            <Button type="submit" className="mt-1">
              Aggiungi sponsor
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
