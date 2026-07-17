"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Search } from "lucide-react";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getSquadraById } from "@/lib/data";
import type { Giocatore, Squadra } from "@/lib/types";
import { legaData } from "@/lib/mock";

export function AdminGiocatoriTable({ giocatori, squadre }: { giocatori: Giocatore[]; squadre: Squadra[] }) {
  const [lista, setLista] = useState(giocatori);
  const [query, setQuery] = useState("");
  const [squadraFiltro, setSquadraFiltro] = useState("tutte");
  const [editing, setEditing] = useState<Giocatore | null>(null);

  const stagioneId = legaData().stagioneAttualeId;

  const filtrati = useMemo(() => {
    return lista.filter((g) => {
      const matchQuery = `${g.nome} ${g.cognome}`.toLowerCase().includes(query.toLowerCase());
      const matchSquadra = squadraFiltro === "tutte" || g.squadraId === squadraFiltro;
      return matchQuery && matchSquadra;
    });
  }, [lista, query, squadraFiltro]);

  function elimina(id: string) {
    setLista((prev) => prev.filter((g) => g.id !== id));
    toast.success("Giocatore rimosso dalla rosa");
  }

  function salva(form: FormData) {
    if (!editing) return;
    setLista((prev) =>
      prev.map((g) =>
        g.id === editing.id
          ? {
              ...g,
              nome: String(form.get("nome") ?? g.nome),
              cognome: String(form.get("cognome") ?? g.cognome),
              numeroMaglia: Number(form.get("numero") ?? g.numeroMaglia),
              bio: String(form.get("bio") ?? g.bio),
            }
          : g
      )
    );
    toast.success("Giocatore aggiornato");
    setEditing(null);
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
      </div>

      <div className="overflow-hidden rounded-2xl glass">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Giocatore</th>
              <th className="px-2 py-3">Squadra</th>
              <th className="px-2 py-3 text-center">Ruolo</th>
              <th className="px-2 py-3 text-center">Gol</th>
              <th className="px-2 py-3 text-center">Assist</th>
              <th className="px-4 py-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filtrati.map((g) => {
              const squadra = getSquadraById(g.squadraId);
              const stat = g.statistiche.find((s) => s.stagioneId === stagioneId);
              return (
                <tr key={g.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 font-semibold">
                      <PlayerAvatar nome={g.nome} cognome={g.cognome} size={30} numero={g.numeroMaglia} />
                      {g.nome} {g.cognome}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground">{squadra?.nomeBreve}</td>
                  <td className="px-2 py-3 text-center">{g.ruolo}</td>
                  <td className="px-2 py-3 text-center tabular-nums">{stat?.goal ?? 0}</td>
                  <td className="px-2 py-3 text-center tabular-nums">{stat?.assist ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(g)} aria-label="Modifica">
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

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica giocatore</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={(fd) => salva(fd)} className="flex flex-col gap-3">
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
    </div>
  );
}
