"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Gavel, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Giocatore, MotivoSqualifica, Squadra } from "@/lib/types";
import type { ConteggioRisolto, SqualificaRisolta } from "@/lib/data/disciplina";
import { formatDateIt } from "@/lib/utils";

const MOTIVI: { value: MotivoSqualifica; label: string }[] = [
  { value: "espulsione", label: "Espulsione diretta" },
  { value: "somma_ammonizioni", label: "Somma di ammonizioni" },
  { value: "condotta", label: "Condotta antisportiva" },
  { value: "reclamo", label: "Reclamo accolto" },
  { value: "altro", label: "Altro" },
];

export function AdminSqualifiche({
  squalifiche,
  giocatori,
  squadre,
  conteggi,
  giornataCorrente,
}: {
  squalifiche: SqualificaRisolta[];
  giocatori: Giocatore[];
  squadre: Squadra[];
  conteggi: ConteggioRisolto[];
  giornataCorrente: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [salvataggio, setSalvataggio] = useState(false);

  const [giocatoreId, setGiocatoreId] = useState("");
  const [motivo, setMotivo] = useState<MotivoSqualifica>("espulsione");
  const [giornate, setGiornate] = useState("1");
  const [giornataDa, setGiornataDa] = useState(String(Math.max(1, giornataCorrente)));
  const [dettaglio, setDettaglio] = useState("");
  const [pubblicaComunicato, setPubblicaComunicato] = useState(true);
  const [nascosti, setNascosti] = useState<Set<string>>(new Set());

  const squadreMap = useMemo(() => new Map(squadre.map((s) => [s.id, s])), [squadre]);
  const diffidati = useMemo(() => conteggi.filter((c) => c.diffidato), [conteggi]);

  function reset() {
    setGiocatoreId("");
    setMotivo("espulsione");
    setGiornate("1");
    setGiornataDa(String(Math.max(1, giornataCorrente)));
    setDettaglio("");
    setPubblicaComunicato(true);
  }

  async function salva() {
    if (!giocatoreId) {
      toast.error("Seleziona il giocatore squalificato");
      return;
    }
    const giornateNum = Number(giornate);
    if (!Number.isInteger(giornateNum) || giornateNum < 1) {
      toast.error("Le giornate devono essere un numero intero di almeno 1");
      return;
    }

    setSalvataggio(true);
    try {
      const res = await fetch("/api/admin/squalifiche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giocatoreId,
          motivo,
          giornate: giornateNum,
          giornataDa: Number(giornataDa) || 1,
          dettaglio,
          pubblicaComunicato,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success(pubblicaComunicato ? "Squalifica registrata e comunicato pubblicato" : "Squalifica registrata");
      setOpen(false);
      reset();
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile registrare la squalifica");
    } finally {
      setSalvataggio(false);
    }
  }

  async function elimina(id: string) {
    setNascosti((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/admin/squalifiche/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Squalifica revocata");
      startTransition(() => router.refresh());
    } catch (err) {
      setNascosti((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(err instanceof Error ? err.message : "Impossibile revocare la squalifica");
    }
  }

  const squalificheVisibili = squalifiche.filter((s) => !nascosti.has(s.id));

  return (
    <div className="flex flex-col gap-5">
      {diffidati.length > 0 && (
        <Card className="border-warning/25 bg-warning/5">
          <CardContent className="flex items-start gap-2.5 p-4 text-xs text-warning">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              <span className="font-bold">Diffidati:</span>{" "}
              {diffidati.map((d) => `${d.giocatore.nome} ${d.giocatore.cognome}`).join(", ")}. Alla prossima
              ammonizione scatta la squalifica automatica.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-end gap-2">
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Nuova squalifica
        </Button>
      </div>

      {squalificheVisibili.length === 0 ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">
          Nessuna squalifica registrata in questa stagione.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl glass">
          {/* Squadra, Motivo ed Emessa nascosti sotto sm invece di affidarsi
              allo scroll orizzontale: su mobile uno scroll senza alcun
              indizio visivo resta scoperto. Giocatore, Giornate, Stato e
              Azioni restano sempre visibili. */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Giocatore</th>
                  <th className="hidden px-2 py-3 sm:table-cell">Squadra</th>
                  <th className="px-2 py-3 text-center">Giornate</th>
                  <th className="hidden px-2 py-3 sm:table-cell">Motivo</th>
                  <th className="hidden px-2 py-3 sm:table-cell">Emessa</th>
                  <th className="px-2 py-3 text-center">Stato</th>
                  <th className="px-4 py-3 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {squalificheVisibili.map((s) => {
                  const squadra = squadreMap.get(s.squadraId);
                  return (
                    <tr key={s.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-semibold">
                        {s.giocatore ? `${s.giocatore.nome} ${s.giocatore.cognome}` : "—"}
                      </td>
                      <td className="hidden px-2 py-3 text-muted-foreground sm:table-cell">{squadra?.nomeBreve ?? "—"}</td>
                      <td className="px-2 py-3 text-center font-score font-bold tabular-nums">{s.giornate}</td>
                      <td className="hidden px-2 py-3 text-xs text-muted-foreground sm:table-cell">
                        {MOTIVI.find((m) => m.value === s.motivo)?.label ?? s.motivo}
                      </td>
                      <td className="hidden px-2 py-3 text-xs text-muted-foreground sm:table-cell">{formatDateIt(s.emessaIl)}</td>
                      <td className="px-2 py-3 text-center">
                        {s.attiva ? (
                          <Badge variant="danger">
                            fino a G{s.giornataA}
                          </Badge>
                        ) : (
                          <Badge variant="muted">scontata</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" onClick={() => elimina(s.id)} aria-label="Revoca">
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="size-4 text-gold-bright" /> Nuova squalifica
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Giocatore</Label>
              <Select value={giocatoreId} onValueChange={setGiocatoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Scegli il giocatore" />
                </SelectTrigger>
                <SelectContent>
                  {giocatori.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.nome} {g.cognome} — {squadreMap.get(g.squadraId)?.nomeBreve ?? "senza squadra"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Motivo</Label>
              <Select value={motivo} onValueChange={(v) => setMotivo(v as MotivoSqualifica)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVI.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="giornate">Giornate di squalifica</Label>
                <Input
                  id="giornate"
                  type="number"
                  min={1}
                  step={1}
                  value={giornate}
                  onChange={(e) => setGiornate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="giornataDa">A partire dalla giornata</Label>
                <Input
                  id="giornataDa"
                  type="number"
                  min={1}
                  step={1}
                  value={giornataDa}
                  onChange={(e) => setGiornataDa(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dettaglio">Motivazione (facoltativa)</Label>
              <Textarea
                id="dettaglio"
                rows={3}
                value={dettaglio}
                onChange={(e) => setDettaglio(e.target.value)}
                placeholder="Testo che comparirà nel comunicato disciplinare."
              />
            </div>

            <div className="flex items-center justify-between rounded-xl glass px-3.5 py-3">
              <div>
                <p className="text-sm font-semibold">Pubblica il comunicato</p>
                <p className="text-xs text-muted-foreground">Crea una news in categoria &quot;disciplinare&quot;.</p>
              </div>
              <Switch checked={pubblicaComunicato} onCheckedChange={setPubblicaComunicato} />
            </div>

            <Button onClick={salva} disabled={salvataggio} className="mt-1">
              {salvataggio && <Loader2 className="size-4 animate-spin" />}
              Registra squalifica
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
