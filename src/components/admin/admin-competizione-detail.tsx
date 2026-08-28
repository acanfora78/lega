"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Settings2 } from "lucide-react";
import { TeamCrest } from "@/components/brand/team-crest";
import { CalendarioCsvUpload } from "@/components/admin/calendario-csv-upload";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateIt, formatTimeIt } from "@/lib/utils";
import type { Competizione, FormatoIncontri, Partita, Squadra, StatoCompetizione } from "@/lib/types";

const FORMATI: { value: FormatoIncontri; label: string }[] = [
  { value: "girone_unico", label: "Girone unico" },
  { value: "andata_ritorno", label: "Andata e ritorno" },
  { value: "eliminazione_diretta", label: "Eliminazione diretta" },
];

const STATI: StatoCompetizione[] = ["bozza", "in_corso", "conclusa", "archiviata"];

export function AdminCompetizioneDetail({
  competizione,
  squadreIscritte,
  partite,
  squadreMap,
}: {
  competizione: Competizione;
  squadreIscritte: Squadra[];
  partite: Partita[];
  squadreMap: Map<string, Squadra>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [stato, setStato] = useState(competizione.stato);

  async function salvaStato(v: StatoCompetizione) {
    setStato(v);
    try {
      const res = await fetch(`/api/admin/competizioni/${competizione.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stato: v }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Stato aggiornato");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile aggiornare lo stato");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isPending && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Sincronizzazione in corso...
        </div>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="font-display text-lg font-bold">{competizione.nome}</p>
            <p className="text-xs text-muted-foreground">{squadreIscritte.length} squadre iscritte</p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Stato</Label>
            <Select value={stato} onValueChange={(v) => salvaStato(v as StatoCompetizione)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATI.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <FasiManager competizione={competizione} squadreIscritte={squadreIscritte} />

      <CalendarioCsvUpload
        endpoint={`/api/admin/competizioni/${competizione.id}/calendario`}
        fasi={competizione.fasi.length > 0 ? competizione.fasi : undefined}
        nomeFileModello={`calendario-${competizione.slug}.csv`}
      />

      <div>
        <p className="mb-3 font-display text-base font-bold">Partite ({partite.length})</p>
        {partite.length === 0 ? (
          <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">
            Nessuna partita ancora importata. Carica un calendario CSV qui sopra.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl glass">
            {/* Fase, Data e Stato nascosti sotto sm invece di affidarsi allo
                scroll orizzontale: su mobile uno scroll senza alcun indizio
                visivo resta scoperto. Giornata, Sfida, Risultato e Gestisci
                restano sempre visibili. */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Giornata</th>
                    <th className="hidden px-2 py-3 sm:table-cell">Fase</th>
                    <th className="hidden px-2 py-3 sm:table-cell">Data</th>
                    <th className="px-2 py-3">Sfida</th>
                    <th className="px-2 py-3 text-center">Risultato</th>
                    <th className="hidden px-2 py-3 text-center sm:table-cell">Stato</th>
                    <th className="px-4 py-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {[...partite]
                    .sort((a, b) => a.giornata - b.giornata)
                    .map((p) => {
                      const casa = squadreMap.get(p.squadraCasaId);
                      const trasferta = squadreMap.get(p.squadraTrasfertaId);
                      const fase = competizione.fasi.find((f) => f.id === p.faseId);
                      if (!casa || !trasferta) return null;
                      return (
                        <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                          <td className="px-4 py-3 font-semibold">G{p.giornata}</td>
                          <td className="hidden px-2 py-3 text-xs text-muted-foreground sm:table-cell">{fase?.nome ?? "—"}</td>
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
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/admin/partite/${p.id}`}
                              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold hover:bg-white/[0.1]"
                              aria-label="Gestisci partita"
                            >
                              <Settings2 className="size-3.5" /> <span className="hidden sm:inline">Gestisci</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FasiManager({ competizione, squadreIscritte }: { competizione: Competizione; squadreIscritte: Squadra[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [formato, setFormato] = useState<FormatoIncontri>("girone_unico");
  const [squadreFase, setSquadreFase] = useState<Set<string>>(new Set());
  const [salvataggio, setSalvataggio] = useState(false);
  const [nascoste, setNascoste] = useState<Set<string>>(new Set());

  function toggleSquadra(id: string) {
    setSquadreFase((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function crea() {
    if (!nome.trim()) {
      toast.error("Il nome della fase è obbligatorio");
      return;
    }
    setSalvataggio(true);
    try {
      const res = await fetch(`/api/admin/competizioni/${competizione.id}/fasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, formato, ordine: competizione.fasi.length + 1, squadreIds: [...squadreFase] }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Fase creata");
      setOpen(false);
      setNome("");
      setSquadreFase(new Set());
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile creare la fase");
    } finally {
      setSalvataggio(false);
    }
  }

  async function elimina(faseId: string) {
    if (!window.confirm("Eliminare questa fase? Le sue partite verranno eliminate.")) return;
    setNascoste((prev) => new Set(prev).add(faseId));
    try {
      const res = await fetch(`/api/admin/competizioni/${competizione.id}/fasi/${faseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Fase eliminata");
      startTransition(() => router.refresh());
    } catch (err) {
      setNascoste((prev) => {
        const next = new Set(prev);
        next.delete(faseId);
        return next;
      });
      toast.error(err instanceof Error ? err.message : "Impossibile eliminare la fase");
    }
  }

  const fasiVisibili = competizione.fasi.filter((f) => !nascoste.has(f.id));

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-bold">Fasi</p>
          <div className="flex items-center gap-2">
            {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
              <Plus className="size-4" /> Nuova fase
            </Button>
          </div>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">
          Facoltative: servono solo per competizioni con più tappe (gironi, poi eliminazione diretta). Senza fasi il
          calendario si carica direttamente sull&apos;intera competizione.
        </p>
        {fasiVisibili.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessuna fase creata.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {fasiVisibili.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl glass px-3.5 py-2.5">
                <div>
                  <p className="text-sm font-semibold">{f.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {FORMATI.find((x) => x.value === f.formato)?.label ?? f.formato} · {f.squadreIds.length} squadre
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => elimina(f.id)} aria-label="Elimina fase">
                  <Trash2 className="size-4 text-danger" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuova fase</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fase-nome">Nome</Label>
              <Input id="fase-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Es. Girone A, Semifinali" />
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
            <div className="flex flex-col gap-1.5">
              <Label>Squadre della fase</Label>
              <div className="max-h-52 overflow-y-auto rounded-xl glass p-2">
                {squadreIscritte.map((s) => (
                  <label key={s.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-white/[0.04]">
                    <input
                      type="checkbox"
                      checked={squadreFase.has(s.id)}
                      onChange={() => toggleSquadra(s.id)}
                      className="size-4 accent-primary"
                    />
                    {s.nomeBreve}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={crea} disabled={salvataggio} className="mt-1">
              {salvataggio && <Loader2 className="size-4 animate-spin" />}
              Crea fase
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

