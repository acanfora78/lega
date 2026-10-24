"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Stethoscope, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Risultato = { backend: string; passi: { passo: string; ok: boolean; dettaglio: string }[] };

export function AdminDiagnostica() {
  const [inCorso, setInCorso] = useState(false);
  const [risultato, setRisultato] = useState<Risultato | null>(null);

  async function verifica() {
    setInCorso(true);
    setRisultato(null);
    try {
      const res = await fetch("/api/admin/diagnostica", { method: "POST" });
      const corpo = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(corpo.error ?? `Errore ${res.status}`);
      setRisultato(corpo);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verifica non riuscita");
    } finally {
      setInCorso(false);
    }
  }

  const tuttoOk = risultato?.passi.every((p) => p.ok);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 font-display text-base font-bold">
              <Stethoscope className="size-4" /> Verifica salvataggio
            </p>
            <p className="text-xs text-muted-foreground">
              Prova reale: legge i dati, li risalva invariati e li rilegge, per controllare che le modifiche restino davvero.
            </p>
          </div>
          <Button size="sm" onClick={verifica} disabled={inCorso} className="w-fit">
            {inCorso && <Loader2 className="size-4 animate-spin" />} Verifica ora
          </Button>
        </div>

        {risultato && (
          <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
            <p className="text-xs text-muted-foreground">Database in uso: {risultato.backend}</p>
            {risultato.passi.map((p) => (
              <div key={p.passo} className="flex items-start gap-2">
                {p.ok ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary-glow" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />
                )}
                <div>
                  <p className="font-semibold">{p.passo}</p>
                  <p className="text-xs text-muted-foreground">{p.dettaglio}</p>
                </div>
              </div>
            ))}
            <p className={tuttoOk ? "font-semibold text-primary-glow" : "font-semibold text-danger"}>
              {tuttoOk ? "Tutto funziona: le modifiche vengono salvate e ricordate." : "Il salvataggio non funziona: mandami questa schermata."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
