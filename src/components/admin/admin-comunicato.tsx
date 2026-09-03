"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Anteprima {
  giornata: number;
  titolo: string;
  sommario: string;
  contenuto: string;
  partiteConcluse: number;
}

/**
 * Comunicato ufficiale di giornata. Non c'è niente da scrivere: risultati,
 * classifica, marcatori, ammoniti, espulsi, squalificati e diffidati vengono
 * letti dall'archivio della lega al momento della generazione.
 */
export function AdminComunicato({ giornate, giornataCorrente }: { giornate: number[]; giornataCorrente: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [giornata, setGiornata] = useState(String(giornataCorrente || giornate[0] || 1));
  const [anteprima, setAnteprima] = useState<Anteprima | null>(null);
  const [inCorso, setInCorso] = useState<"anteprima" | "pubblica" | null>(null);

  async function chiama(pubblica: boolean) {
    setInCorso(pubblica ? "pubblica" : "anteprima");
    try {
      const res = await fetch("/api/admin/comunicato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giornata: Number(giornata), anteprima: !pubblica }),
      });
      const dati = await res.json();
      if (!res.ok) throw new Error(dati.error ?? "Errore");
      setAnteprima(dati);
      if (pubblica) {
        toast.success(dati.aggiornato ? "Comunicato aggiornato e ripubblicato" : "Comunicato pubblicato nelle news");
        startTransition(() => router.refresh());
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile generare il comunicato");
    } finally {
      setInCorso(null);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div>
          <p className="flex items-center gap-2 font-display text-base font-bold">
            <FileText className="size-4 text-gold-bright" /> Comunicato ufficiale
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Si compone da solo dai dati già inseriti: risultati e marcatori della giornata, classifica, classifica
            marcatori, ammoniti, espulsi, squalificati e diffidati. Rigenerandolo dopo una correzione al tabellino,
            l&apos;articolo esistente viene aggiornato invece di duplicarsi.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="giornata-comunicato">Giornata</Label>
            <Select value={giornata} onValueChange={setGiornata}>
              <SelectTrigger id="giornata-comunicato" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {giornate.map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    {g}ª giornata
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => chiama(false)} disabled={inCorso !== null}>
            {inCorso === "anteprima" ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
            Anteprima
          </Button>
          <Button size="sm" onClick={() => chiama(true)} disabled={inCorso !== null}>
            {inCorso === "pubblica" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Genera e pubblica
          </Button>
          {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>

        {anteprima && (
          <div className="flex flex-col gap-2">
            {anteprima.partiteConcluse === 0 && (
              <p className="rounded-xl border border-warning/25 bg-warning/5 px-3.5 py-2.5 text-xs text-warning">
                Nessuna gara conclusa in questa giornata: il comunicato riporterà solo il calendario e le classifiche
                aggiornate a oggi.
              </p>
            )}
            <p className="font-display text-sm font-bold">{anteprima.titolo}</p>
            <p className="text-xs text-muted-foreground">{anteprima.sommario}</p>
            {/* Testo monospaziato: le classifiche sono incolonnate con spazi,
                un font proporzionale le disallineerebbe in anteprima. */}
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl glass p-3.5 text-[11px] leading-relaxed text-foreground/85">
              {anteprima.contenuto}
            </pre>
            <Link
              href={`/news/comunicato-giornata-${anteprima.giornata}`}
              className="text-xs font-semibold text-primary-glow hover:underline"
            >
              Apri il comunicato pubblicato →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
