"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Search, Plus, Loader2 } from "lucide-react";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/image-upload";
import type { Giocatore, Ruolo, Squadra } from "@/lib/types";

const RUOLI: Ruolo[] = ["Portiere", "Difensore", "Centrocampista", "Attaccante"];

export function AdminGiocatoriTable({ giocatori, squadre, stagioneId }: { giocatori: Giocatore[]; squadre: Squadra[]; stagioneId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [squadraFiltro, setSquadraFiltro] = useState("tutte");
  const [editing, setEditing] = useState<Giocatore | null>(null);
  const [nuovoOpen, setNuovoOpen] = useState(false);
  const [fotoUrlModifica, setFotoUrlModifica] = useState("");
  const [fotoUrlNuovo, setFotoUrlNuovo] = useState("");
  // Nasconde subito la riga eliminata invece di aspettare il giro completo
  // di rete: router.refresh() la farà sparire "per davvero" poco dopo, ma
  // il click deve sembrare immediato. In caso di errore la riga ricompare.
  const [nascosti, setNascosti] = useState<Set<string>>(new Set());
  const squadreMap = useMemo(() => new Map(squadre.map((s) => [s.id, s])), [squadre]);

  function apriModifica(g: Giocatore) {
    setEditing(g);
    setFotoUrlModifica(g.fotoUrl ?? "");
  }

  function apriNuovo() {
    setFotoUrlNuovo("");
    setNuovoOpen(true);
  }

  const filtrati = useMemo(() => {
    return giocatori.filter((g) => {
      if (nascosti.has(g.id)) return false;
      const matchQuery = `${g.nome} ${g.cognome}`.toLowerCase().includes(query.toLowerCase());
      const matchSquadra = squadraFiltro === "tutte" || g.squadraId === squadraFiltro;
      return matchQuery && matchSquadra;
    });
  }, [giocatori, nascosti, query, squadraFiltro]);

  async function elimina(id: string) {
    setNascosti((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/giocatori/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Giocatore rimosso dalla rosa");
      startTransition(() => router.refresh());
    } catch (err) {
      setNascosti((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(err instanceof Error ? err.message : "Impossibile rimuovere il giocatore");
    }
  }

  async function salva(form: FormData) {
    if (!editing) return;
    try {
      const res = await fetch(`/api/admin/giocatori/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: String(form.get("nome") ?? editing.nome),
          cognome: String(form.get("cognome") ?? editing.cognome),
          numeroMaglia: Number(form.get("numero") ?? editing.numeroMaglia),
          bio: String(form.get("bio") ?? editing.bio),
          fotoUrl: fotoUrlModifica,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Giocatore aggiornato");
      setEditing(null);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile aggiornare il giocatore");
    }
  }

  async function crea(form: FormData) {
    const nome = String(form.get("nome") ?? "");
    const cognome = String(form.get("cognome") ?? "");
    const squadraId = String(form.get("squadraId") ?? "");
    if (!nome || !cognome || !squadraId) {
      toast.error("Compila nome, cognome e squadra");
      return;
    }
    try {
      const res = await fetch("/api/admin/giocatori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          cognome,
          squadraId,
          ruolo: form.get("ruolo"),
          numeroMaglia: Number(form.get("numero") ?? 1),
          eta: Number(form.get("eta") ?? 40),
          bio: String(form.get("bio") ?? ""),
          fotoUrl: fotoUrlNuovo,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Giocatore aggiunto alla rosa");
      setNuovoOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile aggiungere il giocatore");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca giocatore..." className="pl-10" />
        </div>
        <Select value={squadraFiltro} onValueChange={setSquadraFiltro}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tutte">Tutte le squadre</SelectItem>
            {squadre.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nomeBreve}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="shrink-0" onClick={apriNuovo} disabled={squadre.length === 0}>
          <Plus className="size-4" /> Nuovo giocatore
        </Button>
        {isPending && <Loader2 className="size-4 shrink-0 animate-spin self-center text-muted-foreground" />}
      </div>

      {squadre.length === 0 && <p className="text-sm text-muted-foreground">Crea prima almeno una squadra per poter aggiungere giocatori.</p>}

      {filtrati.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">Nessun giocatore in rosa.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          {/* Colonne secondarie nascoste sotto sm invece di affidarsi allo
              scroll orizzontale: su mobile uno scroll senza alcun indizio
              visivo (niente scrollbar, niente bordo tagliato in vista)
              resta scoperto. Giocatore e Azioni restano sempre visibili. */}
          <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Giocatore</th>
                <th className="hidden px-2 py-3 sm:table-cell">Squadra</th>
                <th className="hidden px-2 py-3 text-center sm:table-cell">Ruolo</th>
                <th className="hidden px-2 py-3 text-center sm:table-cell">Gol</th>
                <th className="hidden px-2 py-3 text-center sm:table-cell">Assist</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filtrati.map((g) => {
                const squadra = squadreMap.get(g.squadraId);
                const stat = g.statistiche.find((s) => s.stagioneId === stagioneId);
                return (
                  <tr key={g.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 font-semibold">
                        <PlayerAvatar nome={g.nome} cognome={g.cognome} fotoUrl={g.fotoUrl} size={30} numero={g.numeroMaglia} />
                        {g.nome} {g.cognome}
                      </div>
                    </td>
                    <td className="hidden px-2 py-3 text-muted-foreground sm:table-cell">{squadra?.nomeBreve}</td>
                    <td className="hidden px-2 py-3 text-center sm:table-cell">{g.ruolo}</td>
                    <td className="hidden px-2 py-3 text-center tabular-nums sm:table-cell">{stat?.goal ?? 0}</td>
                    <td className="hidden px-2 py-3 text-center tabular-nums sm:table-cell">{stat?.assist ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" onClick={() => apriModifica(g)} aria-label="Modifica">
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => elimina(g.id)} aria-label="Elimina">
                          <Trash2 className="size-4 text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica giocatore</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={(fd) => salva(fd)} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Foto</Label>
                <ImageUpload value={fotoUrlModifica} onChange={setFotoUrlModifica} folder="giocatori/foto" shape="circle" label="Carica foto" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" defaultValue={editing.nome} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cognome">Cognome</Label>
                  <Input id="cognome" name="cognome" defaultValue={editing.cognome} required />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="numero">Numero maglia</Label>
                <Input id="numero" name="numero" type="number" min={1} max={99} defaultValue={editing.numeroMaglia} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bio">Biografia</Label>
                <Input id="bio" name="bio" defaultValue={editing.bio} />
              </div>
              <Button type="submit" className="mt-1">
                Salva modifiche
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={nuovoOpen} onOpenChange={setNuovoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo giocatore</DialogTitle>
          </DialogHeader>
          <form action={(fd) => crea(fd)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Foto</Label>
              <ImageUpload value={fotoUrlNuovo} onChange={setFotoUrlNuovo} folder="giocatori/foto" shape="circle" label="Carica foto" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="n-nome">Nome</Label>
                <Input id="n-nome" name="nome" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="n-cognome">Cognome</Label>
                <Input id="n-cognome" name="cognome" required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="squadraId">Squadra</Label>
              <Select name="squadraId">
                <SelectTrigger id="squadraId">
                  <SelectValue placeholder="Scegli la squadra" />
                </SelectTrigger>
                <SelectContent>
                  {squadre.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nomeBreve}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ruolo">Ruolo</Label>
                <Select name="ruolo" defaultValue="Centrocampista">
                  <SelectTrigger id="ruolo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RUOLI.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="numero">Maglia</Label>
                <Input id="numero" name="numero" type="number" min={1} max={99} defaultValue={1} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="eta">Età</Label>
                <Input id="eta" name="eta" type="number" min={40} max={70} defaultValue={40} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="n-bio">Biografia (facoltativa)</Label>
              <Input id="n-bio" name="bio" />
            </div>
            <Button type="submit" className="mt-1">
              Aggiungi alla rosa
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
