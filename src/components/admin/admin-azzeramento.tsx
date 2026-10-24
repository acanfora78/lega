"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Ambito = "risultati" | "competizioni" | "tutto";

const OPZIONI: { ambito: Ambito; titolo: string; descrizione: string }[] = [
  {
    ambito: "risultati",
    titolo: "Azzera risultati e classifiche",
    descrizione:
      "Tutte le partite tornano da giocare a 0-0, senza tabellini, cronaca, voti e MVP. Classifiche, squalifiche e premi ripartono da zero. Squadre, giocatori e calendario restano.",
  },
  {
    ambito: "competizioni",
    titolo: "Elimina tutte le competizioni",
    descrizione:
      "Spariscono tutte le competizioni aggiuntive con le loro partite e classifiche. Il campionato principale non viene toccato.",
  },
  {
    ambito: "tutto",
    titolo: "Azzera tutto",
    descrizione:
      "La lega torna vuota: squadre, giocatori, calendario, competizioni, news, galleria, sponsor, notifiche e squalifiche. Restano solo nome della lega, campo, contatti e stagione.",
  },
];

export function AdminAzzeramento() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inCorso, setInCorso] = useState<Ambito | null>(null);

  async function azzera(opzione: (typeof OPZIONI)[number]) {
    if (!window.confirm(`${opzione.titolo}?\n\n${opzione.descrizione}\n\nL'operazione non è reversibile.`)) return;
    if (opzione.ambito === "tutto") {
      const conferma = window.prompt('Per confermare scrivi AZZERA (in maiuscolo).');
      if (conferma !== "AZZERA") {
        toast.error("Azzeramento annullato");
        return;
      }
    }

    setInCorso(opzione.ambito);
    try {
      const res = await fetch("/api/admin/azzera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ambito: opzione.ambito }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Errore");
      toast.success("Fatto: dati azzerati e salvati");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile azzerare i dati");
    } finally {
      setInCorso(null);
    }
  }

  return (
    <Card className="border-danger/40">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2">
          <TriangleAlert className="size-4 text-danger" />
          <p className="font-display text-base font-bold">Azzeramento dati</p>
          {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>
        {OPZIONI.map((o) => (
          <div key={o.ambito} className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold">{o.titolo}</p>
              <p className="text-xs text-muted-foreground">{o.descrizione}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-fit shrink-0"
              disabled={inCorso !== null}
              onClick={() => azzera(o)}
            >
              {inCorso === o.ambito && <Loader2 className="size-4 animate-spin" />}
              {o.titolo}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
