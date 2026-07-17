"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Sponsor } from "@/lib/types";

export function AdminSponsorGrid({ sponsor }: { sponsor: Sponsor[] }) {
  const [lista, setLista] = useState(sponsor);
  const [open, setOpen] = useState(false);

  function salva(form: FormData) {
    const nuovo: Sponsor = {
      id: `sp-${Date.now()}`,
      nome: String(form.get("nome") ?? ""),
      logoUrl: "",
      livello: form.get("livello") as Sponsor["livello"],
      descrizione: String(form.get("descrizione") ?? ""),
    };
    setLista((prev) => [nuovo, ...prev]);
    toast.success("Sponsor aggiunto");
    setOpen(false);
  }

  function elimina(id: string) {
    setLista((prev) => prev.filter((s) => s.id !== id));
    toast.success("Sponsor rimosso");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nuovo sponsor
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((s) => (
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
