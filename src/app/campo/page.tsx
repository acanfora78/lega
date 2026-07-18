import type { Metadata } from "next";
import { Container } from "@/components/shared/container";
import { PitchBackdrop, StadiumLights } from "@/components/brand/pitch-art";
import { Card, CardContent } from "@/components/ui/card";
import {
  Car,
  Coffee,
  DoorOpen,
  Droplets,
  MapPin,
  Navigation,
  Phone,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = { title: "Campo Sportivo Santa Teresa" };

const SERVIZI = [
  { icon: Car, titolo: "Parcheggio", descrizione: "Ampio parcheggio gratuito riservato a tesserati e pubblico, accesso da Via Passanti." },
  { icon: DoorOpen, titolo: "Spogliatoi", descrizione: "6 spogliatoi completi di docce, riservati alle squadre e alla terna arbitrale." },
  { icon: Coffee, titolo: "Bar & Ristoro", descrizione: "Punto ristoro aperto durante tutte le giornate di campionato, con terrazza vista campo." },
  { icon: Droplets, titolo: "Servizi igienici", descrizione: "Bagni pubblici accessibili, puliti e disponibili per tutta la durata degli eventi." },
];

const REGOLAMENTO = [
  "Accesso al terreno di gioco consentito solo a tesserati, staff e arbitri.",
  "Distinte da consegnare in segreteria almeno 30 minuti prima del calcio d'inizio.",
  "Divieto di fumo e di introduzione di vetro nell'area spogliatoi e a bordo campo.",
  "Rispetto delle decisioni arbitrali: ogni contestazione va rivolta con fair play.",
  "Il campo è di tutti: si richiede la massima cura di spogliatoi e strutture comuni.",
];

export default function CampoPage() {
  return (
    <Container className="flex flex-col gap-8 pt-6 sm:pt-10">
      <div className="relative overflow-hidden rounded-3xl bg-pitch-gradient">
        <div className="bg-aurora absolute inset-0 opacity-50 mix-blend-screen" />
        <PitchBackdrop />
        <StadiumLights />
        <div className="relative flex flex-col items-center gap-3 px-6 py-14 text-center sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold-bright">
            <MapPin className="size-3.5" /> Scafati (SA)
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">Campo Sportivo Santa Teresa</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            La casa della Lega Calcio Over 40. Un manto in erba sintetica di ultima generazione, tribune per il
            pubblico e un&apos;atmosfera che profuma di veri stadi, ogni singola giornata di campionato.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="relative aspect-video overflow-hidden rounded-2xl bg-pitch-gradient glass">
            <PitchBackdrop />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-4 lg:col-span-2">
          <h2 className="font-display text-xl font-bold tracking-tight">Come arrivare</h2>
          <Card>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-pitch-gradient sm:h-64">
                <PitchBackdrop />
                <Navigation className="relative size-8 text-gold-bright" />
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary-glow" />
                <div>
                  <p className="font-semibold">Via Passanti, 84018 Scafati (SA)</p>
                  <p className="text-muted-foreground">
                    A 5 minuti dall&apos;uscita autostradale Angri, ben collegato con l&apos;Agro Nocerino-Sarnese. Fermata bus
                    linea urbana a 200 metri dall&apos;ingresso principale.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="mt-2 font-display text-xl font-bold tracking-tight">Servizi</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SERVIZI.map((s) => (
              <Card key={s.titolo}>
                <CardContent className="flex items-start gap-3 p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary-glow">
                    <s.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{s.titolo}</p>
                    <p className="text-xs text-muted-foreground">{s.descrizione}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <p className="flex items-center gap-2 font-display text-base font-bold">
                <Phone className="size-4 text-primary-glow" /> Contatti
              </p>
              <p className="text-sm text-muted-foreground">Segreteria Lega Calcio Over 40</p>
              <p className="text-sm font-semibold">+39 081 XXX XXXX</p>
              <p className="text-sm font-semibold">info@legacalciooverquaranta.it</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-3 p-5">
              <p className="flex items-center gap-2 font-display text-base font-bold">
                <ScrollText className="size-4 text-primary-glow" /> Regolamento del campo
              </p>
              <ul className="flex flex-col gap-2.5">
                {REGOLAMENTO.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary-glow" />
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
