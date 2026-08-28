"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { ClipboardList, Loader2, Save, Eraser } from "lucide-react";
import { TeamCrest } from "@/components/brand/team-crest";
import { PlayerAvatar } from "@/components/brand/player-avatar";
import { UnderQuarantaStar } from "@/components/player/under-quaranta-star";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Giocatore, Partita, Squadra, VotoPartita } from "@/lib/types";

const VOTO_MINIMO = 1;
const VOTO_MASSIMO = 10;

/**
 * Tabellone voti: l'organizzatore assegna un voto (1–10, passo 0.5) ai
 * giocatori di entrambe le squadre. È la sorgente delle classifiche
 * "Miglior giocatore" e "Miglior portiere", quindi le caselle lasciate vuote
 * restano tali: un voto non dato non deve inquinare le medie.
 */
export function AdminMatchVotes({
  partita,
  casa,
  trasferta,
  rosterCasa,
  rosterTrasferta,
}: {
  partita: Partita;
  casa: Squadra;
  trasferta: Squadra;
  rosterCasa: Giocatore[];
  rosterTrasferta: Giocatore[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [salvataggio, setSalvataggio] = useState(false);

  // Stato come stringhe: "" = non votato, distinto da uno 0 digitato.
  const [voti, setVoti] = useState<Record<string, string>>(() => {
    const iniziale: Record<string, string> = {};
    partita.voti?.forEach((v) => {
      iniziale[v.giocatoreId] = String(v.voto);
    });
    return iniziale;
  });

  const compilati = useMemo(() => Object.values(voti).filter((v) => v.trim() !== "").length, [voti]);

  async function salva() {
    const payload: VotoPartita[] = [];
    for (const [giocatoreId, raw] of Object.entries(voti)) {
      if (raw.trim() === "") continue;
      const voto = Number(raw.replace(",", "."));
      if (!Number.isFinite(voto) || voto < VOTO_MINIMO || voto > VOTO_MASSIMO) {
        toast.error(`Voto non valido: deve essere tra ${VOTO_MINIMO} e ${VOTO_MASSIMO}`);
        return;
      }
      payload.push({ giocatoreId, voto });
    }

    setSalvataggio(true);
    try {
      const res = await fetch(`/api/admin/partite/${partita.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voti: payload }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success(payload.length ? `${payload.length} voti salvati` : "Voti azzerati");
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossibile salvare i voti");
    } finally {
      setSalvataggio(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-base font-bold">
            <ClipboardList className="size-4 text-primary-glow" /> Voti dei giocatori
          </p>
          <div className="flex items-center gap-2">
            {isPending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
            <Badge variant="muted">{compilati} assegnati</Badge>
          </div>
        </div>

        <p className="-mt-2 text-xs text-muted-foreground">
          Scala da {VOTO_MINIMO} a {VOTO_MASSIMO}, anche con mezzo punto (es. 6.5). Le caselle lasciate vuote non
          entrano nelle medie di Miglior giocatore e Miglior portiere.
        </p>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ColonnaVoti squadra={casa} roster={rosterCasa} voti={voti} onChange={setVoti} />
          <ColonnaVoti squadra={trasferta} roster={rosterTrasferta} voti={voti} onChange={setVoti} />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button onClick={salva} disabled={salvataggio}>
            {salvataggio ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Salva i voti
          </Button>
          <Button variant="outline" onClick={() => setVoti({})} disabled={salvataggio || compilati === 0}>
            <Eraser className="size-4" /> Svuota tutto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ColonnaVoti({
  squadra,
  roster,
  voti,
  onChange,
}: {
  squadra: Squadra;
  roster: Giocatore[];
  voti: Record<string, string>;
  onChange: (aggiorna: (prev: Record<string, string>) => Record<string, string>) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <TeamCrest nome={squadra.nome} colors={squadra.coloriSociali} logoUrl={squadra.logoUrl} size={22} />
        <span className="font-semibold">{squadra.nomeBreve}</span>
      </div>

      {roster.length === 0 ? (
        <p className="py-4 text-xs text-muted-foreground">Nessun giocatore in rosa per questa squadra.</p>
      ) : (
        roster.map((g) => (
          <div key={g.id} className="flex items-center gap-2.5 rounded-xl px-1 py-1.5 hover:bg-white/[0.03]">
            <span className="font-score w-5 shrink-0 text-center text-xs font-bold text-muted-foreground">
              {g.numeroMaglia}
            </span>
            <PlayerAvatar nome={g.nome} cognome={g.cognome} fotoUrl={g.fotoUrl} size={30} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-semibold">
                <span className="truncate">
                  {g.nome} {g.cognome}
                </span>
                <UnderQuarantaStar eta={g.eta} size={11} />
              </p>
              <p className="text-[11px] text-muted-foreground">{g.ruolo}</p>
            </div>
            <Input
              type="number"
              inputMode="decimal"
              min={VOTO_MINIMO}
              max={VOTO_MASSIMO}
              step={0.5}
              placeholder="–"
              aria-label={`Voto di ${g.nome} ${g.cognome}`}
              value={voti[g.id] ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                onChange((prev) => ({ ...prev, [g.id]: value }));
              }}
              className="w-20 shrink-0 text-center font-score font-bold"
            />
          </div>
        ))
      )}
    </div>
  );
}
