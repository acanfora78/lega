import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { PitchBackdrop, StadiumLights } from "@/components/brand/pitch-art";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCompetizioni } from "@/lib/data";
import { Trophy, ChevronRight, Swords } from "lucide-react";
import type { Competizione } from "@/lib/types";

export const metadata: Metadata = { title: "Competizioni" };

const TIPO_LABEL: Record<Competizione["tipo"], string> = {
  campionato: "Campionato",
  coppa: "Coppa",
  torneo_eliminazione: "Torneo a eliminazione",
  gironi: "Fase a gironi",
  gironi_piu_finale: "Gironi + fase finale",
  personalizzata: "Competizione",
};

const STATO_BADGE: Record<Competizione["stato"], "muted" | "live" | "success" | "outline"> = {
  bozza: "muted",
  in_corso: "live",
  conclusa: "success",
  archiviata: "outline",
};

export default async function CompetizioniPage() {
  const competizioni = (await getCompetizioni()).filter((c) => c.stato !== "bozza");

  return (
    <Container className="flex flex-col gap-8 pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
        <div className="bg-aurora absolute inset-0 opacity-50 mix-blend-screen" />
        <PitchBackdrop />
        <StadiumLights />
        <div className="relative flex flex-col items-center gap-3 px-6 py-14 text-center sm:py-20">
          <Swords className="size-8 text-gold-bright" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-bright">Oltre il campionato</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">Competizioni</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Coppe e tornei aggiuntivi della Lega, paralleli al campionato principale.
          </p>
        </div>
      </div>

      {competizioni.length === 0 ? (
        <div className="rounded-2xl glass p-12 text-center text-sm text-muted-foreground">
          Nessuna competizione aggiuntiva attiva al momento. La classifica del campionato principale resta in{" "}
          <Link href="/classifica" className="font-semibold text-primary-glow hover:underline">
            Classifica
          </Link>
          .
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          {competizioni.map((c) => (
            <Link key={c.id} href={`/competizioni/${c.slug}`}>
              <Card className="transition-colors hover:border-gold/30">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <Badge variant={STATO_BADGE[c.stato]} className="capitalize">
                        {c.stato.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">{TIPO_LABEL[c.tipo]}</Badge>
                    </div>
                    <p className="font-display text-xl font-bold">{c.nome}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{c.squadreIscritteIds.length} squadre iscritte</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary-glow">
                    <Trophy className="size-4" /> Vedi competizione <ChevronRight className="size-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </Container>
  );
}
