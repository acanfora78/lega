"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Articolo } from "@/lib/types";
import { formatDateIt, slugify } from "@/lib/utils";

export function AdminNewsTable({ articoli }: { articoli: Articolo[] }) {
  const [lista, setLista] = useState(articoli);
  const [editing, setEditing] = useState<Articolo | null>(null);
  const [open, setOpen] = useState(false);

  function nuovo() {
    setEditing({
      id: `nuovo-${Date.now()}`,
      slug: "",
      titolo: "",
      sommario: "",
      contenuto: "",
      copertinaUrl: "",
      categoria: "articolo",
      autore: "Redazione Lega",
      pubblicatoIl: new Date().toISOString(),
    });
    setOpen(true);
  }

  function salva(form: FormData) {
    if (!editing) return;
    const titolo = String(form.get("titolo") ?? "");
    const aggiornato: Articolo = {
      ...editing,
      titolo,
      slug: editing.slug || slugify(titolo),
      sommario: String(form.get("sommario") ?? ""),
      contenuto: String(form.get("contenuto") ?? ""),
      categoria: form.get("categoria") as Articolo["categoria"],
    };
    setLista((prev) => {
      const esiste = prev.some((a) => a.id === aggiornato.id);
      return esiste ? prev.map((a) => (a.id === aggiornato.id ? aggiornato : a)) : [aggiornato, ...prev];
    });
    toast.success("Articolo pubblicato");
    setOpen(false);
  }

  function elimina(id: string) {
    setLista((prev) => prev.filter((a) => a.id !== id));
    toast.success("Articolo eliminato");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={nuovo}>
          <Plus className="size-4" /> Nuovo articolo
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl glass">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Titolo</th>
              <th className="px-2 py-3">Categoria</th>
              <th className="px-2 py-3">Data</th>
              <th className="px-4 py-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((a) => (
              <tr key={a.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-semibold">{a.titolo}</td>
                <td className="px-2 py-3">
                  <Badge variant="outline" className="capitalize">
                    {a.categoria}
                  </Badge>
                </td>
                <td className="px-2 py-3 text-muted-foreground">{formatDateIt(a.pubblicatoIl)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(a); setOpen(true); }} aria-label="Modifica">
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => elimina(a.id)} aria-label="Elimina">
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id.startsWith("nuovo") ? "Nuovo articolo" : "Modifica articolo"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={(fd) => salva(fd)} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="titolo">Titolo</Label>
                <Input id="titolo" name="titolo" defaultValue={editing.titolo} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="categoria">Categoria</Label>
                <Select name="categoria" defaultValue={editing.categoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="articolo">Articolo</SelectItem>
                    <SelectItem value="comunicato">Comunicato</SelectItem>
                    <SelectItem value="disciplinare">Disciplinare</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sommario">Sommario</Label>
                <Textarea id="sommario" name="sommario" defaultValue={editing.sommario} rows={2} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contenuto">Contenuto</Label>
                <Textarea id="contenuto" name="contenuto" defaultValue={editing.contenuto} rows={5} />
              </div>
              <Button type="submit" className="mt-1">
                Pubblica
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
