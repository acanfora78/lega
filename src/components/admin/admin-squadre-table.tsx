"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { TeamCrest } from "@/components/brand/team-crest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/admin/image-upload";
import type { RigaClassifica, Squadra } from "@/lib/types";

interface Riga {
  squadra: Squadra;
  riga?: RigaClassifica;
}

export function AdminSquadreTable({ dati }: { dati: Riga[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Squadra | null>(null);
  const [open, setOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  function apriNuovo() {
    setEditing(null);
    setLogoUrl("");
    setCoverUrl("");
    setOpen(true);
  }

  function apriModifica(s: Squadra) {
    setEditing(s);
    setLogoUrl(s.logoUrl ?? "");
    setCoverUrl(s.coverUrl ?? "");
    setOpen(true);
  }

  async function salva(form: FormData) {
    const payload = {
      nome: String(form.get("nome") ?? ""),
      nomeBreve: String(form.get("nomeBreve") ?? ""),
      allenatore: String(form.get("allenatore") ?? ""),
      fondazione: Number(form.get("fondazione") ?? 0),
      descrizione: String(form.get("descrizione") ?? ""),
      logoUrl,
      coverUrl,
    };

    try {
      const res = await fetch(editing ? `/api/admin/squadre/${editing.id}` : "/api/admin/squadre", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success(`${payload.nome} salvata`);
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile salvare la squadra");
    }
  }

  async function elimina(id: string) {
    try {
      const res = await fetch(`/api/admin/squadre/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Squadra rimossa");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile rimuovere la squadra");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <Button onClick={apriNuovo} size="sm">
          <Plus className="size-4" /> Nuova squadra
        </Button>
      </div>

      {dati.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">Nessuna squadra ancora registrata.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Squadra</th>
                <th className="px-2 py-3">Allenatore</th>
                <th className="px-2 py-3 text-center">Posizione</th>
                <th className="px-2 py-3 text-center">Punti</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {dati.map(({ squadra, riga }) => (
                <tr key={squadra.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 font-semibold">
                      <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} logoUrl={squadra.logoUrl} size={28} />
                      {squadra.nome}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{squadra.allenatore}</td>
                  <td className="px-2 py-3 text-center tabular-nums">{riga?.posizione ?? "—"}</td>
                  <td className="px-2 py-3 text-center tabular-nums">{riga?.punti ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => apriModifica(squadra)} aria-label="Modifica">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => elimina(squadra.id)} aria-label="Elimina">
                        <Trash2 className="size-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifica squadra" : "Nuova squadra"}</DialogTitle>
          </DialogHeader>
          <form action={(fd) => salva(fd)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Logo</Label>
              <ImageUpload value={logoUrl} onChange={setLogoUrl} folder="squadre/loghi" shape="circle" label="Carica logo" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Copertina</Label>
              <ImageUpload value={coverUrl} onChange={setCoverUrl} folder="squadre/copertine" shape="wide" label="Carica copertina" />
            </div>
            <Field label="Nome completo" name="nome" defaultValue={editing?.nome} required />
            <Field label="Nome breve" name="nomeBreve" defaultValue={editing?.nomeBreve} required />
            <Field label="Allenatore" name="allenatore" defaultValue={editing?.allenatore} />
            <Field label="Anno di fondazione" name="fondazione" type="number" defaultValue={String(editing?.fondazione ?? "")} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descrizione">Descrizione</Label>
              <Textarea id="descrizione" name="descrizione" defaultValue={editing?.descrizione} rows={3} />
            </div>
            <Button type="submit" className="mt-1">
              Salva squadra
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}
