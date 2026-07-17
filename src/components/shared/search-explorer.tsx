"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Shield, User2, CalendarDays, Newspaper, Handshake } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ricercaGlobale, type RisultatoRicerca } from "@/lib/data/search";

const ICONE: Record<RisultatoRicerca["tipo"], typeof Shield> = {
  squadra: Shield,
  giocatore: User2,
  partita: CalendarDays,
  news: Newspaper,
  sponsor: Handshake,
};

export function SearchExplorer() {
  const [query, setQuery] = useState("");
  const risultati = useMemo(() => ricercaGlobale(query), [query]);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca squadre, giocatori, partite, news..."
          className="h-13 pl-11 text-base"
        />
      </div>

      {query.trim() === "" ? (
        <p className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">
          Inizia a digitare per esplorare l&apos;intero universo della Lega Calcio Over 40.
        </p>
      ) : risultati.length === 0 ? (
        <p className="rounded-2xl glass p-8 text-center text-sm text-muted-foreground">Nessun risultato per &quot;{query}&quot;.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl glass">
          {risultati.map((r) => {
            const Icon = ICONE[r.tipo];
            return (
              <Link key={`${r.tipo}-${r.id}`} href={r.href} className="flex items-center gap-3 p-4 hover:bg-white/[0.04]">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-glow">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.titolo}</p>
                  {r.sottotitolo && <p className="truncate text-xs text-muted-foreground">{r.sottotitolo}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
