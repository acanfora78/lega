"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";
import type { Articolo } from "@/lib/types";
import { formatDateIt } from "@/lib/utils";

export function AdminNewsTable({ articoli }: { articoli: Articolo[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Articolo | null>(null);
  const [open, setOpen] = useState(false);
  const [copertinaUrl, setCopertinaUrl] = useState("");
  const [nascosti, setNascosti] = useState<Set<string>>(new Set());

  function nuovo() {
    setEditing(null);
    setCopertinaUrl("");
    setOpen(true);
  }

  function modifica(a: Articolo) {
    setEditing(a);
    setCopertinaUrl(a.copertinaUrl ?? "");
    setOpen(true);
  }

  async function salva(form: FormData) {
    const payload = {
      titolo: String(form.get("titolo") ?? ""),
      sommario: String(form.get("sommario") ?? ""),
      contenuto: String(form.get("contenuto") ?? ""),
      categoria: form.get("categoria"),
      copertinaUrl,
    };
    try {
      const res = await fetch(editing ? `/api/admin/news/${editing.id}` : "/api/admin/news", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success(editing ? "Articolo aggiornato" : "Articolo pubblicato");
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile salvare l'articolo");
    }
  }

  async function elimina(id: string) {
    setNascosti((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Articolo eliminato");
      startTransition(() => router.refresh());
    } catch (err) {
      setNascosti((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(err instanceof Error ? err.message : "Impossibile eliminare l'articolo");
    }
  }

  const articoliVisibili = articoli.filter((a) => !nascosti.has(a.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <Button size="sm" onClick={nuovo}>
          <Plus className="size-4" /> Nuovo articolo
        </Button>
      </div>
      {articoliVisibili.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">Nessun articolo pubblicato.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          {/* Colonne secondarie nascoste sotto sm invece di affidarsi allo
              scroll orizzontale: su mobile uno scroll senza alcun indizio
              visivo resta scoperto. Titolo e Azioni restano sempre visibili. */}
          <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Titolo</th>
                <th className="hidden px-2 py-3 sm:table-cell">Categoria</th>
                <th className="hidden px-2 py-3 sm:table-cell">Data</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {articoliVisibili.map((a) => (
                <tr key={a.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-semibold">{a.titolo}</td>
                  <td className="hidden px-2 py-3 sm:table-cell">
                    <Badge variant="outline" className="capitalize">
                      {a.categoria}
                    </Badge>
                  </td>
                  <td className="hidden px-2 py-3 text-muted-foreground sm:table-cell">{formatDateIt(a.pubblicatoIl)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => modifica(a)} aria-label="Modifica">
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
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifica articolo" : "Nuovo articolo"}</DialogTitle>
          </DialogHeader>
          <form action={(fd) => salva(fd)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Copertina</Label>
              <ImageUpload value={copertinaUrl} onChange={setCopertinaUrl} folder="news/copertine" shape="wide" label="Carica copertina" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="titolo">Titolo</Label>
              <Input id="titolo" name="titolo" defaultValue={editing?.titolo} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="categoria">Categoria</Label>
              <Select name="categoria" defaultValue={editing?.categoria ?? "articolo"}>
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
              <Textarea id="sommario" name="sommario" defaultValue={editing?.sommario} rows={2} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contenuto">Contenuto</Label>
              <Textarea id="contenuto" name="contenuto" defaultValue={editing?.contenuto} rows={5} />
            </div>
            <Button type="submit" className="mt-1">
              {editing ? "Salva modifiche" : "Pubblica"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
