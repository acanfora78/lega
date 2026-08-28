import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { NewsCard } from "@/components/news/news-card";
import {
  AvvisoDiffidati,
  ConteggiCartellini,
  SqualificheAttive,
} from "@/components/news/tabellone-disciplinare";
import {
  getConteggiDisciplinariRisolti,
  getDiffidati,
  getSqualificheRisolte,
} from "@/lib/data/disciplina";
import { getArticoli, getGiornataCorrente, getStagioneAttuale } from "@/lib/data";
import { Gavel } from "lucide-react";

export const metadata: Metadata = {
  title: "Giudice Sportivo",
  description: "Squalifiche, diffide e conteggio cartellini della Lega Calcio Over 40.",
};

export default async function DisciplinarePage() {
  const [stagione, giornata] = await Promise.all([getStagioneAttuale(), getGiornataCorrente()]);
  const [squalifiche, conteggi, diffidati, articoli] = await Promise.all([
    getSqualificheRisolte(giornata),
    getConteggiDisciplinariRisolti(),
    getDiffidati(),
    getArticoli(),
  ]);

  const attive = squalifiche.filter((s) => s.attiva);
  const scontate = squalifiche.filter((s) => !s.attiva);
  const comunicati = articoli.filter((a) => a.categoria === "disciplinare").slice(0, 6);

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-gold-bright">Stagione {stagione.etichetta}</p>
        <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          <Gavel className="size-7 text-gold-bright" /> Giudice Sportivo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Squalifiche, diffide e conteggio cartellini. I totali si aggiornano da soli dai tabellini delle partite
          concluse.
        </p>
      </div>

      <AvvisoDiffidati diffidati={diffidati} />

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          Squalifiche in corso
          <span className="ml-2 text-xs font-normal text-muted-foreground">Giornata {giornata}</span>
        </h2>
        <SqualificheAttive squalifiche={attive} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Conteggio cartellini</h2>
        <ConteggiCartellini conteggi={conteggi} />
      </section>

      {comunicati.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Comunicati disciplinari</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {comunicati.map((a) => (
              <NewsCard key={a.id} articolo={a} />
            ))}
          </div>
        </section>
      )}

      {scontate.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-muted-foreground">
            Provvedimenti già scontati
          </h2>
          <div className="rounded-2xl glass p-4 text-xs text-muted-foreground">
            {scontate.map((s) => (
              <p key={s.id} className="border-b border-border/60 py-1.5 last:border-0">
                {s.giocatore ? (
                  <Link href={`/giocatori/${s.giocatore.id}`} className="font-semibold text-foreground hover:text-primary-glow">
                    {s.giocatore.nome} {s.giocatore.cognome}
                  </Link>
                ) : (
                  "Giocatore rimosso"
                )}
                {s.squadra && ` · ${s.squadra.nomeBreve}`} — {s.giornate}{" "}
                {s.giornate === 1 ? "giornata" : "giornate"}, fino alla giornata {s.giornataA}
              </p>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
