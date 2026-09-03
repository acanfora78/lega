"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud, Download, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FaseCompetizione } from "@/lib/types";

const COLONNE_CSV = "giornata,fase,data,ora,squadra_casa,squadra_trasferta,arbitro,campo";

/**
 * Upload del calendario da CSV, condiviso tra il campionato principale
 * (/admin/partite) e ogni competizione aggiuntiva (/admin/competizioni/[id]):
 * stessa UI, cambia solo dove va a finire la POST e — solo per le
 * competizioni multi-fase — il selettore fase.
 */
export function CalendarioCsvUpload({
  endpoint,
  fasi,
  nomeFileModello,
}: {
  endpoint: string;
  /** Presente solo per le competizioni con fasi: se assente, niente selettore. */
  fasi?: FaseCompetizione[];
  nomeFileModello: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [faseId, setFaseId] = useState<string>("nessuna");
  const [file, setFile] = useState<File | null>(null);
  const [caricamento, setCaricamento] = useState(false);
  const [errori, setErrori] = useState<{ riga: number; errore: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function scaricaModello() {
    const blob = new Blob([COLONNE_CSV + "\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeFileModello;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function carica() {
    if (!file) {
      toast.error("Scegli prima un file CSV");
      return;
    }
    setCaricamento(true);
    setErrori([]);
    try {
      const csv = await file.text();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fasi ? { csv, faseId: faseId === "nessuna" ? undefined : faseId } : { csv }),
      });
      const body = await res.json();
      if (!res.ok) {
        if (Array.isArray(body.righe)) setErrori(body.righe);
        throw new Error(body.error ?? "Errore");
      }
      const parti = [
        body.creati > 0 ? `${body.creati} partite aggiunte` : "",
        body.aggiornati > 0 ? `${body.aggiornati} riallineate al file` : "",
      ].filter(Boolean);
      toast.success(parti.length > 0 ? parti.join(", ") : "Calendario già allineato al file");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile importare il calendario");
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-bold">Carica calendario da CSV</p>
          {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">
          Colonne attese: <code className="font-mono">{COLONNE_CSV}</code>. Le squadre vanno scritte con nome
          completo o nome breve, esattamente come registrate. arbitro, campo{fasi ? " e fase" : ""} sono facoltativi.
          Gli orari sono quelli del file, letti come ora italiana.
        </p>
        <p className="-mt-1 text-xs text-muted-foreground">
          Ricaricare lo stesso CSV non crea doppioni: le gare già presenti (stessa giornata, stesse squadre) vengono
          riallineate a data e ora del file, mantenendo risultato, cronaca e voti già inseriti.
        </p>

        <div className={`grid grid-cols-1 gap-3 ${fasi ? "sm:grid-cols-3" : ""}`}>
          {fasi && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Fase</Label>
              <Select value={faseId} onValueChange={setFaseId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nessuna">Nessuna (intera competizione)</SelectItem>
                  {fasi.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className={`flex flex-col gap-1.5 ${fasi ? "sm:col-span-2" : ""}`}>
            <Label className="text-xs text-muted-foreground">File CSV</Label>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-white/[0.06] file:px-3.5 file:py-1.5 file:text-xs file:font-semibold file:text-foreground hover:file:bg-white/[0.1]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={carica} disabled={caricamento || !file}>
            {caricamento ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            Importa calendario
          </Button>
          <Button variant="outline" onClick={scaricaModello}>
            <Download className="size-4" /> Scarica modello CSV
          </Button>
        </div>

        {errori.length > 0 && (
          <div className="rounded-xl border border-danger/25 bg-danger/5 p-3.5 text-xs text-danger">
            <p className="mb-1.5 flex items-center gap-1.5 font-bold">
              <AlertTriangle className="size-3.5" /> {errori.length} righe non valide — nessuna partita importata
            </p>
            <ul className="flex flex-col gap-0.5">
              {errori.map((e, i) => (
                <li key={i}>
                  Riga {e.riga}: {e.errore}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
