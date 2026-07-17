import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/shared/container";
import { PitchBackdrop } from "@/components/brand/pitch-art";
import { NewsCard } from "@/components/news/news-card";
import { Badge } from "@/components/ui/badge";
import { getArticoli, getArticoloBySlug, getSquadraById } from "@/lib/data";
import { formatDateIt } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return getArticoli().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticoloBySlug(slug);
  return a ? { title: a.titolo, description: a.sommario } : {};
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const articolo = getArticoloBySlug(slug);
  if (!articolo) notFound();

  const correlate = getArticoli().filter((a) => a.id !== articolo.id).slice(0, 3);

  return (
    <Container className="flex flex-col gap-6 pt-6 sm:pt-10">
      <Link href="/news" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary-glow">
        <ArrowLeft className="size-4" /> Tutte le news
      </Link>

      <div className="relative h-52 overflow-hidden rounded-3xl bg-pitch-gradient sm:h-72">
        <PitchBackdrop />
      </div>

      <article className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Badge variant={articolo.categoria === "comunicato" ? "gold" : "default"} className="w-fit capitalize">
          {articolo.categoria}
        </Badge>
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">{articolo.titolo}</h1>
        <p className="text-sm text-muted-foreground">
          {formatDateIt(articolo.pubblicatoIl, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} · {articolo.autore}
        </p>
        <p className="text-lg text-foreground/90">{articolo.sommario}</p>
        <div className="divider-fade h-px" />
        <p className="whitespace-pre-line leading-relaxed text-foreground/85">{articolo.contenuto}</p>

        {articolo.squadreCorrelate && articolo.squadreCorrelate.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {articolo.squadreCorrelate.map((id) => {
              const s = getSquadraById(id);
              if (!s) return null;
              return (
                <Link key={id} href={`/squadre/${s.slug}`}>
                  <Badge variant="outline">{s.nomeBreve}</Badge>
                </Link>
              );
            })}
          </div>
        )}
      </article>

      <section className="mt-4">
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Altre notizie</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {correlate.map((a) => (
            <NewsCard key={a.id} articolo={a} />
          ))}
        </div>
      </section>
    </Container>
  );
}
