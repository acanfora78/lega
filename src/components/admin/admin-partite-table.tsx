"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Settings2, Loader2, Trash2, ShieldAlert, TriangleAlert } from "lucide-react";
import { TeamCrest } from "@/components/brand/team-crest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateIt, formatTimeIt } from "@/lib/utils";
import type { Partita, Squadra } from "@/lib/types";

export function AdminPartiteTable({ partite, squadre }: { partite: Partita[]; squadre: Squadra[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [nascoste, setNascoste] = useState<Set<string>>(new Set());
  // Partite appena create: comparire subito, senza aspettare che il
  // refresh porti indietro le props aggiornate dal server. Una volta che
  // `partite` le contiene davvero, il filtro sotto le esclude da qui — non
  // restano a lungo, sono solo il ponte fra il click e il refresh.
  const [appenaCreate, setAppenaCreate] = useState<Partita[]>([]);
  const [svuotamento, setSvuotamento] = useState(false);
  const squadreMap = useMemo(() => new Map(squadre.map((s) => [s.id, s])), [squadre]);

  async function crea(form: FormData) {
    const casaId = String(form.get("casa") ?? "");
    const trasfertaId = String(form.get("trasferta") ?? "");
    if (!casaId || !trasfertaId || casaId === trasfertaId) {
      toast.error("Seleziona due squadre diverse");
      return;
    }
    try {
      const res = await fetch("/api/admin/partite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          squadraCasaId: casaId,
          squadraTrasfertaId: trasfertaId,
          giornata: Number(form.get("giornata") ?? 1),
          data: String(form.get("data") ?? ""),
          ora: String(form.get("ora") ?? "15:00"),
          arbitro: String(form.get("arbitro") ?? ""),
          campo: String(form.get("campo") ?? "Campo Sportivo Santa Teresa"),
        }),
      });
      const partitaCreata = await res.json();
      if (!res.ok) throw new Error(partitaCreata.error ?? "Errore");
      setAppenaCreate((prev) => [...prev, partitaCreata]);
      toast.success("Partita aggiunta al calendario");
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile creare la partita");
    }
  }

  async function elimina(id: string) {
    if (!window.confirm("Eliminare definitivamente questa partita? Cronaca, formazioni e voti andranno persi.")) return;
    setNascoste((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/partite/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Partita eliminata");
      startTransition(() => router.refresh());
    } catch (err) {
      setNascoste((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(err instanceof Error ? err.message : "Impossibile eliminare la partita");
    }
  }

  async function svuotaCalendario() {
    if (
      !window.confirm(
        `Svuotare l'intero calendario del campionato? Tutte le ${partite.length} partite verranno eliminate — risultati, cronaca, tabellini e voti compresi. Le competizioni aggiuntive non sono toccate. L'operazione non è reversibile: potrai poi ricaricare un CSV da capo.`
      )
    ) {
      return;
    }
    setSvuotamento(true);
    try {
      const res = await fetch("/api/admin/partite/svuota", { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      setNascoste(new Set(partite.map((p) => p.id)));
      setAppenaCreate([]);
      toast.success("Calendario svuotato");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile svuotare il calendario");
    } finally {
      setSvuotamento(false);
    }
  }

  const idGiaNoti = new Set(partite.map((p) => p.id));
  const partiteVisibili = [
    ...partite.filter((p) => !nascoste.has(p.id)),
    ...appenaCreate.filter((p) => !idGiaNoti.has(p.id) && !nascoste.has(p.id)),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        {partite.length > 0 && (
          <Button variant="destructive" size="sm" onClick={svuotaCalendario} disabled={svuotamento}>
            {svuotamento ? <Loader2 className="size-4 animate-spin" /> : <TriangleAlert className="size-4" />}
            Svuota calendario
          </Button>
        )}
        <Button size="sm" onClick={() => setOpen(true)} disabled={squadre.length < 2}>
          <Plus className="size-4" /> Nuova partita
        </Button>
      </div>

      {squadre.length < 2 && (
        <p className="text-sm text-muted-foreground">Servono almeno due squadre per programmare una partita: aggiungile prima dalla sezione Squadre.</p>
      )}

      {partiteVisibili.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">Nessuna partita ancora in calendario.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          {/* Data e Stato nascosti sotto sm invece di affidarsi allo scroll
              orizzontale: su mobile uno scroll senza alcun indizio visivo
              resta scoperto. Giornata, Sfida, Risultato e Azioni — comprese
              Gestisci ed Elimina — restano sempre visibili. */}
          <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Giornata</th>
                <th className="hidden px-2 py-3 sm:table-cell">Data</th>
                <th className="px-2 py-3">Sfida</th>
                <th className="px-2 py-3 text-center">Risultato</th>
                <th className="hidden px-2 py-3 text-center sm:table-cell">Stato</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {[...partiteVisibili]
                .sort((a, b) => a.giornata - b.giornata)
                .map((p) => {
                  const casa = squadreMap.get(p.squadraCasaId);
                  const trasferta = squadreMap.get(p.squadraTrasfertaId);
                  // Una squadra citata dalla gara ma non più tra quelle esistenti
                  // non deve far sparire la riga in silenzio: si vede il problema
                  // e resta comunque possibile eliminare la gara per risolverlo.
                  if (!casa || !trasferta) {
                    return (
                      <tr key={p.id} className="border-b border-border/60 bg-danger/5 last:border-0">
                        <td className="px-4 py-3 font-semibold">G{p.giornata}</td>
                        <td className="hidden px-2 py-3 text-muted-foreground sm:table-cell">
                          {formatDateIt(p.dataOra)} · {formatTimeIt(p.dataOra)}
                        </td>
                        <td className="px-2 py-3" colSpan={3}>
                          <span className="flex items-center gap-1.5 text-xs text-danger">
                            <ShieldAlert className="size-3.5 shrink-0" />
                            {!casa && "Squadra di casa"}
                            {!casa && !trasferta && " e squadra "}
                            {!trasferta && (casa ? "Squadra " : "")}
                            {!trasferta && "ospite"}
                            {" non trovata — probabilmente eliminata dopo aver programmato questa gara."}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => elimina(p.id)} aria-label="Elimina partita">
                            <Trash2 className="size-4 text-danger" />
                          </Button>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-semibold">G{p.giornata}</td>
                      <td className="hidden px-2 py-3 text-muted-foreground sm:table-cell">
                        {formatDateIt(p.dataOra)} · {formatTimeIt(p.dataOra)}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1.5">
                          <TeamCrest nome={casa.nome} colors={casa.coloriSociali} logoUrl={casa.logoUrl} size={20} />
                          <span className="text-xs font-semibold">{casa.nomeBreve}</span>
                          <span className="text-muted-foreground">vs</span>
                          <TeamCrest nome={trasferta.nome} colors={trasferta.coloriSociali} logoUrl={trasferta.logoUrl} size={20} />
                          <span className="text-xs font-semibold">{trasferta.nomeBreve}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center font-score font-bold tabular-nums">
                        {p.stato === "programmata" ? "—" : `${p.golCasa}-${p.golTrasferta}`}
                      </td>
                      <td className="hidden px-2 py-3 text-center sm:table-cell">
                        <Badge variant={p.stato === "live" ? "live" : p.stato === "conclusa" ? "muted" : "outline"} className="capitalize">
                          {p.stato}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/partite/${p.id}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold hover:bg-white/[0.1]"
                            aria-label="Gestisci partita"
                          >
                            <Settings2 className="size-3.5" /> <span className="hidden sm:inline">Gestisci</span>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => elimina(p.id)} aria-label="Elimina partita">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova partita</DialogTitle>
          </DialogHeader>
          <form action={(fd) => crea(fd)} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="casa">Squadra in casa</Label>
                <Select name="casa">
                  <SelectTrigger id="casa">
                    <SelectValue placeholder="Scegli" />
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trasferta">Squadra ospite</Label>
                <Select name="trasferta">
                  <SelectTrigger id="trasferta">
                    <SelectValue placeholder="Scegli" />
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
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="giornata">Giornata</Label>
                <Input id="giornata" name="giornata" type="number" min={1} defaultValue={1} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="data">Data</Label>
                <Input id="data" name="data" type="date" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ora">Ora</Label>
                <Input id="ora" name="ora" type="time" defaultValue="15:00" required />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="arbitro">Arbitro</Label>
              <Input id="arbitro" name="arbitro" placeholder="Nome dell'arbitro designato" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="campo">Campo</Label>
              <Input id="campo" name="campo" defaultValue="Campo Sportivo Santa Teresa" />
            </div>
            <Button type="submit" className="mt-1">
              Aggiungi al calendario
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
