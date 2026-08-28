"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Competizione, FormatoIncontri, Squadra, TipoCompetizione } from "@/lib/types";

const TIPI: { value: TipoCompetizione; label: string }[] = [
  { value: "coppa", label: "Coppa" },
  { value: "campionato", label: "Campionato" },
  { value: "torneo_eliminazione", label: "Torneo a eliminazione" },
  { value: "gironi", label: "Fase a gironi" },
  { value: "gironi_piu_finale", label: "Gironi + fase finale" },
  { value: "personalizzata", label: "Personalizzata" },
];

const FORMATI: { value: FormatoIncontri; label: string }[] = [
  { value: "girone_unico", label: "Girone unico (sola andata)" },
  { value: "andata_ritorno", label: "Girone all'italiana (andata e ritorno)" },
  { value: "eliminazione_diretta", label: "Eliminazione diretta" },
  { value: "misto", label: "Mista (più fasi con formati diversi)" },
];

const STATO_BADGE: Record<Competizione["stato"], "muted" | "live" | "success" | "outline"> = {
  bozza: "muted",
  in_corso: "live",
  conclusa: "success",
  archiviata: "outline",
};

export function AdminCompetizioniList({ competizioni, squadre }: { competizioni: Competizione[]; squadre: Squadra[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [nascoste, setNascoste] = useState<Set<string>>(new Set());

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoCompetizione>("coppa");
  const [formato, setFormato] = useState<FormatoIncontri>("girone_unico");
  const [squadreIscritte, setSquadreIscritte] = useState<Set<string>>(new Set());
  const [salvataggio, setSalvataggio] = useState(false);

  function reset() {
    setNome("");
    setTipo("coppa");
    setFormato("girone_unico");
    setSquadreIscritte(new Set());
  }

  function toggleSquadra(id: string) {
    setSquadreIscritte((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function crea() {
    if (!nome.trim()) {
      toast.error("Il nome della competizione è obbligatorio");
      return;
    }
    setSalvataggio(true);
    try {
      const res = await fetch("/api/admin/competizioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, tipo, formato, squadreIscritteIds: [...squadreIscritte] }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Competizione creata");
      setOpen(false);
      reset();
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile creare la competizione");
    } finally {
      setSalvataggio(false);
    }
  }

  async function elimina(id: string) {
    if (!window.confirm("Eliminare definitivamente questa competizione? Tutte le sue partite e classifiche andranno perse.")) return;
    setNascoste((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/competizioni/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Competizione eliminata");
      startTransition(() => router.refresh());
    } catch (err) {
      setNascoste((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(err instanceof Error ? err.message : "Impossibile eliminare la competizione");
    }
  }

  const visibili = competizioni.filter((c) => !nascoste.has(c.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <Button size="sm" onClick={() => setOpen(true)} disabled={squadre.length === 0}>
          <Plus className="size-4" /> Nuova competizione
        </Button>
      </div>

      {squadre.length === 0 && (
        <p className="text-sm text-muted-foreground">Crea prima almeno una squadra per poter iscriverla a una competizione.</p>
      )}

      {visibili.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">
          Nessuna competizione aggiuntiva ancora creata. Il campionato principale non è qui: si gestisce da Squadre e Partite.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visibili.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <Link href={`/admin/competizioni/${c.id}`} className="flex min-w-0 flex-1 items-start gap-3 hover:opacity-90">
                  <Trophy className="mt-0.5 size-5 shrink-0 text-gold-bright" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.nome}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge variant={STATO_BADGE[c.stato]} className="capitalize">
                        {c.stato.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">{TIPI.find((t) => t.value === c.tipo)?.label ?? c.tipo}</Badge>
                      <span className="text-xs text-muted-foreground">{c.squadreIscritteIds.length} squadre</span>
                    </div>
                  </div>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                </Link>
                <Button variant="ghost" size="icon" onClick={() => elimina(c.id)} aria-label="Elimina competizione" className="shrink-0">
                  <Trash2 className="size-4 text-danger" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-gold-bright" /> Nuova competizione
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Es. Coppa Lega Over 40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoCompetizione)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPI.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Formato</Label>
                <Select value={formato} onValueChange={(v) => setFormato(v as FormatoIncontri)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATI.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formato === "misto" && (
              <p className="rounded-xl glass px-3.5 py-2.5 text-xs text-muted-foreground">
                Formato misto: iscrivi qui le squadre partecipanti, poi crea le fasi (es. gironi, poi eliminazione diretta) dalla pagina
                della competizione dopo averla salvata.
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <Label>Squadre iscritte</Label>
              <div className="max-h-52 overflow-y-auto rounded-xl glass p-2">
                {squadre.map((s) => (
                  <label key={s.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-white/[0.04]">
                    <input
                      type="checkbox"
                      checked={squadreIscritte.has(s.id)}
                      onChange={() => toggleSquadra(s.id)}
                      className="size-4 accent-primary"
                    />
                    {s.nomeBreve}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{squadreIscritte.size} squadre selezionate</p>
            </div>
            <Button onClick={crea} disabled={salvataggio} className="mt-1">
              {salvataggio && <Loader2 className="size-4 animate-spin" />}
              Crea competizione
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
