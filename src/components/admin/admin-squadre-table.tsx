"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { TeamCrest } from "@/components/brand/team-crest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RigaClassifica, Squadra } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface Riga {
  squadra: Squadra;
  riga?: RigaClassifica;
}

export function AdminSquadreTable({ dati }: { dati: Riga[] }) {
  const [righe, setRighe] = useState(dati);
  const [editing, setEditing] = useState<Squadra | null>(null);
  const [open, setOpen] = useState(false);

  function apriNuovo() {
    setEditing({
      id: `nuova-${Date.now()}`,
      slug: "",
      nome: "",
      nomeBreve: "",
      logoUrl: "",
      coverUrl: "",
      coloriSociali: ["#16a34a", "#0b3d24"],
      descrizione: "",
      fondazione: new Date().getFullYear(),
      allenatore: "",
      sponsorIds: [],
      galleryUrls: [],
    });
    setOpen(true);
  }

  function apriModifica(s: Squadra) {
    setEditing(s);
    setOpen(true);
  }

  function salva(form: FormData) {
    if (!editing) return;
    const nome = String(form.get("nome") ?? "");
    const aggiornata: Squadra = {
      ...editing,
      nome,
      nomeBreve: String(form.get("nomeBreve") ?? nome),
      slug: editing.slug || slugify(nome),
      allenatore: String(form.get("allenatore") ?? ""),
      fondazione: Number(form.get("fondazione") ?? editing.fondazione),
      descrizione: String(form.get("descrizione") ?? ""),
    };
    setRighe((prev) => {
      const esiste = prev.some((r) => r.squadra.id === aggiornata.id);
      if (esiste) return prev.map((r) => (r.squadra.id === aggiornata.id ? { ...r, squadra: aggiornata } : r));
      return [...prev, { squadra: aggiornata, riga: undefined }];
    });
    toast.success(`${nome} salvata`);
    setOpen(false);
  }

  function elimina(id: string) {
    setRighe((prev) => prev.filter((r) => r.squadra.id !== id));
    toast.success("Squadra rimossa");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={apriNuovo} size="sm">
          <Plus className="size-4" /> Nuova squadra
        </Button>
      </div>

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
            {righe.map(({ squadra, riga }) => (
              <tr key={squadra.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 font-semibold">
                    <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} size={28} />
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.nome ? "Modifica squadra" : "Nuova squadra"}</DialogTitle>
          </DialogHeader>
          <form
            action={(fd) => salva(fd)}
            className="flex flex-col gap-3"
          >
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
